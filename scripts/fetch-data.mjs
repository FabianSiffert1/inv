import { mkdir, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const host = 'https://api.pokemontcg.io/v2'
const apiKey = process.env.POKEMON_TCG_API_KEY
const pageSize = 250
const maximumPages = 40
const maximumAttempts = 5
const requestTimeoutMilliseconds = 60_000

const dataDirectory = fileURLToPath(new URL('../data', import.meta.url))
const cardsDirectory = path.join(dataDirectory, 'cards')

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

const get = async (type, args) => {
  const url = `${host}/${type}?${new URLSearchParams(args)}`
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(url, {
        headers: apiKey ? { 'X-Api-Key': apiKey } : {},
        signal: AbortSignal.timeout(requestTimeoutMilliseconds)
      })
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
    await sleep(Math.min(2000 * 2 ** attempt, 60_000))
  }
}

const all = async (type, args) => {
  const collected = []
  for (let page = 1; page <= maximumPages; page++) {
    const response = await get(type, { ...args, page, pageSize })
    collected.push(...response.data)

    const totalCount = response.totalCount
    const receivedPageSize = response.pageSize ?? pageSize
    if (totalCount == undefined || totalCount == 0 || receivedPageSize * page >= totalCount) {
      break
    }
  }
  return collected
}

const writeJsonAtomically = async (filePath, value) => {
  const temporaryPath = `${filePath}.tmp`
  await writeFile(temporaryPath, JSON.stringify(value))
  await rename(temporaryPath, filePath)
}

const main = async () => {
  await mkdir(cardsDirectory, { recursive: true })

  const sets = await all('sets', { orderBy: 'releaseDate' })
  console.log(`Fetched ${sets.length} sets`)

  const failedSets = []
  for (const [index, set] of sets.entries()) {
    try {
      const cards = await all('cards', { q: `set.id:"${set.id}"`, orderBy: '-cardmarket.prices.trendPrice' })
      await writeJsonAtomically(path.join(cardsDirectory, `${set.id}.json`), cards)
      console.log(`[${index + 1}/${sets.length}] ${set.name}: ${cards.length} cards`)
    } catch (error) {
      failedSets.push(set.id)
      console.error(`[${index + 1}/${sets.length}] ${set.name}: failed, keeping previous data`, error)
    }
  }

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
