import { useEffect, useState } from 'react'
import { useQueryClient } from 'react-query'

export const useCachedSetNames = (): string[] => {
  const queryClient = useQueryClient()
  const [cachedSetNames, setCachedSetNames] = useState<string[]>([])

  useEffect(() => {
    const queryCache = queryClient.getQueryCache()

    const readCachedSetNames = () =>
      queryCache
        .getAll()
        .filter((query) => {
          const key = query.queryKey
          return Array.isArray(key) && key[0] == 'cards' && key[1] == 'set' && query.state.data != undefined
        })
        .map((query) => String((query.queryKey as unknown[])[2]))
        .sort()

    const syncCachedSetNames = () =>
      setCachedSetNames((previous) => {
        const next = readCachedSetNames()
        return previous.length == next.length && previous.every((name, index) => name == next[index]) ? previous : next
      })

    syncCachedSetNames()
    return queryCache.subscribe(syncCachedSetNames)
  }, [queryClient])

  return cachedSetNames
}
