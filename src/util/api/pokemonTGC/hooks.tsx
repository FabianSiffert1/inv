import { useQuery } from 'react-query'
import { PokemonCard } from './model/PokemonCard'
import { PokemonSet, PokemonSetName } from './model/PokemonSet'
import { fetchAllCardsOfASet, fetchAllSets } from './querys'

export const useAllSets = () => useQuery<PokemonSet[]>(['sets'], fetchAllSets)

export const useCardsOfSet = (setName?: PokemonSetName) =>
  useQuery<PokemonCard[]>(['cards', 'set', setName], () => fetchAllCardsOfASet(setName as PokemonSetName), {
    enabled: setName != undefined
  })
