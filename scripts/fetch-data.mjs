import { access, mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const host = 'https://api.tcgdex.net/v2'
const excludedSeries = new Set(['tcgp'])
const cardConcurrency = 8
const maximumAttempts = 5
const requestTimeoutMilliseconds = 30_000

const dataDirectory = fileURLToPath(new URL('../data', import.meta.url))
const cardsDirectory = path.join(dataDirectory, 'cards')
const spritesDirectory = path.join(dataDirectory, 'sprites')
const animatedSpritesDirectory = path.join(spritesDirectory, 'animated')
const pokemonDirectory = path.join(dataDirectory, 'pokemon')
const spriteHost = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon'
const animatedSpriteHost = `${spriteHost}/other/showdown`
const speciesNamesUrl = 'https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/pokemon_species_names.csv'
const englishLanguageId = '9'
const germanLanguageId = '6'

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

const get = async (resource, language = 'en') => {
  const url = `${host}/${language}/${resource}`
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(requestTimeoutMilliseconds) })
      if (response.ok) {
        return await response.json()
      }
      const isRetryable = response.status == 429 || response.status >= 500
      if (!isRetryable || attempt >= maximumAttempts) {
        throw new Error(`${response.status} ${response.statusText} for ${url}`)
      }
    } catch (error) {
      if (attempt >= maximumAttempts) {
        throw error
      }
    }
    await sleep(Math.min(1000 * 2 ** attempt, 30_000))
  }
}

const mapConcurrently = async (items, concurrency, mapper) => {
  const results = new Array(items.length)
  let nextIndex = 0
  const worker = async () => {
    while (nextIndex < items.length) {
      const index = nextIndex++
      results[index] = await mapper(items[index])
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker))
  return results
}

const price = (value) => (typeof value == 'number' && value > 0 ? value : undefined)

const camelCase = (key) => key.replace(/-([a-z0-9])/g, (_, character) => character.toUpperCase())

const toSet = (set, germanName, germanSeries) => ({
  id: set.id,
  name: set.name,
  germanName,
  series: set.serie.name,
  germanSeries,
  printedTotal: set.cardCount.official,
  total: set.cardCount.total,
  ptcgoCode: set.tcgOnline,
  releaseDate: set.releaseDate,
  images: {
    symbol: set.symbol ? `${set.symbol}.png` : undefined,
    logo: set.logo ? `${set.logo}.png` : undefined
  }
})

const toCardmarket = (cardmarket) =>
  cardmarket
    ? {
        url:
          cardmarket.idProduct != undefined
            ? `https://www.cardmarket.com/en/Pokemon/Products?idProduct=${cardmarket.idProduct}&language=1`
            : undefined,
        updatedAt: cardmarket.updated,
        prices: {
          averageSellPrice: price(cardmarket.avg),
          lowPrice: price(cardmarket.low),
          trendPrice: price(cardmarket.trend),
          avg1: price(cardmarket.avg1),
          avg7: price(cardmarket.avg7),
          avg30: price(cardmarket.avg30),
          reverseHoloSell: price(cardmarket['avg-holo']),
          reverseHoloLow: price(cardmarket['low-holo']),
          reverseHoloTrend: price(cardmarket['trend-holo']),
          reverseHoloAvg1: price(cardmarket['avg1-holo']),
          reverseHoloAvg7: price(cardmarket['avg7-holo']),
          reverseHoloAvg30: price(cardmarket['avg30-holo'])
        }
      }
    : undefined

const toTcgplayer = (tcgplayer) => {
  if (!tcgplayer) {
    return undefined
  }
  const { unit, updated, ...variants } = tcgplayer
  const entries = Object.entries(variants).filter(([, variant]) => variant && typeof variant == 'object')
  const productId = entries.map(([, variant]) => variant.productId).find((id) => id != undefined)
  return {
    url: productId != undefined ? `https://www.tcgplayer.com/product/${productId}` : undefined,
    updatedAt: updated,
    prices: Object.fromEntries(
      entries.map(([key, variant]) => [
        camelCase(key),
        {
          low: price(variant.lowPrice),
          mid: price(variant.midPrice),
          high: price(variant.highPrice),
          market: price(variant.marketPrice),
          directLow: price(variant.directLowPrice)
        }
      ])
    )
  }
}

