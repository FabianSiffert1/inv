export interface Generation {
  number: number
  numeral: string
  region: string
  germanRegion?: string
  firstPokedexNumber: number
  lastPokedexNumber: number
}

export const generations: Generation[] = [
  { number: 1, numeral: 'I', region: 'Kanto', firstPokedexNumber: 1, lastPokedexNumber: 151 },
  { number: 2, numeral: 'II', region: 'Johto', firstPokedexNumber: 152, lastPokedexNumber: 251 },
  { number: 3, numeral: 'III', region: 'Hoenn', firstPokedexNumber: 252, lastPokedexNumber: 386 },
  { number: 4, numeral: 'IV', region: 'Sinnoh', firstPokedexNumber: 387, lastPokedexNumber: 493 },
  { number: 5, numeral: 'V', region: 'Unova', germanRegion: 'Einall', firstPokedexNumber: 494, lastPokedexNumber: 649 },
  { number: 6, numeral: 'VI', region: 'Kalos', firstPokedexNumber: 650, lastPokedexNumber: 721 },
  { number: 7, numeral: 'VII', region: 'Alola', firstPokedexNumber: 722, lastPokedexNumber: 809 },
  { number: 8, numeral: 'VIII', region: 'Galar', firstPokedexNumber: 810, lastPokedexNumber: 905 },
  { number: 9, numeral: 'IX', region: 'Paldea', firstPokedexNumber: 906, lastPokedexNumber: 1025 }
]

export const generationByNumber = (number?: number): Generation | undefined => generations.find((generation) => generation.number == number)

export const isInGeneration = (pokedexNumber: number, generation: Generation): boolean =>
  pokedexNumber >= generation.firstPokedexNumber && pokedexNumber <= generation.lastPokedexNumber

export const generationOfPokemon = (pokedexNumber: number): Generation | undefined =>
  generations.find((generation) => isInGeneration(pokedexNumber, generation))

export const generationLabel = (generation: Generation, germanNames: boolean): string =>
  `Gen ${generation.numeral} · ${germanNames ? (generation.germanRegion ?? generation.region) : generation.region}`

export const generationPath = (generation: Generation) => `/pokemon?generation=${generation.number}`
