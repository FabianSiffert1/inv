import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { PokemonCard } from '../../api/pokemonTGC/model/PokemonCard'

export const favoritesStorageKey = 'inv-favorites'

export interface Favorite {
  cardId: string
  setId: string
}

interface ContextProps {
  favorites: Favorite[]
  isFavorite: (cardId: string) => boolean
  toggleFavorite: (card: PokemonCard) => void
}

export const FavoritesContext = createContext<ContextProps>({
  favorites: [],
  isFavorite: () => false,
  toggleFavorite: () => {}
})

interface Props {
  children?: React.ReactNode
}

const isFavoriteEntry = (entry: unknown): entry is Favorite =>
  typeof (entry as Favorite)?.cardId == 'string' && typeof (entry as Favorite)?.setId == 'string'

const storedFavorites = (): Favorite[] => {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(favoritesStorageKey) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter(isFavoriteEntry) : []
  } catch {
    return []
  }
}

const FavoritesProvider: React.FC<Props> = ({ children }) => {
  const [favorites, setFavorites] = useState(storedFavorites)

  useEffect(() => {
    try {
      window.localStorage.setItem(favoritesStorageKey, JSON.stringify(favorites))
    } catch {
      return
    }
  }, [favorites])

  const isFavorite = useCallback((cardId: string) => favorites.some((favorite) => favorite.cardId == cardId), [favorites])

  const toggleFavorite = useCallback(
    (card: PokemonCard) =>
      setFavorites((previous) =>
        previous.some((favorite) => favorite.cardId == card.id)
          ? previous.filter((favorite) => favorite.cardId != card.id)
          : [...previous, { cardId: card.id, setId: card.set.id }]
      ),
    []
  )

  const contextValue = useMemo(() => ({ favorites, isFavorite, toggleFavorite }), [favorites, isFavorite, toggleFavorite])

  return <FavoritesContext.Provider value={contextValue}>{children}</FavoritesContext.Provider>
}

export default FavoritesProvider
