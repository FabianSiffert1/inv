import path from 'node:path'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { mapConcurrently } from './collections.mjs'
import { cardsDirectory, dataDirectory, fileExists, writeJsonAtomically } from './files.mjs'
import { fetchSpeciesNames, get } from './tcgdex.mjs'

export const promoSeries = [
  {
    code: 'MP',
    setId: 'mp-ja',
    name: 'Japanese Mega Promos',
    germanName: 'Japanische Mega-Promos',
    series: 'Mega Evolution',
    tcgdexSetId: 'M-P'
  },
  {
    code: 'SVP',
    setId: 'svp-ja',
    name: 'Japanese SV Promos',
    germanName: 'Japanische Karmesin & Purpur Promos',
    series: 'Scarlet & Violet',
    tcgdexSetId: 'SV-P'
  },
  {
    code: 'SP',
    setId: 'swshp-ja',
    name: 'Japanese SwSh Promos',
    germanName: 'Japanische Schwert & Schild Promos',
    series: 'Sword & Shield'
  },
  { code: 'SMP', setId: 'smp-ja', name: 'Japanese SM Promos', germanName: 'Japanische Sonne & Mond Promos', series: 'Sun & Moon' },
  { code: 'XYP', setId: 'xyp-ja', name: 'Japanese XY Promos', germanName: 'Japanische XY Promos', series: 'XY' },
  { code: 'BWP', setId: 'bwp-ja', name: 'Japanese BW Promos', germanName: 'Japanische Schwarz & Weiß Promos', series: 'Black & White' }
]

export const exclusivesSeries = 'Japanese Exclusives'
export const exclusivesGermanSeries = 'Japanische Exklusivkarten'

export const exclusiveSetIds = new Set(promoSeries.map((series) => series.setId))

export const limitlessCacheDirectory = path.join(dataDirectory, 'limitless')
export const candidatesDirectory = path.join(dataDirectory, 'exclusives')
export const limitlessCachePathOf = (code) => path.join(limitlessCacheDirectory, `jp-${code}.json`)
export const candidatesPathOf = (code) => path.join(candidatesDirectory, `${code}.json`)

const cardNumberCollator = new Intl.Collator('en', { numeric: true })
const correctionsFile = fileURLToPath(new URL('../exclusives/corrections.json', import.meta.url))
const imagesDirectory = path.join(dataDirectory, 'images')

const readJsonIfExists = async (filePath) => ((await fileExists(filePath)) ? JSON.parse(await readFile(filePath, 'utf8')) : undefined)

const readCorrections = async () => {
  const corrections = (await readJsonIfExists(correctionsFile)) ?? {}
  return { exclude: new Set(corrections.exclude ?? []), include: new Set(corrections.include ?? []) }
}

const imageSizes = [
  { name: 'low', suffix: '_SM', field: 'small' },
  { name: 'high', suffix: '_LG', field: 'large' }
]

const downloadImages = async (exclusive, setId) => {
  if (exclusive.image == undefined) {
    return {}
  }
  const directory = path.join(imagesDirectory, setId, exclusive.number)
  const images = {}
  for (const size of imageSizes) {
    const filePath = path.join(directory, `${size.name}.png`)
    if (!(await fileExists(filePath))) {
      const url = exclusive.image.replace(/\.png$/, `${size.suffix}.png`)
      const response = await fetch(url, { signal: AbortSignal.timeout(30_000) }).catch(() => undefined)
      if (!response?.ok) {
        console.error(`Exclusive ${exclusive.id}: image ${url} failed with ${response?.status ?? 'no response'}`)
        continue
      }
      await mkdir(directory, { recursive: true })
      await writeFile(filePath, Buffer.from(await response.arrayBuffer()))
    }
    images[size.field] = `/data/images/${setId}/${exclusive.number}/${size.name}.png`
  }
  return images
}

