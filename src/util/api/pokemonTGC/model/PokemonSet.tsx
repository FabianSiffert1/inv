export type PokemonTCGSeries = string
export type PokemonSetName = string

export interface PokemonSet {
  id: string
  name: PokemonSetName
  germanName?: string
  series: PokemonTCGSeries
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
}
