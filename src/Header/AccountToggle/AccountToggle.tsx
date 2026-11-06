import { useContext, useEffect, useRef, useState } from 'react'
import { AuthContext } from '../../util/auth/AuthProvider'
import { MasterBallIcon, PokeBallIcon } from './AccountIcons'
import styles from './AccountToggle.module.scss'

export default function AccountToggle() {
  const { status, user, error, signIn, signOut } = useContext(AuthContext)
  const [isOpen, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }
    const onPointerDown = (event: MouseEvent) => {
      if (wrapperRef.current != null && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key == 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen])

  useEffect(() => {
    setOpen(error != undefined)
  }, [error, status])

  const isSignedIn = status == 'signedIn'
  const label = isSignedIn
    ? `Signed in as ${user?.email ?? user?.displayName ?? 'account'}`
    : status == 'loading'
      ? 'Signing in'
      : 'Sign in with Google'

  return (
    <div className={styles.account} ref={wrapperRef}>
      <button
        ref={triggerRef}
        type='button'
        className={styles.accountToggle}
        onClick={isSignedIn ? () => setOpen((previous) => !previous) : () => void signIn()}
        disabled={status == 'loading'}
        aria-label={label}
        title={label}
        aria-expanded={isSignedIn ? isOpen : undefined}
        aria-haspopup={isSignedIn ? 'dialog' : undefined}
      >
        {isSignedIn ? <MasterBallIcon /> : <PokeBallIcon />}
      </button>
      {isOpen && (
        <div className={styles.panel} role='dialog' aria-label='Account'>
          {isSignedIn && (
            <>
              <div className={styles.name}>{user?.displayName}</div>
              <div className={styles.email}>{user?.email}</div>
              <button type='button' className={styles.signOut} onClick={() => void signOut()}>
                Sign out
              </button>
            </>
          )}
          {error && (
            <div className={styles.error} role='alert'>
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