const toCard = (card, set, germanNames) => ({
  id: card.id,
  name: card.name,
  germanName: germanNames.get(card.id),
  supertype: card.category,
  hp: card.hp?.toString(),
  types: card.types,
  evolvesFrom: card.evolveFrom,
  set,
  number: card.localId,
  artist: card.illustrator,
  rarity: card.rarity,
  flavorText: card.description,
  nationalPokedexNumbers: card.dexId,
  images: card.image ? { small: `${card.image}/low.webp`, large: `${card.image}/high.webp` } : {},
  tcgplayer: toTcgplayer(card.pricing?.tcgplayer),
  cardmarket: toCardmarket(card.pricing?.cardmarket)
})

const fetchGermanNames = async (setId) => {
  try {
    const germanSet = await get(`sets/${encodeURIComponent(setId)}`, 'de')
    return {
      setName: germanSet.name,
      seriesName: germanSet.serie?.name,
      cardNames: new Map((germanSet.cards ?? []).map((card) => [card.id, card.name]))
    }
  } catch {
    return { setName: undefined, seriesName: undefined, cardNames: new Map() }
  }
}

const byTrendPriceDescending = (a, b) => (b.cardmarket?.prices?.trendPrice ?? -1) - (a.cardmarket?.prices?.trendPrice ?? -1)

const readPreviousSets = async () => {
  try {
    const previous = JSON.parse(await readFile(path.join(dataDirectory, 'sets.json'), 'utf8'))
    return new Map(previous.sets.map((set) => [set.id, set]))
  } catch {
    return new Map()
  }
}

const writeJsonAtomically = async (filePath, value) => {
  const temporaryPath = `${filePath}.tmp`
  await writeFile(temporaryPath, JSON.stringify(value))
  await rename(temporaryPath, filePath)
}

const fileExists = async (filePath) => {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

const downloadFile = async (url, filePath) => {
  if (await fileExists(filePath)) {
    return true
  }
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(requestTimeoutMilliseconds) })
    if (!response.ok) {
      return false
    }
    const temporaryPath = `${filePath}.tmp`
    await writeFile(temporaryPath, Buffer.from(await response.arrayBuffer()))
    await rename(temporaryPath, filePath)
    return true
  } catch {
    return false
  }
}

const downloadSprite = (pokedexNumber) =>
  downloadFile(`${spriteHost}/${pokedexNumber}.png`, path.join(spritesDirectory, `${pokedexNumber}.png`))

const downloadAnimatedSprite = (pokedexNumber) =>
  downloadFile(`${animatedSpriteHost}/${pokedexNumber}.gif`, path.join(animatedSpritesDirectory, `${pokedexNumber}.gif`))

const parseCsvLine = (line) => {
  const fields = []
  let field = ''
  let isQuoted = false
  for (let index = 0; index < line.length; index++) {
    const character = line[index]
    if (isQuoted) {
      if (character == '"' && line[index + 1] == '"') {
        field += '"'
        index++
      } else if (character == '"') {
        isQuoted = false
      } else {
        field += character
      }
    } else if (character == '"') {
      isQuoted = true
    } else if (character == ',') {
      fields.push(field)
      field = ''
    } else {
      field += character
    }
  }
  fields.push(field)
  return fields
}

const fetchSpeciesNames = async () => {
  try {
    const response = await fetch(speciesNamesUrl, { signal: AbortSignal.timeout(requestTimeoutMilliseconds) })
    if (!response.ok) {
      return new Map()
    }
    const names = new Map()
    for (const line of (await response.text()).split('\n').slice(1)) {
      const [speciesId, languageId, name] = parseCsvLine(line.trim())
      if (!name || (languageId != englishLanguageId && languageId != germanLanguageId)) {
        continue
      }
      const entry = names.get(Number(speciesId)) ?? {}
      entry[languageId == englishLanguageId ? 'name' : 'germanName'] = name
      names.set(Number(speciesId), entry)
    }
    return names
  } catch {
    return new Map()
  }
}

const mostCommon = (values) => {
  const counts = new Map()
  values.filter((value) => value != undefined).forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1))
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].length - b[0].length)[0]?.[0]
}

const byReleaseDateDescending = (a, b) => b.set.releaseDate.localeCompare(a.set.releaseDate)

