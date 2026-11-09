import { cardImageBaseOf } from './lib/cards.mjs'
import { ensureDirectories, readCardsOfSets, readSetsSnapshot, writeSetsSnapshot } from './lib/files.mjs'
import { writeIndexes } from './lib/indexes.mjs'

const main = async () => {
  await ensureDirectories()
  const snapshot = await readSetsSnapshot()
  const allCards = await readCardsOfSets(snapshot.sets)
  const cardsBySet = new Map()
  allCards.forEach((card) => {
    const cards = cardsBySet.get(card.set.id) ?? []
    cards.push(card)
    cardsBySet.set(card.set.id, cards)
  })
  snapshot.sets.forEach((set) => {
    set.cardImageBase = cardImageBaseOf(cardsBySet.get(set.id) ?? [])
  })
  await writeIndexes(allCards)
  await writeSetsSnapshot(snapshot.sets, { generatedAt: snapshot.generatedAt, eurPerUsd: snapshot.eurPerUsd })
  console.log(`Indexes rebuilt from ${snapshot.sets.length} sets, snapshot from ${snapshot.generatedAt}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
