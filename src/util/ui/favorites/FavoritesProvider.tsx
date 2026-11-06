import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { PokemonCard } from '../../api/pokemonTGC/model/PokemonCard'
import { AuthContext } from '../../auth/AuthProvider'
import { Favorite } from './Favorite'
import { readLocalFavorites, writeLocalFavorites } from './localFavorites'

export type { Favorite } from './Favorite'

export type FavoritesSource = 'local' | 'cloud'

interface ContextProps {
  favorites: Favorite[]
  source: FavoritesSource
  isLoading: boolean
  error?: string
  isFavorite: (cardId: string) => boolean
  toggleFavorite: (card: PokemonCard) => void
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
  const [error, setError] = useState<string | undefined>(undefined)
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
      return
    }
    let cancelled = false
    let merged = false
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
            if (!merged) {
              merged = true
              const stored = readLocalFavorites()
              const cloudIds = new Set(favorites.map((favorite) => favorite.cardId))
              const missing = stored.filter((favorite) => !cloudIds.has(favorite.cardId))
              if (missing.length > 0) {
                module.addFavorites(uid, missing).catch(() => setError('Could not sync favorites.'))
              }
              setLocalFavorites([])
              if (missing.length > 0) {
                return
              }
            }
            setCloudFavorites(favorites)
          },
          () => setError('Could not load favorites.')
        )
      })
      .catch(() => setError('Could not load favorites.'))
    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [uid, loadCloud])

  const favorites = useMemo(() => (uid != undefined ? (cloudFavorites ?? []) : localFavorites), [uid, cloudFavorites, localFavorites])
  const source: FavoritesSource = uid != undefined ? 'cloud' : 'local'
  const isLoading = status == 'loading' || (uid != undefined && cloudFavorites == undefined)

  const isFavorite = useCallback((cardId: string) => favorites.some((favorite) => favorite.cardId == cardId), [favorites])

  const toggleFavorite = useCallback(
    (card: PokemonCard) => {
      const favorite: Favorite = { cardId: card.id, setId: card.set.id, addedAt: Date.now() }
      if (uid != undefined) {
        const exists = cloudFavorites?.some((entry) => entry.cardId == card.id) ?? false
        loadCloud()
          .then((module) => (exists ? module.removeFavorite(uid, card.id) : module.addFavorites(uid, [favorite])))
          .catch(() => setError('Could not save favorite.'))
        return
      }
      setLocalFavorites((previous) =>
        previous.some((entry) => entry.cardId == card.id) ? previous.filter((entry) => entry.cardId != card.id) : [...previous, favorite]
      )
    },
    [uid, cloudFavorites, loadCloud]
  )

  const contextValue = useMemo(
    () => ({ favorites, source, isLoading, error, isFavorite, toggleFavorite }),
    [favorites, source, isLoading, error, isFavorite, toggleFavorite]
  )

  return <FavoritesContext.Provider value={contextValue}>{children}</FavoritesContext.Provider>
}

export default FavoritesProvider