const writePokemonData = async (sets) => {
  const cardsOfPokemon = new Map()
  for (const set of sets) {
    const cards = JSON.parse(await readFile(path.join(cardsDirectory, `${set.id}.json`), 'utf8'))
    cards.forEach((card) =>
      card.nationalPokedexNumbers?.forEach((number) => {
        if (!cardsOfPokemon.has(number)) {
          cardsOfPokemon.set(number, [])
        }
        cardsOfPokemon.get(number).push(card)
      })
    )
  }

  const speciesNames = await fetchSpeciesNames()
  if (speciesNames.size == 0) {
    console.error('Species names unavailable, falling back to card names')
  }

  const pokemon = []
  for (const [number, cards] of [...cardsOfPokemon.entries()].sort((a, b) => a[0] - b[0])) {
    await writeJsonAtomically(path.join(pokemonDirectory, `${number}.json`), cards.sort(byReleaseDateDescending))
    const species = speciesNames.get(number)
    pokemon.push({
      number,
      name: species?.name ?? mostCommon(cards.map((card) => card.name)),
      germanName: species?.germanName ?? mostCommon(cards.map((card) => card.germanName)),
      type: mostCommon(cards.map((card) => card.types?.[0])),
      cardCount: cards.length
    })
  }
  await writeJsonAtomically(path.join(dataDirectory, 'pokemon.json'), pokemon)
  console.log(`Pokémon: ${pokemon.length} with cards`)
}

const main = async () => {
  await mkdir(cardsDirectory, { recursive: true })
  await mkdir(spritesDirectory, { recursive: true })
  await mkdir(animatedSpritesDirectory, { recursive: true })
  await mkdir(pokemonDirectory, { recursive: true })

  const previousSets = await readPreviousSets()
  const pokedexNumbers = new Set()
  const setSummaries = await get('sets')
  console.log(`Fetched ${setSummaries.length} set summaries`)

  const sets = []
  const failedSets = []
  for (const [index, summary] of setSummaries.entries()) {
    const progress = `[${index + 1}/${setSummaries.length}] ${summary.name}`
    try {
      const setDetail = await get(`sets/${encodeURIComponent(summary.id)}`)
      if (excludedSeries.has(setDetail.serie?.id) || setDetail.releaseDate == undefined) {
        console.log(`${progress}: skipped`)
        continue
      }
      const germanNames = await fetchGermanNames(setDetail.id)
      const set = toSet(setDetail, germanNames.setName, germanNames.seriesName)
      const cardDetails = await mapConcurrently(setDetail.cards ?? [], cardConcurrency, (card) =>
        get(`cards/${encodeURIComponent(card.id)}`)
      )
      const cards = cardDetails.map((card) => toCard(card, set, germanNames.cardNames)).sort(byTrendPriceDescending)
      await writeJsonAtomically(path.join(cardsDirectory, `${set.id}.json`), cards)
      cards.forEach((card) => card.nationalPokedexNumbers?.forEach((number) => pokedexNumbers.add(number)))
      sets.push(set)
      console.log(`${progress}: ${cards.length} cards`)
    } catch (error) {
      failedSets.push(summary.id)
      if (previousSets.has(summary.id)) {
        sets.push(previousSets.get(summary.id))
      }
      console.error(`${progress}: failed, keeping previous data`, error)
    }
  }

  sets.sort((a, b) => a.releaseDate.localeCompare(b.releaseDate))
  await writePokemonData(sets)
  await writeJsonAtomically(path.join(dataDirectory, 'sets.json'), { generatedAt: new Date().toISOString(), sets })

  const sortedPokedexNumbers = [...pokedexNumbers].sort((a, b) => a - b)
  const spriteResults = await mapConcurrently(sortedPokedexNumbers, cardConcurrency, downloadSprite)
  const missingSprites = sortedPokedexNumbers.filter((_, index) => !spriteResults[index])
  console.log(`Sprites: ${sortedPokedexNumbers.length - missingSprites.length}/${sortedPokedexNumbers.length} available`)
  if (missingSprites.length > 0) {
    console.error(`Missing sprites: ${missingSprites.join(', ')}`)
  }

  const animatedResults = await mapConcurrently(sortedPokedexNumbers, cardConcurrency, downloadAnimatedSprite)
  console.log(`Animated sprites: ${animatedResults.filter(Boolean).length}/${sortedPokedexNumbers.length} available`)

  if (failedSets.length > 0) {
    console.error(`Failed sets: ${failedSets.join(', ')}`)
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
