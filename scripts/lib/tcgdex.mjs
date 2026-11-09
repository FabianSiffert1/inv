import path from 'node:path'
import { rename, writeFile } from 'node:fs/promises'
import { animatedSpritesDirectory, fileExists, spritesDirectory } from './files.mjs'

const host = 'https://api.tcgdex.net/v2'
const maximumAttempts = 5
const requestTimeoutMilliseconds = 30_000
const spriteHost = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon'
const animatedSpriteHost = `${spriteHost}/other/showdown`
const speciesNamesUrl = 'https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/pokemon_species_names.csv'
const exchangeRateUrl = 'https://api.frankfurter.dev/v1/latest?base=USD&symbols=EUR'
const englishLanguageId = '9'
const germanLanguageId = '6'

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

export class HttpError extends Error {
  constructor(status, statusText, url) {
    super(`${status} ${statusText} for ${url}`)
    this.status = status
  }
}

export const isNotFound = (error) => error instanceof HttpError && error.status == 404

export const get = async (resource, language = 'en') => {
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

export const fetchGermanNames = async (setId) => {
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

export const downloadSprite = (pokedexNumber) =>
  downloadFile(`${spriteHost}/${pokedexNumber}.png`, path.join(spritesDirectory, `${pokedexNumber}.png`))

export const downloadAnimatedSprite = (pokedexNumber) =>
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

export const fetchEurPerUsd = async () => {
  try {
    const response = await fetch(exchangeRateUrl, { signal: AbortSignal.timeout(requestTimeoutMilliseconds) })
    if (!response.ok) {
      return undefined
    }
    const rate = (await response.json()).rates?.EUR
    return typeof rate == 'number' && rate > 0 ? rate : undefined
  } catch {
    return undefined
  }
}

export const fetchSpeciesNames = async () => {
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
