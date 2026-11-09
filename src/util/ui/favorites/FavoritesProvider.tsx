import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { PokemonCard } from '../../api/pokemonTGC/model/PokemonCard'
import { AuthContext } from '../../auth/AuthProvider'
import { FavoritesError } from '../language/strings'
import { Favorite, favoriteKey } from './Favorite'
import { rememberFavoriteSetIds } from './favoriteSets'
import { readLocalFavorites, writeLocalFavorites } from './localFavorites'

export type { Favorite } from './Favorite'

export type FavoritesSource = 'local' | 'cloud'

export interface PendingMerge {
  count: number
  confirm: () => void
  dismiss: () => void
}

interface ContextProps {
  favorites: Favorite[]
  source: FavoritesSource
  isLoading: boolean
  error?: FavoritesError
  pendingMerge?: PendingMerge
  isFavorite: (cardId: string, print?: string) => boolean
  toggleFavorite: (card: PokemonCard, print?: string) => void
}

export const FavoritesContext = createContext<ContextProps>({
  favorites: [],
  source: 'local',
  isLoading: false,
  isFavorite: () => false,
  toggleFavorite: () => {}
})

interface Props {
  children?: React.ReactNode
}

type CloudFavorites = typeof import('./cloudFavorites')

const FavoritesProvider: React.FC<Props> = ({ children }) => {
  const { status, user } = useContext(AuthContext)
  const uid = status == 'signedIn' ? user?.uid : undefined

  const [localFavorites, setLocalFavorites] = useState(readLocalFavorites)
  const [cloudFavorites, setCloudFavorites] = useState<Favorite[] | undefined>(undefined)
  const [error, setError] = useState<FavoritesError | undefined>(undefined)
  const [unmergedFavorites, setUnmergedFavorites] = useState<Favorite[] | undefined>(undefined)
  const cloudModule = useRef<Promise<CloudFavorites> | undefined>(undefined)

  const loadCloud = useCallback((): Promise<CloudFavorites> => {
    if (cloudModule.current == undefined) {
      cloudModule.current = import('./cloudFavorites')
    }
    return cloudModule.current
  }, [])

  useEffect(() => {
    writeLocalFavorites(localFavorites)
  }, [localFavorites])

  useEffect(() => {
    if (uid == undefined) {
      setCloudFavorites(undefined)
      setUnmergedFavorites(undefined)
      return
    }
    let cancelled = false
    let compared = false
    let unsubscribe: (() => void) | undefined
    setError(undefined)
    loadCloud()
      .then((module) => {
        if (cancelled) {
          return
        }
        unsubscribe = module.subscribeToFavorites(
          uid,
          (favorites) => {
            if (!compared) {
              compared = true
              const stored = readLocalFavorites()
              const cloudKeys = new Set(favorites.map(favoriteKey))
              const missing = stored.filter((favorite) => !cloudKeys.has(favoriteKey(favorite)))
              if (missing.length > 0) {
                setUnmergedFavorites(missing)
              } else {
                setLocalFavorites([])
              }
            }
            setCloudFavorites(favorites)
          },
          () => setError('loadFailed')
        )
      })
      .catch(() => setError('loadFailed'))
    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [uid, loadCloud])

  const confirmMerge = useCallback(() => {
    if (uid == undefined || unmergedFavorites == undefined) {
      return
    }
    const missing = unmergedFavorites
    setUnmergedFavorites(undefined)
    loadCloud()
      .then((module) => module.addFavorites(uid, missing))
      .then(
        () => setLocalFavorites([]),
        () => setError('mergeFailed')
      )
  }, [uid, unmergedFavorites, loadCloud])

  const dismissMerge = useCallback(() => setUnmergedFavorites(undefined), [])

  const pendingMerge = useMemo<PendingMerge | undefined>(
    () => (unmergedFavorites == undefined ? undefined : { count: unmergedFavorites.length, confirm: confirmMerge, dismiss: dismissMerge }),
    [unmergedFavorites, confirmMerge, dismissMerge]
  )

  const favorites = useMemo(() => (uid != undefined ? (cloudFavorites ?? []) : localFavorites), [uid, cloudFavorites, localFavorites])

  useEffect(() => {
    rememberFavoriteSetIds(favorites.map((favorite) => favorite.setId))
  }, [favorites])
  const source: FavoritesSource = uid != undefined ? 'cloud' : 'local'
  const isLoading = status == 'loading' || (uid != undefined && cloudFavorites == undefined)

  const isFavorite = useCallback(
    (cardId: string, print?: string) => {
      const key = favoriteKey({ cardId, print })
      return favorites.some((favorite) => favoriteKey(favorite) == key)
    },
    [favorites]
  )

  const toggleFavorite = useCallback(
    (card: PokemonCard, print?: string) => {
      const favorite: Favorite = { cardId: card.id, setId: card.set.id, addedAt: Date.now() }
      if (print != undefined) {
        favorite.print = print
      }
      const key = favoriteKey(favorite)
      if (uid != undefined) {
        const exists = cloudFavorites?.some((entry) => favoriteKey(entry) == key) ?? false
        loadCloud()
          .then((module) => (exists ? module.removeFavorite(uid, key) : module.addFavorites(uid, [favorite])))
          .catch(() => setError('saveFailed'))
        return
      }
      setLocalFavorites((previous) =>
        previous.some((entry) => favoriteKey(entry) == key)
          ? previous.filter((entry) => favoriteKey(entry) != key)
          : [...previous, favorite]
      )
    },
    [uid, cloudFavorites, loadCloud]
  )

  const contextValue = useMemo(
    () => ({ favorites, source, isLoading, error, pendingMerge, isFavorite, toggleFavorite }),
    [favorites, source, isLoading, error, pendingMerge, isFavorite, toggleFavorite]
  )

  return <FavoritesContext.Provider value={contextValue}>{children}</FavoritesContext.Provider>
}

export default FavoritesProvider
