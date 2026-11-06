import { deleteField, doc, FieldPath, onSnapshot, setDoc, updateDoc } from 'firebase/firestore'
import { firestore } from '../../firebase/app'
import { Favorite, sortByAddedAt } from './Favorite'

interface StoredFavorite {
  setId: string
  addedAt: number
}

interface UserDocument {
  favorites?: Record<string, StoredFavorite>
}

const userDocument = (uid: string) => doc(firestore, 'users', uid)

const isStoredFavorite = (entry: unknown): entry is StoredFavorite =>
  typeof (entry as StoredFavorite)?.setId == 'string' && typeof (entry as StoredFavorite)?.addedAt == 'number'

const toFavorites = (stored: UserDocument['favorites']): Favorite[] =>
  sortByAddedAt(
    Object.entries(stored ?? {})
      .filter((entry): entry is [string, StoredFavorite] => isStoredFavorite(entry[1]))
      .map(([cardId, { setId, addedAt }]) => ({ cardId, setId, addedAt }))
  )

const toStored = (favorites: Favorite[]): Record<string, StoredFavorite> =>
  Object.fromEntries(favorites.map(({ cardId, setId, addedAt }) => [cardId, { setId, addedAt }]))

export const subscribeToFavorites = (uid: string, onChange: (favorites: Favorite[]) => void, onError: (error: unknown) => void) =>
  onSnapshot(userDocument(uid), (snapshot) => onChange(toFavorites((snapshot.data() as UserDocument | undefined)?.favorites)), onError)

export const addFavorites = (uid: string, favorites: Favorite[]) =>
  setDoc(userDocument(uid), { favorites: toStored(favorites) }, { merge: true })

export const removeFavorite = (uid: string, cardId: string) =>
  updateDoc(userDocument(uid), new FieldPath('favorites', cardId), deleteField())
