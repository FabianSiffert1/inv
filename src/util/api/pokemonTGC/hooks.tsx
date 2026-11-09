import { useQueries, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query'
import { useEffect } from 'react'
import { defaultEurPerUsd } from '../../format/price'
import { Artist } from './model/Artist'
import { Pokemon } from './model/Pokemon'
import { PokemonCard } from './model/PokemonCard'
import { PokemonSet, PokemonSetName } from './model/PokemonSet'
import { prepareSearchIndex, SearchableEntry, SearchIndexEntry } from './model/SearchIndex'
import {
  fetchAllCardsOfASet,
  fetchArtistIndex,
  fetchCardsOfArtist,
  fetchCardsOfPokemon,
  fetchPokemonIndex,
  fetchSearchIndex,
  fetchSetsSnapshot,
  SetsSnapshot
} from './querys'
import { setIdsOfGroup } from './setGroups'

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

export const useEurPerUsd = (): number => useSetsSnapshot((snapshot) => snapshot.eurPerUsd).data ?? defaultEurPerUsd

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

const cardsOfSetQuery = (setId: string, snapshot?: SetsSnapshot) => {
  const setName = snapshot?.sets.find((candidate) => candidate.id == setId)?.name
  return {
    queryKey: ['cards', 'set', setName, snapshot?.generatedAt],
    queryFn: ({ signal }: { signal?: AbortSignal }) => fetchAllCardsOfASet(setId, signal),
    enabled: setName != undefined,
    staleTime: Infinity
  }
}

export const useCardsOfSets = (setIds: string[]) => {
  const { data: snapshot } = useSetsSnapshot()

  return useQueries({
    queries: setIds.map((setId) => cardsOfSetQuery(setId, snapshot))
  })
}

const combineSetGroupQueries = (results: UseQueryResult<PokemonCard[]>[]) => {
  const [mainSetResult] = results
  return {
    data:
      mainSetResult?.data == undefined || results.some((result) => result.isPending && result.fetchStatus != 'idle')
        ? undefined
        : results.flatMap((result) => result.data ?? []),
    isFetching: results.some((result) => result.isFetching),
    error: mainSetResult?.error ?? null
  }
}

export const useCardsOfSetGroup = (setId?: string) => {
  const { data: snapshot } = useSetsSnapshot()

  return useQueries({
    queries: (setId == undefined ? [] : setIdsOfGroup(setId)).map((groupSetId) => cardsOfSetQuery(groupSetId, snapshot)),
    combine: combineSetGroupQueries
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

export const useArtistIndex = () => {
  const { data: snapshot } = useSetsSnapshot()
  const generatedAt = snapshot?.generatedAt

  return useQuery<Artist[]>({
    queryKey: ['artists', 'index', generatedAt],
    queryFn: ({ signal }) => fetchArtistIndex(signal),
    enabled: generatedAt != undefined,
    staleTime: Infinity
  })
}

export const useCardsOfArtist = (slug?: string) => {
  const { data: snapshot } = useSetsSnapshot()
  const generatedAt = snapshot?.generatedAt

  return useQuery<PokemonCard[]>({
    queryKey: ['cards', 'artist', slug, generatedAt],
    queryFn: ({ signal }) => fetchCardsOfArtist(slug as string, signal),
    enabled: slug != undefined && generatedAt != undefined,
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

export const useSearchIndex = (enabled: boolean) => {
  const { data: snapshot } = useSetsSnapshot()
  const generatedAt = snapshot?.generatedAt

  return useQuery<SearchIndexEntry[], Error, SearchableEntry[]>({
    queryKey: ['search', 'index', generatedAt],
    queryFn: ({ signal }) => fetchSearchIndex(signal),
    select: prepareSearchIndex,
    enabled: enabled && generatedAt != undefined,
    staleTime: Infinity
  })
}
