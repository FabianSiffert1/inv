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
const artistsDirectory = path.join(dataDirectory, 'artists')
const spriteHost = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon'
const animatedSpriteHost = `${spriteHost}/other/showdown`
const speciesNamesUrl = 'https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/pokemon_species_names.csv'
const englishLanguageId = '9'
const germanLanguageId = '6'

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

class HttpError extends Error {
  constructor(status, statusText, url) {
    super(`${status} ${statusText} for ${url}`)
    this.status = status
  }
}

const isNotFound = (error) => error instanceof HttpError && error.status == 404

const get = async (resource, language = 'en') => {
  const url = `${host}/${language}/${resource}`
  for (let attempt = 1; ; attempt++) {
    let response
    try {
      response = await fetch(url, { signal: AbortSignal.timeout(requestTimeoutMilliseconds) })
    } catch (error) {
      if (attempt >= maximumAttempts) {
        throw error
      }
      await sleep(Math.min(1000 * 2 ** attempt, 30_000))
      continue
    }
    if (response.ok) {
      return await response.json()
    }
    const isRetryable = response.status == 429 || response.status >= 500
    if (!isRetryable || attempt >= maximumAttempts) {
      throw new HttpError(response.status, response.statusText, url)
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
    symbol: set.symbol ? `${set.symbol.replace('/univ/', '/en/')}.png` : undefined,
    logo: set.logo ? `${set.logo}.png` : undefined
  }
})

const cardmarketProductUrl = (idProduct) => `https://www.cardmarket.com/en/Pokemon/Products?idProduct=${idProduct}&language=1`

const toCardmarket = (cardmarket) =>
  cardmarket
    ? {
        url: cardmarket.idProduct != undefined ? cardmarketProductUrl(cardmarket.idProduct) : undefined,
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

const foilsOf = (card) => [...new Set((card.variants_detailed ?? []).map((variant) => variant.foil).filter((foil) => foil != undefined))]

const titleCase = (value) =>
  value
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const printLabel = (variant) => {
  const parts = [
    variant.foil
      ? `${titleCase(variant.foil)} Holo`
      : variant.type == 'reverse'
        ? 'Reverse Holo'
        : variant.type == 'holo'
          ? 'Holo'
          : 'Normal'
  ]
  if (variant.subtype != undefined && variant.subtype != 'unlimited') {
    parts.push(titleCase(variant.subtype))
  }
  if (variant.size != undefined && variant.size != 'standard') {
    parts.push(titleCase(variant.size))
  }
  parts.push(...(variant.stamp ?? []).map(titleCase))
  return parts.join(' · ')
}

const tcgPlayerVariantOfType = { normal: 'normal', holo: 'holofoil', reverse: 'reverseHolofoil' }

const marketPriceFor = (prices, type) => {
  const preferred = prices?.[tcgPlayerVariantOfType[type]]?.market
  return preferred ?? Object.values(prices ?? {}).map((priceSet) => priceSet.market)[0]
}

const printsOf = (card) => {
  const printsByLabel = new Map()
  for (const variant of card.variants_detailed ?? []) {
    const label = printLabel(variant)
    const print = printsByLabel.get(label) ?? { label }
    const cardmarket = variant.pricing?.cardmarket
    const trendPrice = price(variant.type == 'reverse' ? cardmarket?.['trend-holo'] : cardmarket?.trend)
    if (cardmarket?.idProduct != undefined && print.cardmarket == undefined) {
      print.cardmarket = { url: cardmarketProductUrl(cardmarket.idProduct), trendPrice }
    } else if (trendPrice != undefined && print.cardmarket != undefined) {
      print.cardmarket.lowestTrendPrice = Math.min(
        print.cardmarket.lowestTrendPrice ?? print.cardmarket.trendPrice ?? trendPrice,
        trendPrice
      )
      print.cardmarket.highestTrendPrice = Math.max(
        print.cardmarket.highestTrendPrice ?? print.cardmarket.trendPrice ?? trendPrice,
        trendPrice
      )
    }
    const tcgplayer = toTcgplayer(variant.pricing?.tcgplayer)
    if (tcgplayer?.url != undefined && print.tcgplayer == undefined) {
      print.tcgplayer = { url: tcgplayer.url, marketPrice: marketPriceFor(tcgplayer.prices, variant.type) }
    }
    printsByLabel.set(label, print)
  }
  const prints = [...printsByLabel.values()]
  return prints.length > 1 ? prints : undefined
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
  variants: card.variants,
  foils: foilsOf(card),
  prints: printsOf(card),
  images: card.image ? { small: `${card.image}/low.webp`, large: `${card.image}/high.webp` } : {},
  tcgplayer: toTcgplayer(card.pricing?.tcgplayer),
  cardmarket: toCardmarket(card.pricing?.cardmarket)
})

const cardNumberCollator = new Intl.Collator('en', { numeric: true })

const cardmarketSearchUrl = (card, set) => {
  const searchString = [card.name, set.ptcgoCode, card.number].filter((part) => part != undefined).join(' ')
  return `https://www.cardmarket.com/en/Pokemon/Products/Search?searchString=${encodeURIComponent(searchString)}`
}

