import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const host = 'https://api.tcgdex.net/v2'
const excludedSeries = new Set(['tcgp'])
const cardConcurrency = 8
const maximumAttempts = 5
const requestTimeoutMilliseconds = 30_000

const dataDirectory = fileURLToPath(new URL('../data', import.meta.url))
const cardsDirectory = path.join(dataDirectory, 'cards')

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

const toSet = (set, germanName) => ({
  id: set.id,
  name: set.name,
  germanName,
  series: set.serie.name,
  printedTotal: set.cardCount.official,
  total: set.cardCount.total,
  ptcgoCode: set.tcgOnline,
  releaseDate: set.releaseDate,
  images: {
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
    return { setName: germanSet.name, cardNames: new Map((germanSet.cards ?? []).map((card) => [card.id, card.name])) }
  } catch {
    return { setName: undefined, cardNames: new Map() }
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

const main = async () => {
  await mkdir(cardsDirectory, { recursive: true })

  const previousSets = await readPreviousSets()
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
      const set = toSet(setDetail, germanNames.setName)
      const cardDetails = await mapConcurrently(setDetail.cards ?? [], cardConcurrency, (card) =>
        get(`cards/${encodeURIComponent(card.id)}`)
      )
      const cards = cardDetails.map((card) => toCard(card, set, germanNames.cardNames)).sort(byTrendPriceDescending)
      await writeJsonAtomically(path.join(cardsDirectory, `${set.id}.json`), cards)
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
  await writeJsonAtomically(path.join(dataDirectory, 'sets.json'), { generatedAt: new Date().toISOString(), sets })

  if (failedSets.length > 0) {
    console.error(`Failed sets: ${failedSets.join(', ')}`)
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
