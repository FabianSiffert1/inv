export interface Pokemon {
  number: number
  name: string
  germanName?: string
  type?: string
  cardCount: number
}

export const spriteUrl = (pokedexNumber: number) => `/data/sprites/${pokedexNumber}.png`

export const pokemonPath = (pokedexNumber: number) => `/pokemon/${pokedexNumber}`

export const animatedSpriteUrl = (pokedexNumber: number) => `/data/sprites/animated/${pokedexNumber}.gif`