const withoutSharedCardmarketProducts = (cards, set) => {
  const cardsOfProduct = groupBy(cards, (card) => (card.cardmarket?.url == undefined ? [] : [card.cardmarket.url]))
  cardsOfProduct.forEach((sharing) => {
    if (sharing.length < 2) {
      return
    }
    const [, ...others] = [...sharing].sort((a, b) => cardNumberCollator.compare(a.number, b.number))
    others.forEach((card) => {
      card.cardmarket = { url: cardmarketSearchUrl(card, set) }
    })
  })
  return cards
}

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

const readCardsOfSets = async (sets) => {
  const cardsOfSets = await Promise.all(sets.map((set) => readFile(path.join(cardsDirectory, `${set.id}.json`), 'utf8')))
  return cardsOfSets.flatMap((json) => JSON.parse(json))
}

const groupBy = (items, keysOf) => {
  const groups = new Map()
  items.forEach((item) =>
    keysOf(item).forEach((key) => {
      if (!groups.has(key)) {
        groups.set(key, [])
      }
      groups.get(key).push(item)
    })
  )
  return groups
}

const writePokemonData = async (allCards) => {
  const cardsOfPokemon = groupBy(allCards, (card) => card.nationalPokedexNumbers ?? [])

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

const unknownArtist = 'N/A'

const artistSlug = (name) =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const artistSlugsOf = (card) => {
  const name = card.artist?.trim()
  if (!name || name == unknownArtist) {
    return []
  }
  const slug = artistSlug(name)
  return slug == '' ? [] : [slug]
}

const byCardCountDescendingThenName = (a, b) => b.cardCount - a.cardCount || a.name.localeCompare(b.name)

const writeArtistData = async (allCards) => {
  const cardsOfArtist = groupBy(allCards, artistSlugsOf)

  const artists = []
  for (const [slug, cards] of cardsOfArtist.entries()) {
    await writeJsonAtomically(path.join(artistsDirectory, `${slug}.json`), cards.sort(byReleaseDateDescending))
    const topCard = [...cards].sort(byTrendPriceDescending)[0]
    artists.push({
      slug,
      name: mostCommon(cards.map((card) => card.artist.trim())),
      cardCount: cards.length,
      setCount: new Set(cards.map((card) => card.set.id)).size,
      pokemonNumber: mostCommon(cards.flatMap((card) => card.nationalPokedexNumbers ?? [])),
      topCardImage: topCard?.images.small,
      topCardType: topCard?.types?.[0]
    })
  }
  artists.sort(byCardCountDescendingThenName)
  await writeJsonAtomically(path.join(dataDirectory, 'artists.json'), artists)
  console.log(`Artists: ${artists.length}`)
}

const searchMarketVariantOrder = [
  'normal',
  'holofoil',
  'reverseHolofoil',
  'unlimited',
  'unlimitedHolofoil',
  '1stEdition',
  '1stEditionHolofoil'
]

const searchMarketPrice = (tcgplayer) => {
  for (const variant of searchMarketVariantOrder) {
    const priceSet = tcgplayer?.prices?.[variant]
    const marketPrice = priceSet?.market ?? priceSet?.mid
    if (marketPrice != undefined) {
      return marketPrice
    }
  }
  return undefined
}

const toSearchEntry = (card) => ({
  id: card.id,
  name: card.name,
  germanName: card.germanName,
  setId: card.set.id,
  number: card.number,
  image: card.images.small,
  trendPrice: card.cardmarket?.prices?.trendPrice,
  marketPrice: searchMarketPrice(card.tcgplayer),
  rarity: card.rarity,
  type: card.types?.[0]
})

const writeSearchIndex = async (allCards) => {
  await writeJsonAtomically(path.join(dataDirectory, 'search.json'), allCards.map(toSearchEntry))
  console.log(`Search index: ${allCards.length} cards`)
}

const main = async () => {
  await mkdir(cardsDirectory, { recursive: true })
  await mkdir(spritesDirectory, { recursive: true })
  await mkdir(animatedSpritesDirectory, { recursive: true })
  await mkdir(pokemonDirectory, { recursive: true })
  await mkdir(artistsDirectory, { recursive: true })

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
      const cardDetails = await mapConcurrently(setDetail.cards ?? [], cardConcurrency, async (card) => {
        try {
          return await get(`cards/${encodeURIComponent(card.id)}`)
        } catch (error) {
          if (isNotFound(error)) {
            console.error(`${progress}: card ${card.id} not found, skipped`)
            return undefined
          }
          throw error
        }
      })
      const cards = withoutSharedCardmarketProducts(
        cardDetails.filter((card) => card != undefined).map((card) => toCard(card, set, germanNames.cardNames)),
        set
      ).sort(byTrendPriceDescending)
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
  const allCards = await readCardsOfSets(sets)
  await writePokemonData(allCards)
  await writeArtistData(allCards)
  await writeSearchIndex(allCards)
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
