import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthContext } from '../auth/AuthProvider'

interface ContextProps {
  isAdmin: boolean
}

export const AdminContext = createContext<ContextProps>({ isAdmin: false })

interface Props {
  children?: React.ReactNode
}

const AdminProvider: React.FC<Props> = ({ children }) => {
  const { status, user } = useContext(AuthContext)
  const uid = status == 'signedIn' ? user?.uid : undefined
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    setIsAdmin(false)
    if (uid == undefined) {
      return
    }
    let cancelled = false
    let unsubscribe: (() => void) | undefined
    import('./cloudAdmin')
      .then((module) => {
        if (!cancelled) {
          unsubscribe = module.subscribeToAdminRole(uid, setIsAdmin)
        }
      })
      .catch(() => setIsAdmin(false))
    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [uid])

  return <AdminContext.Provider value={{ isAdmin }}>{children}</AdminContext.Provider>
}

export default AdminProvider
