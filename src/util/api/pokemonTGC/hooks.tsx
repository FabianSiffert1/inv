import { useEffect } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { PokemonCard } from './model/PokemonCard'
import { PokemonSet, PokemonSetName } from './model/PokemonSet'
import { fetchAllCardsOfASet, fetchSetsSnapshot, SetsSnapshot } from './querys'

const setsSnapshotStaleTime = 1000 * 60 * 60

const useSetsSnapshot = <TData = SetsSnapshot,>(select?: (snapshot: SetsSnapshot) => TData) =>
  useQuery<SetsSnapshot, unknown, TData>(['sets', 'snapshot'], ({ signal }) => fetchSetsSnapshot(signal), {
    staleTime: setsSnapshotStaleTime,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    select
  })

export const useAllSets = () => useSetsSnapshot<PokemonSet[]>((snapshot) => snapshot.sets)

export const useCardsOfSet = (setName?: PokemonSetName) => {
  const queryClient = useQueryClient()
  const { data: snapshot } = useSetsSnapshot()
  const generatedAt = snapshot?.generatedAt
  const set = snapshot?.sets.find((candidate) => candidate.name == setName)

  useEffect(() => {
    if (generatedAt == undefined) {
      return
    }
    queryClient.removeQueries({
      predicate: (query) => {
        const key = query.queryKey
        return Array.isArray(key) && key[0] == 'cards' && key[1] == 'set' && key[3] != generatedAt
      }
    })
  }, [queryClient, generatedAt])

  return useQuery<PokemonCard[]>(['cards', 'set', setName, generatedAt], ({ signal }) => fetchAllCardsOfASet(set?.id as string, signal), {
    enabled: set != undefined,
    staleTime: Infinity
  })
}
