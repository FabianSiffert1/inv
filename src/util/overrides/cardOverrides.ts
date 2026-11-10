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

export const useImageOverride = (cardId: string): string | undefined => useCardOverrides().data?.images[cardId]

export const isValidImageUrl = (value: string): boolean => {
  try {
    return new URL(value).protocol == 'https:'
  } catch {
    return false
  }
}
