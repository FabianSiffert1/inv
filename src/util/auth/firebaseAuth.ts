import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, User } from 'firebase/auth'
import { auth } from '../firebase/app'

export type { User }

export const subscribeToUser = (onChange: (user: User | null) => void) => onAuthStateChanged(auth, onChange)

export const signInWithGoogle = () => signInWithPopup(auth, new GoogleAuthProvider())

export const signOut = () => firebaseSignOut(auth)
