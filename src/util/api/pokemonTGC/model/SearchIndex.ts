import { PokemonCard } from './PokemonCard'
import { PokemonSet } from './PokemonSet'

export interface SearchIndexEntry {
  id: string
  name: string
  germanName?: string
  setId: string
  number: string
  image?: string
  trendPrice?: number
  marketPrice?: number
  rarity?: string
  type?: string
}

export const searchPath = (query: string) => `/search?${new URLSearchParams({ q: query })}`

export const matchesSearchIndex = (entry: SearchIndexEntry, normalizedQuery: string): boolean =>
  entry.name.toLowerCase().includes(normalizedQuery) || (entry.germanName?.toLowerCase().includes(normalizedQuery) ?? false)

export const toLightCard = (entry: SearchIndexEntry, set: PokemonSet): PokemonCard => ({
  id: entry.id,
  name: entry.name,
  germanName: entry.germanName,
  set,
  number: entry.number,
  rarity: entry.rarity,
  types: entry.type == undefined ? undefined : [entry.type],
  images: { small: entry.image },
  cardmarket: entry.trendPrice == undefined ? undefined : { prices: { trendPrice: entry.trendPrice } },
  tcgplayer: entry.marketPrice == undefined ? undefined : { prices: { normal: { market: entry.marketPrice } } }
})
