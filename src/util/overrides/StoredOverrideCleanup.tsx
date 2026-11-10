import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { cardOverridesQueryKey, storedOverridePrefix, urlHashOf, useCardOverrides, useLocalOverrides } from './cardOverrides'

export default function StoredOverrideCleanup() {
  const queryClient = useQueryClient()
  const { data: overrides } = useCardOverrides()
  const { data: localOverrides } = useLocalOverrides()

  useEffect(() => {
    if (overrides == undefined || localOverrides == undefined) {
      return
    }
    const candidates = Object.entries(overrides.images).filter(
      ([cardId, value]) => !value.startsWith(storedOverridePrefix) && localOverrides.images[cardId]?.urlHash != undefined
    )
    if (candidates.length == 0) {
      return
    }
    let cancelled = false
    Promise.all(
      candidates.map(async ([cardId, url]): Promise<[string, string] | undefined> => {
        const local = localOverrides.images[cardId]
        return (await urlHashOf(url)) == local.urlHash ? [cardId, `${storedOverridePrefix}${local.fileName}`] : undefined
      })
    )
      .then(async (entries) => {
        const stored = entries.filter((entry): entry is [string, string] => entry != undefined)
        if (cancelled || stored.length == 0) {
          return
        }
        const module = await import('./cloudOverrides')
        await module.markOverridesStored(Object.fromEntries(stored))
        await queryClient.invalidateQueries({ queryKey: cardOverridesQueryKey })
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [overrides, localOverrides, queryClient])

  return null
}
