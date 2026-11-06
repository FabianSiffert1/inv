import path from 'node:path'
import { byTrendPriceDescending, cardImageBaseOf, toCard, toSet, withoutSharedCardmarketProducts } from './lib/cards.mjs'
import { mapConcurrently } from './lib/collections.mjs'
import {
  cardsDirectory,
  ensureDirectories,
  readCardsOfSets,
  readPreviousSets,
  writeJsonAtomically,
  writeSetsSnapshot
} from './lib/files.mjs'
import { writeIndexes } from './lib/indexes.mjs'
import { downloadAnimatedSprite, downloadSprite, fetchGermanNames, get, isNotFound } from './lib/tcgdex.mjs'

const excludedSeries = new Set(['tcgp'])
const cardConcurrency = 8

const fetchSet = async (summary, progress) => {
  const setDetail = await get(`sets/${encodeURIComponent(summary.id)}`)
  if (excludedSeries.has(setDetail.serie?.id) || setDetail.releaseDate == undefined) {
    return undefined
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
  set.cardImageBase = cardImageBaseOf(cards)
  return { set, cards }
}

const downloadSprites = async (pokedexNumbers) => {
  const sortedPokedexNumbers = [...pokedexNumbers].sort((a, b) => a - b)
  const spriteResults = await mapConcurrently(sortedPokedexNumbers, cardConcurrency, downloadSprite)
  const missingSprites = sortedPokedexNumbers.filter((_, index) => !spriteResults[index])
  console.log(`Sprites: ${sortedPokedexNumbers.length - missingSprites.length}/${sortedPokedexNumbers.length} available`)
  if (missingSprites.length > 0) {
    console.error(`Missing sprites: ${missingSprites.join(', ')}`)
  }

  const animatedResults = await mapConcurrently(sortedPokedexNumbers, cardConcurrency, downloadAnimatedSprite)
  console.log(`Animated sprites: ${animatedResults.filter(Boolean).length}/${sortedPokedexNumbers.length} available`)
}

const main = async () => {
  await ensureDirectories()

  const previousSets = await readPreviousSets()
  const pokedexNumbers = new Set()
  const setSummaries = await get('sets')
  console.log(`Fetched ${setSummaries.length} set summaries`)

  const sets = []
  const failedSets = []
  for (const [index, summary] of setSummaries.entries()) {
    const progress = `[${index + 1}/${setSummaries.length}] ${summary.name}`
    try {
      const result = await fetchSet(summary, progress)
      if (result == undefined) {
        console.log(`${progress}: skipped`)
        continue
      }
      result.cards.forEach((card) => card.nationalPokedexNumbers?.forEach((number) => pokedexNumbers.add(number)))
      sets.push(result.set)
      console.log(`${progress}: ${result.cards.length} cards`)
    } catch (error) {
      failedSets.push(summary.id)
      if (previousSets.has(summary.id)) {
        sets.push(previousSets.get(summary.id))
      }
      console.error(`${progress}: failed, keeping previous data`, error)
    }
  }

  sets.sort((a, b) => a.releaseDate.localeCompare(b.releaseDate))
  await writeIndexes(await readCardsOfSets(sets))
  await writeSetsSnapshot(sets)
  await downloadSprites(pokedexNumbers)

  if (failedSets.length > 0) {
    console.error(`Failed sets: ${failedSets.join(', ')}`)
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
