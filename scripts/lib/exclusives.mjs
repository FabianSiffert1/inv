import path from 'node:path'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { mapConcurrently } from './collections.mjs'
import { cardsDirectory, dataDirectory, fileExists, writeJsonAtomically } from './files.mjs'
import { get } from './tcgdex.mjs'

const exclusivesFile = fileURLToPath(new URL('../exclusives/exclusives.json', import.meta.url))
const imagesDirectory = path.join(dataDirectory, 'images')

const japanesePromoSet = {
  id: 'svp-ja',
  name: 'Japanese SV Promos',
  germanName: 'Japanische Karmesin & Purpur Promos',
  series: 'Scarlet & Violet',
  germanSeries: 'Karmesin & Purpur',
  releaseDate: '2022-11-29',
  images: {}
}

export const exclusiveSetIds = new Set([japanesePromoSet.id])

const tcgdexIdOf = (exclusive) => `SV-P-${exclusive.number.padStart(3, '0')}`

const imageSizes = [
  { name: 'low', suffix: '_SM' },
  { name: 'high', suffix: '_LG' }
]

const downloadImages = async (exclusive, setId) => {
  const directory = path.join(imagesDirectory, setId, exclusive.number)
  const images = {}
  for (const size of imageSizes) {
    const filePath = path.join(directory, `${size.name}.png`)
    if (!(await fileExists(filePath))) {
      const url = exclusive.image.replace(/\.png$/, `${size.suffix}.png`)
      const response = await fetch(url, { signal: AbortSignal.timeout(30_000) })
      if (!response.ok) {
        console.error(`Exclusive ${exclusive.id}: image ${url} returned ${response.status}`)
        continue
      }
      await mkdir(directory, { recursive: true })
      await writeFile(filePath, Buffer.from(await response.arrayBuffer()))
    }
    images[size.name == 'low' ? 'small' : 'large'] = `/data/images/${setId}/${exclusive.number}/${size.name}.png`
  }
  return images
}

const toExclusiveCard = (exclusive, detail, set, images) => ({
  id: `${set.id}-${exclusive.number}`,
  name: exclusive.name,
  language: exclusive.language,
  supertype: detail?.category ?? exclusive.category,
  hp: (detail?.hp ?? exclusive.hp)?.toString(),
  types: detail?.types,
  set,
  number: exclusive.number,
  artist: exclusive.illustrator ?? detail?.illustrator,
  rarity: detail?.rarity,
  nationalPokedexNumbers: detail?.dexId,
  variants: detail?.variants,
  images
})

export const writeExclusiveSets = async () => {
  const exclusives = JSON.parse(await readFile(exclusivesFile, 'utf8'))
  const set = { ...japanesePromoSet, printedTotal: exclusives.length, total: exclusives.length }
  const cards = await mapConcurrently(exclusives, 4, async (exclusive) => {
    const detail = await get(`cards/${encodeURIComponent(tcgdexIdOf(exclusive))}`, 'ja').catch((error) => {
      console.error(`Exclusive ${exclusive.id}: no TCGdex details`, error.message)
      return undefined
    })
    const images = exclusive.image == undefined ? {} : await downloadImages(exclusive, set.id)
    return toExclusiveCard(exclusive, detail, set, images)
  })
  cards.sort((a, b) => Number(a.number) - Number(b.number))
  await writeJsonAtomically(path.join(cardsDirectory, `${set.id}.json`), cards)
  console.log(`${set.name}: ${cards.length} cards`)
  return [{ ...set, cardImageBase: `/data/images/${set.id}`, cardImageFormat: 'png' }]
}
