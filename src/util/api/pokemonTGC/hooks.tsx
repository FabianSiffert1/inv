import { useQuery } from 'react-query'
import { PokemonCard } from './model/PokemonCard'
import { PokemonSet, PokemonSetName, PokemonTCGSeries } from './model/PokemonSet'
import { fetchAllCardsOfASet, fetchAllSets, fetchAllSetsOfASeries, fetchSpecies } from './querys'

export const useAllSets = () => useQuery<PokemonSet[]>(['sets'], fetchAllSets)

export const useSetsOfSeries = (series?: PokemonTCGSeries) =>
  useQuery<PokemonSet[]>(['sets', series], () => fetchAllSetsOfASeries(series as PokemonTCGSeries), {
    enabled: series != undefined
  })

export const useCardsOfSet = (setName?: PokemonSetName) =>
  useQuery<PokemonCard[]>(['cards', 'set', setName], () => fetchAllCardsOfASet(setName as PokemonSetName), {
    enabled: setName != undefined
  })

export const useSpecies = (speciesName: string, setName?: string) =>
  useQuery<PokemonCard[]>(['cards', 'species', speciesName, setName], () => fetchSpecies(speciesName, setName))
