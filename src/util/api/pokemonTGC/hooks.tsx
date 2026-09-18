import { useQuery } from 'react-query'
import { PokemonCard } from './model/PokemonCard'
import { PokemonSet, PokemonSetName } from './model/PokemonSet'
import { fetchAllCardsOfASet, fetchAllSets } from './querys'

export const useAllSets = () => useQuery<PokemonSet[]>(['sets'], ({ signal }) => fetchAllSets(signal))

export const useCardsOfSet = (setName?: PokemonSetName) =>
  useQuery<PokemonCard[]>(['cards', 'set', setName], ({ signal }) => fetchAllCardsOfASet(setName as PokemonSetName, signal), {
    enabled: setName != undefined
  })
