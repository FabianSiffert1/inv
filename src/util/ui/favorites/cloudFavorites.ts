import { deleteField, doc, FieldPath, onSnapshot, setDoc, updateDoc } from 'firebase/firestore'
import { firestore } from '../../firebase/app'
import { Favorite, favoriteKey, isUrgency, sortByAddedAt, Urgency } from './Favorite'

interface StoredFavorite {
  setId: string
  addedAt: number
  cardId?: string
  print?: string
  urgency?: Urgency
}

interface UserDocument {
  favorites?: Record<string, StoredFavorite>
}

const userDocument = (uid: string) => doc(firestore, 'users', uid)

const isStoredFavorite = (entry: unknown): entry is StoredFavorite =>
  typeof (entry as StoredFavorite)?.setId == 'string' && typeof (entry as StoredFavorite)?.addedAt == 'number'

const toFavorite = (key: string, stored: StoredFavorite): Favorite => {
  const favorite: Favorite = { cardId: stored.cardId ?? key, setId: stored.setId, addedAt: stored.addedAt }
  if (stored.print != undefined) {
    favorite.print = stored.print
  }
  if (isUrgency(stored.urgency) && stored.urgency != 'normal') {
    favorite.urgency = stored.urgency
  }
  return favorite
}

const toStored = (favorite: Favorite): StoredFavorite => {
  const stored: StoredFavorite = { setId: favorite.setId, addedAt: favorite.addedAt }
  if (favorite.print != undefined) {
    stored.cardId = favorite.cardId
    stored.print = favorite.print
  }
  if (favorite.urgency != undefined && favorite.urgency != 'normal') {
    stored.urgency = favorite.urgency
  }
  return stored
}

const toFavorites = (stored: UserDocument['favorites']): Favorite[] =>
  sortByAddedAt(
    Object.entries(stored ?? {})
      .filter((entry): entry is [string, StoredFavorite] => isStoredFavorite(entry[1]))
      .map(([key, value]) => toFavorite(key, value))
  )

export const subscribeToFavorites = (uid: string, onChange: (favorites: Favorite[]) => void, onError: (error: unknown) => void) =>
  onSnapshot(userDocument(uid), (snapshot) => onChange(toFavorites((snapshot.data() as UserDocument | undefined)?.favorites)), onError)

export const addFavorites = (uid: string, favorites: Favorite[]) =>
  setDoc(
    userDocument(uid),
    { favorites: Object.fromEntries(favorites.map((favorite) => [favoriteKey(favorite), toStored(favorite)])) },
    { merge: true }
  )

export const removeFavorite = (uid: string, key: string) => updateDoc(userDocument(uid), new FieldPath('favorites', key), deleteField())

export const setFavoriteUrgency = (uid: string, key: string, urgency: Urgency) =>
  updateDoc(userDocument(uid), new FieldPath('favorites', key, 'urgency'), urgency == 'normal' ? deleteField() : urgency)
