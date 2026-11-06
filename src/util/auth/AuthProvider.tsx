import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'

export const accountStorageKey = 'inv-account'

export type AuthStatus = 'loading' | 'signedOut' | 'signedIn'

export interface AccountUser {
  uid: string
  email?: string
  displayName?: string
  photoUrl?: string
}

interface ContextProps {
  status: AuthStatus
  user?: AccountUser
  error?: string
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<ContextProps>({
  status: 'signedOut',
  signIn: async () => {},
  signOut: async () => {}
})

interface Props {
  children?: React.ReactNode
}

type FirebaseAuth = typeof import('./firebaseAuth')

const cancelledPopupCodes = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request']

const hasAccountFlag = (): boolean => {
  try {
    return window.localStorage.getItem(accountStorageKey) == '1'
  } catch {
    return false
  }
}

const writeAccountFlag = (signedIn: boolean) => {
  try {
    if (signedIn) {
      window.localStorage.setItem(accountStorageKey, '1')
    } else {
      window.localStorage.removeItem(accountStorageKey)
    }
  } catch {
    return
  }
}

const errorMessage = (error: unknown): string | undefined => {
  const code = (error as { code?: string })?.code
  if (code != undefined && cancelledPopupCodes.includes(code)) {
    return undefined
  }
  if (code == 'auth/network-request-failed') {
    return 'No connection. Try again later.'
  }
  if (code == 'auth/popup-blocked') {
    return 'The sign-in popup was blocked. Allow popups for this site.'
  }
  return 'Sign-in failed. Try again.'
}

const AuthProvider: React.FC<Props> = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>(() => (hasAccountFlag() ? 'loading' : 'signedOut'))
  const [user, setUser] = useState<AccountUser | undefined>(undefined)
  const [error, setError] = useState<string | undefined>(undefined)
  const firebaseAuth = useRef<Promise<FirebaseAuth> | undefined>(undefined)
  const [loadedAuth, setLoadedAuth] = useState<FirebaseAuth | undefined>(undefined)

  const loadAuth = useCallback((): Promise<FirebaseAuth> => {
    if (firebaseAuth.current == undefined) {
      firebaseAuth.current = import('./firebaseAuth').then((module) => {
        setLoadedAuth(module)
        return module
      })
    }
    return firebaseAuth.current
  }, [])

  useEffect(() => {
    if (!hasAccountFlag()) {
      return
    }
    loadAuth().catch(() => {
      setStatus('signedOut')
      setError('Could not load sign-in. Try again later.')
    })
  }, [loadAuth])

  useEffect(() => {
    if (loadedAuth == undefined) {
      return
    }
    return loadedAuth.subscribeToUser((firebaseUser) => {
      writeAccountFlag(firebaseUser != null)
      if (firebaseUser == null) {
        setUser(undefined)
        setStatus('signedOut')
        return
      }
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email ?? undefined,
        displayName: firebaseUser.displayName ?? undefined,
        photoUrl: firebaseUser.photoURL ?? undefined
      })
      setStatus('signedIn')
    })
  }, [loadedAuth])

  const signIn = useCallback(async () => {
    setError(undefined)
    try {
      const module = await loadAuth()
      await module.signInWithGoogle()
    } catch (caught) {
      setError(errorMessage(caught))
    }
  }, [loadAuth])

  const signOut = useCallback(async () => {
    setError(undefined)
    try {
      const module = await loadAuth()
      await module.signOut()
    } catch {
      setError('Sign-out failed. Try again.')
    }
  }, [loadAuth])

  const contextValue = useMemo(() => ({ status, user, error, signIn, signOut }), [status, user, error, signIn, signOut])

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export default AuthProvider
