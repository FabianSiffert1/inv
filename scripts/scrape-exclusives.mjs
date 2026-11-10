import path from 'node:path'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { mapConcurrently } from './lib/collections.mjs'
import { cardsDirectory, dataDirectory, fileExists } from './lib/files.mjs'
import { get } from './lib/tcgdex.mjs'

const host = 'https://limitlesstcg.com'
const setCode = 'SVP'
const requestDelayMilliseconds = 750
const maximumAttempts = 4
const outputPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'exclusives', 'exclusives.json')
const cachePath = path.join(dataDirectory, 'limitless', `jp-${setCode}.json`)

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

const fetchHtml = async (url) => {
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(url, { signal: AbortSignal.timeout(30_000) }).catch((error) => error)
    if (response instanceof Response && response.ok) {
      return await response.text()
    }
    const isRetryable = !(response instanceof Response) || response.status == 429 || response.status >= 500
    if (!isRetryable || attempt >= maximumAttempts) {
      throw new Error(`${response instanceof Response ? response.status : response} for ${url}`)
    }
    await sleep(2000 * 2 ** attempt)
  }
}

const decodeEntities = (text) =>
  text
    .replace(/&amp;/g, '&')
    .replace(/&#0?39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')

const textOf = (html) =>
  decodeEntities(html.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()

const cardNumbersOfSet = (html) => {
  const numbers = [...html.matchAll(new RegExp(`href="/cards/jp/${setCode}/(\\d+)"`, 'g'))].map((match) => Number(match[1]))
  return [...new Set(numbers)].sort((a, b) => a - b)
}

const parseCard = (html, number) => {
  const name = textOf(html.match(/<span class="card-text-name">([\s\S]*?)<\/span>/)?.[1] ?? '')
  const title = textOf(html.match(/<p class="card-text-title">([\s\S]*?)<\/p>/)?.[1] ?? '')
  const hp = title.match(/(\d+) HP/)?.[1]
  const category = textOf(html.match(/<p class="card-text-type">([\s\S]*?)<\/p>/)?.[1] ?? '').split(' - ')[0]
  const illustrator = textOf(html.match(/<div class="card-text-section card-text-artist">([\s\S]*?)<\/div>/)?.[1] ?? '').replace(
    /^Illustrated by\s*/,
    ''
  )
  const image = html.match(/<div class="card-image">[\s\S]*?data-src="([^"]+)"/)?.[1]
  const versions = html.match(/<table class="card-prints-versions">([\s\S]*?)<\/table>/)?.[1] ?? ''
  const internationalPrints = [...versions.matchAll(/href="\/cards\/(?!jp\/)([^"?]+)"/g)].map((match) => match[1])
  return {
    id: `${setCode}-${number}`,
    language: 'ja',
    set: setCode,
    number: String(number),
    name,
    category,
    hp: hp == undefined ? undefined : Number(hp),
    illustrator: illustrator || undefined,
    image,
    source: `${host}/cards/jp/${setCode}/${number}`,
    internationalPrints
  }
}

const scrapeCards = async () => {
  if (!process.argv.includes('--refresh') && (await fileExists(cachePath))) {
    console.log(`Using cached scrape ${cachePath}, pass --refresh to scrape again`)
    return JSON.parse(await readFile(cachePath, 'utf8'))
  }
  const numbers = cardNumbersOfSet(await fetchHtml(`${host}/cards/jp/${setCode}`))
  console.log(`${setCode}: ${numbers.length} cards`)

  const cards = []
  for (const [index, number] of numbers.entries()) {
    await sleep(requestDelayMilliseconds)
    const card = parseCard(await fetchHtml(`${host}/cards/jp/${setCode}/${number}?translate=en`), number)
    cards.push(card)
    console.log(`[${index + 1}/${numbers.length}] #${number} ${card.name}: ${card.internationalPrints.length} international prints`)
  }
  await mkdir(path.dirname(cachePath), { recursive: true })
  await writeFile(cachePath, JSON.stringify(cards))
  return cards
}

const normalizedIllustrator = (name) => name?.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '') || undefined

const englishSetIdsByCode = async () => {
  const summaries = await get('sets')
  const details = await mapConcurrently(summaries, 8, (summary) => get(`sets/${encodeURIComponent(summary.id)}`).catch(() => undefined))
  return new Map(
    details.filter((detail) => detail?.abbreviation?.official != undefined).map((detail) => [detail.abbreviation.official, detail.id])
  )
}

const createIllustratorLookup = async () => {
  const setIds = await englishSetIdsByCode()
  const localCardsBySet = new Map()
  const cache = new Map()

  const localCardsOf = async (setId) => {
    if (!localCardsBySet.has(setId)) {
      const filePath = path.join(cardsDirectory, `${setId}.json`)
      const cards = (await fileExists(filePath)) ? JSON.parse(await readFile(filePath, 'utf8')) : []
      localCardsBySet.set(setId, new Map(cards.map((card) => [card.number.replace(/^0+(?=.)/, ''), card.artist])))
    }
    return localCardsBySet.get(setId)
  }

  return async (print) => {
    if (cache.has(print)) {
      return cache.get(print)
    }
    const [, code, number] = print.split('/')
    const setId = setIds.get(code)
    let illustrator
    if (setId != undefined) {
      illustrator = (await localCardsOf(setId)).get(number.replace(/^0+(?=.)/, ''))
      if (illustrator == undefined) {
        illustrator = await get(`sets/${encodeURIComponent(setId)}/${encodeURIComponent(number)}`)
          .then((card) => card.illustrator)
          .catch(() => undefined)
      }
    }
    cache.set(print, illustrator)
    return illustrator
  }
}

const classify = async (card, illustratorOf) => {
  if (card.internationalPrints.length == 0) {
    return { reason: 'text' }
  }
  const japaneseIllustrator = normalizedIllustrator(card.illustrator)
  const englishIllustrators = []
  for (const print of card.internationalPrints) {
    const illustrator = await illustratorOf(print)
    if (illustrator == undefined) {
      continue
    }
    if (normalizedIllustrator(illustrator) == japaneseIllustrator) {
      return undefined
    }
    englishIllustrators.push(illustrator)
  }
  if (japaneseIllustrator == undefined || englishIllustrators.length == 0) {
    return undefined
  }
  return { reason: 'artwork', englishIllustrators: [...new Set(englishIllustrators)] }
}

const main = async () => {
  const cards = await scrapeCards()
  const illustratorOf = await createIllustratorLookup()

  const exclusives = []
  for (const card of cards) {
    const classification = await classify(card, illustratorOf)
    if (classification != undefined) {
      const { internationalPrints, ...rest } = card
      exclusives.push({ ...rest, ...classification, ...(classification.reason == 'text' ? {} : { internationalPrints }) })
    }
  }

  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, `${JSON.stringify(exclusives, null, 2)}\n`)
  const countOf = (reason) => exclusives.filter((card) => card.reason == reason).length
  console.log(
    `${exclusives.length} of ${cards.length} cards are exclusive candidates (text: ${countOf('text')}, artwork: ${countOf('artwork')}), written to ${outputPath}`
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