const createSpeciesLookup = async () => {
  const speciesNames = await fetchSpeciesNames()
  const species = [...speciesNames.entries()]
    .filter(([, names]) => names.name != undefined)
    .map(([number, names]) => ({ number, name: names.name, germanName: names.germanName, pattern: names.name.toLowerCase() }))
    .sort((a, b) => b.pattern.length - a.pattern.length)
  const isWordCharacter = (character) => character != undefined && /[\p{L}\p{N}]/u.test(character)
  return (cardName) => {
    const name = cardName.toLowerCase()
    return species.find((entry) => {
      const index = name.indexOf(entry.pattern)
      return index >= 0 && !isWordCharacter(name[index - 1]) && !isWordCharacter(name[index + entry.pattern.length])
    })
  }
}

const supertypeOf = (category) => (category == 'Pokémon' ? 'Pokemon' : category || undefined)

const toExclusiveCard = (exclusive, detail, species, set, images) => {
  const supertype = detail?.category ?? supertypeOf(exclusive.category)
  const isPokemon = supertype == 'Pokemon'
  return {
    id: `${set.id}-${exclusive.number}`,
    name: exclusive.name,
    germanName: isPokemon && species != undefined && species.name == exclusive.name ? species.germanName : undefined,
    language: 'ja',
    supertype,
    hp: (detail?.hp ?? exclusive.hp)?.toString(),
    types: detail?.types ?? exclusive.types,
    set,
    number: exclusive.number,
    artist: exclusive.illustrator ?? detail?.illustrator,
    rarity: detail?.rarity ?? 'Promo',
    nationalPokedexNumbers: detail?.dexId ?? (isPokemon && species != undefined ? [species.number] : undefined),
    images
  }
}

const exclusivesOf = async (series, corrections) => {
  const candidates = await readJsonIfExists(candidatesPathOf(series.code))
  if (candidates == undefined) {
    return undefined
  }
  const scraped = (await readJsonIfExists(limitlessCachePathOf(series.code))) ?? []
  const included = scraped.filter((card) => corrections.include.has(card.id))
  const byId = new Map([...candidates, ...included].map((card) => [card.id, card]))
  return [...byId.values()].filter((card) => !corrections.exclude.has(card.id))
}

const earliestSetOfSeries = (referenceSets, seriesName) =>
  referenceSets.filter((set) => set.series == seriesName).sort((a, b) => a.releaseDate.localeCompare(b.releaseDate))[0]

export const writeExclusiveSets = async (referenceSets) => {
  const corrections = await readCorrections()
  let speciesOf
  const sets = []
  for (const series of promoSeries) {
    const exclusives = await exclusivesOf(series, corrections)
    if (exclusives == undefined || exclusives.length == 0) {
      continue
    }
    const reference = earliestSetOfSeries(referenceSets, series.series)
    if (reference == undefined) {
      console.error(`${series.name}: no English set of series ${series.series}, skipped`)
      continue
    }
    speciesOf ??= await createSpeciesLookup()
    const set = {
      id: series.setId,
      name: series.name,
      germanName: series.germanName,
      series: exclusivesSeries,
      germanSeries: exclusivesGermanSeries,
      printedTotal: exclusives.length,
      total: exclusives.length,
      releaseDate: reference.releaseDate,
      images: {}
    }
    const cards = await mapConcurrently(exclusives, 4, async (exclusive) => {
      const detail =
        series.tcgdexSetId == undefined
          ? undefined
          : await get(`cards/${encodeURIComponent(`${series.tcgdexSetId}-${exclusive.number.padStart(3, '0')}`)}`, 'ja').catch(
              () => undefined
            )
      const images = await downloadImages(exclusive, set.id)
      return toExclusiveCard(exclusive, detail, speciesOf(exclusive.name), set, images)
    })
    cards.sort((a, b) => cardNumberCollator.compare(a.number, b.number))
    await writeJsonAtomically(path.join(cardsDirectory, `${set.id}.json`), cards)
    console.log(`${set.name}: ${cards.length} cards`)
    sets.push({ ...set, cardImageBase: `/data/images/${set.id}`, cardImageFormat: 'png' })
  }
  return sets
}
