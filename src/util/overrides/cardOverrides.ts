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

interface LocalOverrides {
  images: Record<string, { url: string; file: string }>
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

const useLocalOverrides = () =>
  useQuery({
    queryKey: ['overrides', 'local'],
    queryFn: ({ signal }) => fetchLocalOverrides(signal),
    staleTime: 1000 * 60 * 5
  })

export const useRemoteImageOverride = (cardId: string): string | undefined => useCardOverrides().data?.images[cardId]

export const useImageOverride = (cardId: string): string | undefined => {
  const remote = useRemoteImageOverride(cardId)
  const local = useLocalOverrides().data?.images[cardId]
  if (remote == undefined) {
    return undefined
  }
  return local?.url == remote ? local.file : remote
}

export const useOriginalImageAvailable = (cardId: string): boolean => {
  const hasOverride = useRemoteImageOverride(cardId) != undefined
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
