export interface Artist {
  slug: string
  name: string
  cardCount: number
  setCount: number
  pokemonNumber?: number
  topCardImage?: string
  topCardType?: string
}

export const artistPath = (slug: string) => `/artists/${slug}`
