import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { Pokemon } from './model/Pokemon'
import { PokemonCard } from './model/PokemonCard'
import { PokemonSet, PokemonSetName } from './model/PokemonSet'
import { fetchAllCardsOfASet, fetchCardsOfPokemon, fetchPokemonIndex, fetchSetsSnapshot, SetsSnapshot } from './querys'

const setsSnapshotStaleTime = 1000 * 60 * 60

const useSetsSnapshot = <TData = SetsSnapshot,>(select?: (snapshot: SetsSnapshot) => TData) =>
  useQuery<SetsSnapshot, Error, TData>({
    queryKey: ['sets', 'snapshot'],
    queryFn: ({ signal }) => fetchSetsSnapshot(signal),
    staleTime: setsSnapshotStaleTime,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    select
  })

export const useSnapshotCacheEviction = () => {
  const queryClient = useQueryClient()
  const { data: snapshot } = useSetsSnapshot()
  const generatedAt = snapshot?.generatedAt

  useEffect(() => {
    if (generatedAt == undefined) {
      return
    }
    queryClient.removeQueries({
      predicate: (query) => {
        const key = query.queryKey
        return key[0] != 'sets' && key[key.length - 1] != generatedAt
      }
    })
  }, [queryClient, generatedAt])
}

export const useAllSets = () => useSetsSnapshot<PokemonSet[]>((snapshot) => snapshot.sets)

export const useCardsOfSet = (setName?: PokemonSetName) => {
  const { data: snapshot } = useSetsSnapshot()
  const generatedAt = snapshot?.generatedAt
  const set = snapshot?.sets.find((candidate) => candidate.name == setName)

  return useQuery<PokemonCard[]>({
    queryKey: ['cards', 'set', setName, generatedAt],
    queryFn: ({ signal }) => fetchAllCardsOfASet(set?.id as string, signal),
    enabled: set != undefined,
    staleTime: Infinity
  })
}

export const useCardsOfSets = (setIds: string[]) => {
  const { data: snapshot } = useSetsSnapshot()
  const generatedAt = snapshot?.generatedAt

  return useQueries({
    queries: setIds.map((setId) => {
      const setName = snapshot?.sets.find((candidate) => candidate.id == setId)?.name
      return {
        queryKey: ['cards', 'set', setName, generatedAt],
        queryFn: ({ signal }: { signal?: AbortSignal }) => fetchAllCardsOfASet(setId, signal),
        enabled: setName != undefined,
        staleTime: Infinity
      }
    })
  })
}

export const usePokemonIndex = () => {
  const { data: snapshot } = useSetsSnapshot()
  const generatedAt = snapshot?.generatedAt

  return useQuery<Pokemon[]>({
    queryKey: ['pokemon', 'index', generatedAt],
    queryFn: ({ signal }) => fetchPokemonIndex(signal),
    enabled: generatedAt != undefined,
    staleTime: Infinity
  })
}

export const useCardsOfPokemon = (pokedexNumber?: number) => {
  const { data: snapshot } = useSetsSnapshot()
  const generatedAt = snapshot?.generatedAt

  return useQuery<PokemonCard[]>({
    queryKey: ['cards', 'pokemon', pokedexNumber, generatedAt],
    queryFn: ({ signal }) => fetchCardsOfPokemon(pokedexNumber as number, signal),
    enabled: pokedexNumber != undefined && generatedAt != undefined,
    staleTime: Infinity
  })
}
