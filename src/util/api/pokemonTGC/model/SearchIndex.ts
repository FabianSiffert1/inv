import { PokemonCard } from './PokemonCard'
import { PokemonSet } from './PokemonSet'

export interface SearchIndexEntry {
  id: string
  name: string
  germanName?: string
  setId: string
  number: string
  noImage?: boolean
  trendPrice?: number
  marketPrice?: number
  rarity?: string
  type?: string
}

export interface SearchableEntry extends SearchIndexEntry {
  haystack: string
}

export const searchPath = (query: string) => `/search?${new URLSearchParams({ q: query })}`

export const prepareSearchIndex = (entries: SearchIndexEntry[]): SearchableEntry[] =>
  entries.map((entry) => ({ ...entry, haystack: `${entry.name}\n${entry.germanName ?? ''}\n${entry.rarity ?? ''}`.toLowerCase() }))

export const matchesSearchIndex = (entry: SearchableEntry, normalizedQuery: string): boolean => entry.haystack.includes(normalizedQuery)

export const toLightCard = (entry: SearchIndexEntry, set: PokemonSet): PokemonCard => ({
  id: entry.id,
  name: entry.name,
  germanName: entry.germanName,
  set,
  number: entry.number,
  rarity: entry.rarity,
  types: entry.type == undefined ? undefined : [entry.type],
  images: {
    small:
      entry.noImage || set.cardImageBase == undefined
        ? undefined
        : `${set.cardImageBase}/${entry.number}/low.${set.cardImageFormat ?? 'webp'}`
  },
  cardmarket: entry.trendPrice == undefined ? undefined : { prices: { trendPrice: entry.trendPrice } },
  tcgplayer: entry.marketPrice == undefined ? undefined : { prices: { normal: { market: entry.marketPrice } } }
})
