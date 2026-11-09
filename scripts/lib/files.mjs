import { access, mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const dataDirectory = fileURLToPath(new URL('../../data', import.meta.url))
export const cardsDirectory = path.join(dataDirectory, 'cards')
export const spritesDirectory = path.join(dataDirectory, 'sprites')
export const animatedSpritesDirectory = path.join(spritesDirectory, 'animated')
export const pokemonDirectory = path.join(dataDirectory, 'pokemon')
export const artistsDirectory = path.join(dataDirectory, 'artists')
export const setsFile = path.join(dataDirectory, 'sets.json')

export const ensureDirectories = async () => {
  for (const directory of [cardsDirectory, spritesDirectory, animatedSpritesDirectory, pokemonDirectory, artistsDirectory]) {
    await mkdir(directory, { recursive: true })
  }
}

export const writeJsonAtomically = async (filePath, value) => {
  const temporaryPath = `${filePath}.tmp`
  await writeFile(temporaryPath, JSON.stringify(value))
  await rename(temporaryPath, filePath)
}

export const fileExists = async (filePath) => {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

export const readSetsSnapshot = async () => JSON.parse(await readFile(setsFile, 'utf8'))

export const readPreviousSets = async () => {
  try {
    const previous = await readSetsSnapshot()
    return new Map(previous.sets.map((set) => [set.id, set]))
  } catch {
    return new Map()
  }
}

export const readCardsOfSets = async (sets) => {
  const cardsOfSets = await Promise.all(sets.map((set) => readFile(path.join(cardsDirectory, `${set.id}.json`), 'utf8')))
  return cardsOfSets.flatMap((json) => JSON.parse(json))
}

export const writeSetsSnapshot = (sets, { generatedAt = new Date().toISOString(), eurPerUsd } = {}) =>
  writeJsonAtomically(setsFile, { generatedAt, eurPerUsd, sets })
