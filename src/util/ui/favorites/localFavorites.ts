import { Favorite } from './Favorite'

export const favoritesStorageKey = 'inv-favorites'

type StoredFavorite = Omit<Favorite, 'addedAt'> & Partial<Pick<Favorite, 'addedAt'>>

const isStoredFavorite = (entry: unknown): entry is StoredFavorite =>
  typeof (entry as StoredFavorite)?.cardId == 'string' && typeof (entry as StoredFavorite)?.setId == 'string'

export const readLocalFavorites = (): Favorite[] => {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(favoritesStorageKey) ?? '[]')
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.filter(isStoredFavorite).map((entry, index) => ({ ...entry, addedAt: entry.addedAt ?? index }))
  } catch {
    return []
  }
}

export const writeLocalFavorites = (favorites: Favorite[]) => {
  try {
    window.localStorage.setItem(favoritesStorageKey, JSON.stringify(favorites))
  } catch {
    return
  }
}
