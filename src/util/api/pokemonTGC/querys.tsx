import { PokemonCard } from './model/PokemonCard'
import { PokemonSet, PokemonSetName, PokemonTCGSeries } from './model/PokemonSet'
import pokemonTCGAPI from './pokemonTCGAPI'

export const fetchAllSets = async (): Promise<PokemonSet[]> => {
  try {
    return await pokemonTCGAPI.set.all({ orderBy: 'releaseDate' })
  } catch (error) {
    console.error('Error fetching sets:', error)
    return []
  }
}
export const fetchAllSetsOfASeries = async (series: PokemonTCGSeries): Promise<PokemonSet[]> => {
  try {
    return await pokemonTCGAPI.set.all({ q: `!series:"${series}"`, orderBy: 'releaseDate' })
  } catch (error) {
    console.error('Error fetching sets:', error)
    return []
  }
}

export const fetchAllCardsOfASet = async (setName: PokemonSetName): Promise<PokemonCard[]> => {
  try {
    return await pokemonTCGAPI.card.all({
      q: `!set.name:"${setName}"`,
      orderBy: '-cardmarket.prices.trendPrice'
    })
  } catch (error) {
    console.error('Error fetching sets:', error)
    return []
  }
}

export const fetchSpecies = async (speciesName: string, setName?: string): Promise<PokemonCard[]> => {
  const argumentIsValidRegex = /[a-z0-9]/i
  const speciesNameIsValid = argumentIsValidRegex.test(speciesName) && /\S/.test(speciesName)
  let setNameisValid = false
  let queryParameter = ''

  if (typeof setName === 'string') {
    setNameisValid = argumentIsValidRegex.test(setName) && /\S/.test(setName)
  }

  switch (speciesNameIsValid) {
    case true:
      queryParameter = `name:"${speciesName}"`
      break
    case false:
      queryParameter = `name:"charizard"`
      break
  }
  switch (setNameisValid && typeof setName != 'undefined') {
    case true:
      queryParameter = queryParameter + ` set.name:"${setName}"`
      break
    case false:
      break
  }
  const args = {
    q: `${queryParameter}`,
    orderBy: '-cardmarket.prices.trendPrice',
    pageSize: 250,
    page: 0
  }
  try {
    return await pokemonTCGAPI.card.all(args)
  } catch (error) {
    console.error('Error fetching cards:', error)
    return []
  }
}
