import { exclusiveSetIds, writeExclusiveSets } from './lib/exclusives.mjs'
import { ensureDirectories, readCardsOfSets, readSetsSnapshot, writeSetsSnapshot } from './lib/files.mjs'
import { writeIndexes } from './lib/indexes.mjs'

const main = async () => {
  await ensureDirectories()
  const snapshot = await readSetsSnapshot()
  const sets = [...snapshot.sets.filter((set) => !exclusiveSetIds.has(set.id)), ...(await writeExclusiveSets())]
  sets.sort((a, b) => a.releaseDate.localeCompare(b.releaseDate))
  await writeIndexes(await readCardsOfSets(sets))
  await writeSetsSnapshot(sets, { generatedAt: snapshot.generatedAt, eurPerUsd: snapshot.eurPerUsd })
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
