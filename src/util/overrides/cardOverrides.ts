import { useQuery } from '@tanstack/react-query'

export interface CardOverrides {
  images: Record<string, string>
}

interface FirestoreStringValue {
  stringValue?: string
}

interface FirestoreDocument {
  fields?: {
    images?: {
      mapValue?: {
        fields?: Record<string, FirestoreStringValue>
      }
    }
  }
}

export const cardOverridesQueryKey = ['config', 'cardOverrides']

const documentUrl = `https://firestore.googleapis.com/v1/projects/${import.meta.env.VITE_FIREBASE_PROJECT_ID}/databases/(default)/documents/config/cardOverrides?key=${import.meta.env.VITE_FIREBASE_API_KEY}`

const emptyOverrides: CardOverrides = { images: {} }

const fetchCardOverrides = async (signal?: AbortSignal): Promise<CardOverrides> => {
  const response = await fetch(documentUrl, { signal })
  if (response.status == 404) {
    return emptyOverrides
  }
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} for card overrides`)
  }
  const document = (await response.json()) as FirestoreDocument
  const fields = document.fields?.images?.mapValue?.fields ?? {}
  return {
    images: Object.fromEntries(
      Object.entries(fields).flatMap(([cardId, value]) => (typeof value.stringValue == 'string' ? [[cardId, value.stringValue]] : []))
    )
  }
}

export const useCardOverrides = () =>
  useQuery({
    queryKey: cardOverridesQueryKey,
    queryFn: ({ signal }) => fetchCardOverrides(signal),
    staleTime: 1000 * 60 * 5
  })

export const storedOverridePrefix = 'local:'

export interface LocalOverrides {
  images: Record<string, { fileName: string; urlHash?: string }>
  originalAvailable: string[]
}

const emptyLocalOverrides: LocalOverrides = { images: {}, originalAvailable: [] }

const fetchLocalOverrides = async (signal?: AbortSignal): Promise<LocalOverrides> => {
  const response = await fetch('/data/overrides.json', { signal })
  if (response.status == 404) {
    return emptyLocalOverrides
  }
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} for local overrides`)
  }
  return { ...emptyLocalOverrides, ...((await response.json()) as Partial<LocalOverrides>) }
}

export const useLocalOverrides = () =>
  useQuery({
    queryKey: ['overrides', 'local'],
    queryFn: ({ signal }) => fetchLocalOverrides(signal),
    staleTime: 1000 * 60 * 5
  })

export const urlHashOf = async (url: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(url))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 10)
}

const useUrlHash = (url?: string) =>
  useQuery({
    queryKey: ['urlHash', url],
    queryFn: () => urlHashOf(url as string),
    enabled: url != undefined,
    staleTime: Infinity
  }).data

const localImagePath = (fileName: string) => `/data/images/overrides/${fileName}`

export interface ImageOverride {
  source: string
  isStored: boolean
  pendingUrl?: string
}

export const useImageOverride = (cardId: string): ImageOverride | undefined => {
  const value = useCardOverrides().data?.images[cardId]
  const local = useLocalOverrides().data?.images[cardId]
  const pendingUrl = value != undefined && !value.startsWith(storedOverridePrefix) ? value : undefined
  const urlHash = useUrlHash(pendingUrl)
  if (value == undefined) {
    return undefined
  }
  if (pendingUrl == undefined) {
    return { source: localImagePath(value.slice(storedOverridePrefix.length)), isStored: true }
  }
  if (local?.urlHash != undefined && local.urlHash == urlHash) {
    return { source: localImagePath(local.fileName), isStored: true, pendingUrl }
  }
  return { source: pendingUrl, isStored: false, pendingUrl }
}

export const useOriginalImageAvailable = (cardId: string): boolean => {
  const hasOverride = useCardOverrides().data?.images[cardId] != undefined
  const originalAvailable = useLocalOverrides().data?.originalAvailable.includes(cardId) ?? false
  return hasOverride && originalAvailable
}

export const isValidImageUrl = (value: string): boolean => {
  try {
    return new URL(value).protocol == 'https:'
  } catch {
    return false
  }
}
