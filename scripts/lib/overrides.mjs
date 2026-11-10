import { createHash } from 'node:crypto'
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { dataDirectory, fileExists, readCardsOfSets, readSetsSnapshot, writeJsonAtomically } from './files.mjs'

const envFile = fileURLToPath(new URL('../../.env', import.meta.url))
const overridesDirectory = path.join(dataDirectory, 'images', 'overrides')
const manifestFile = path.join(dataDirectory, 'overrides.json')
const requestTimeoutMilliseconds = 30_000

const extensionsByContentType = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp'
}

const readEnv = async () => {
  const values = { ...process.env }
  if (await fileExists(envFile)) {
    for (const line of (await readFile(envFile, 'utf8')).split('\n')) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
      if (match && values[match[1]] == undefined) {
        values[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2')
      }
    }
  }
  return values
}

const fetchImageOverrides = async () => {
  const env = await readEnv()
  const projectId = env.VITE_FIREBASE_PROJECT_ID
  const apiKey = env.VITE_FIREBASE_API_KEY
  if (!projectId || !apiKey) {
    throw new Error('VITE_FIREBASE_PROJECT_ID and VITE_FIREBASE_API_KEY are needed to read card overrides')
  }
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/config/cardOverrides?key=${apiKey}`
  const response = await fetch(url, { signal: AbortSignal.timeout(requestTimeoutMilliseconds) })
  if (response.status == 404) {
    return {}
  }
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} reading card overrides`)
  }
  const fields = (await response.json()).fields?.images?.mapValue?.fields ?? {}
  return Object.fromEntries(
    Object.entries(fields).flatMap(([cardId, value]) => (typeof value.stringValue == 'string' ? [[cardId, value.stringValue]] : []))
  )
}

const storedPrefix = 'local:'

const urlHashOf = (url) => createHash('sha1').update(url).digest('hex').slice(0, 10)

const fileNameOf = (cardId, urlHash, extension) => `${cardId.replace(/[^A-Za-z0-9.-]/g, '_')}-${urlHash}.${extension}`

const readManifest = async () => ((await fileExists(manifestFile)) ? JSON.parse(await readFile(manifestFile, 'utf8')) : { images: {} })

const downloadImage = async (cardId, url, urlHash) => {
  const response = await fetch(url, { signal: AbortSignal.timeout(requestTimeoutMilliseconds) }).catch(() => undefined)
  if (!response?.ok) {
    console.error(`Override ${cardId}: download failed with ${response?.status ?? 'no response'}`)
    return undefined
  }
  const contentType = response.headers.get('content-type')?.split(';')[0].trim()
  const extension = extensionsByContentType[contentType]
  if (extension == undefined) {
    console.error(`Override ${cardId}: download is ${contentType ?? 'of unknown type'}, not a PNG, JPEG or WebP image`)
    return undefined
  }
  const fileName = fileNameOf(cardId, urlHash, extension)
  await mkdir(overridesDirectory, { recursive: true })
  await writeFile(path.join(overridesDirectory, fileName), Buffer.from(await response.arrayBuffer()))
  return fileName
}

const isImageAvailable = async (url) => {
  const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(requestTimeoutMilliseconds) }).catch(() => undefined)
  return response?.ok == true && response.headers.get('content-type')?.startsWith('image/') == true
}

const originalImagesOf = async (cardIds) => {
  const snapshot = await readSetsSnapshot()
  const cards = await readCardsOfSets(snapshot.sets)
  const wanted = new Set(cardIds)
  return new Map(cards.filter((card) => wanted.has(card.id)).map((card) => [card.id, card.images.large ?? card.images.small]))
}

export const syncImageOverrides = async () => {
  const overrides = await fetchImageOverrides()
  const previous = await readManifest()
  const images = {}

  for (const [cardId, value] of Object.entries(overrides)) {
    if (value.startsWith(storedPrefix)) {
      const fileName = value.slice(storedPrefix.length)
      if (await fileExists(path.join(overridesDirectory, fileName))) {
        images[cardId] = { fileName }
      } else {
        console.error(`Override ${cardId}: stored file ${fileName} is missing`)
      }
      continue
    }
    const urlHash = urlHashOf(value)
    const stored = previous.images?.[cardId]
    if (stored?.urlHash == urlHash && (await fileExists(path.join(overridesDirectory, stored.fileName)))) {
      images[cardId] = stored
      continue
    }
    const fileName = await downloadImage(cardId, value, urlHash)
    if (fileName != undefined) {
      images[cardId] = { fileName, urlHash }
    }
  }

  const keptFiles = new Set(Object.values(images).map((image) => image.fileName))
  const existingFiles = (await fileExists(overridesDirectory)) ? await readdir(overridesDirectory) : []
  await Promise.all(existingFiles.filter((file) => !keptFiles.has(file)).map((file) => rm(path.join(overridesDirectory, file))))

  const originalImages = await originalImagesOf(Object.keys(overrides))
  const originalAvailable = []
  for (const cardId of Object.keys(overrides)) {
    const original = originalImages.get(cardId)
    if (original?.startsWith('http') && (await isImageAvailable(original))) {
      originalAvailable.push(cardId)
      console.log(`Override ${cardId}: the API now has a working image`)
    }
  }

  await writeJsonAtomically(manifestFile, { images, originalAvailable })
  console.log(`Image overrides: ${Object.keys(images).length}/${Object.keys(overrides).length} stored locally`)
}
