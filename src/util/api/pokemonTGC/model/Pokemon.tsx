export interface Pokemon {
  number: number
  name: string
  germanName?: string
  cardCount: number
}

export const spriteUrl = (pokedexNumber: number) => `/data/sprites/${pokedexNumber}.png`

export const pokemonPath = (pokedexNumber: number) => `/pokemon/${pokedexNumber}`
