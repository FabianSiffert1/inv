export type PokemonTCGSeries = string
export type PokemonSetName = string

export interface PokemonSet {
  id: string
  name: PokemonSetName
  germanName?: string
  series: PokemonTCGSeries
  germanSeries?: string
  printedTotal: number
  total: number
  legalities?: {
    unlimited?: string
  }
  ptcgoCode?: string
  releaseDate: string
  updatedAt?: string
  images: {
    symbol?: string
    logo?: string
  }
  cardImageBase?: string
  cardImageFormat?: 'webp' | 'png'
}

export const japaneseExclusivesSeries: PokemonTCGSeries = 'Japanese Exclusives'

export const setPath = (setId: string) => `/market?${new URLSearchParams({ set: setId })}`

export const cardPath = (setId: string, cardId: string) => `/market?${new URLSearchParams({ set: setId, card: cardId })}`
