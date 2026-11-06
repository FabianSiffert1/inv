import { ReactNode, useContext, useEffect, useRef, useState } from 'react'
import { AuthContext } from '../../util/auth/AuthProvider'
import { LanguageContext } from '../../util/ui/language/LanguageProvider'
import { ThemeContext } from '../../util/ui/theme/ThemeProvider'
import { PretzelIcon, TeacupIcon } from '../LanguageToggle/LanguageIcons'
import { EspeonIcon, UmbreonIcon } from '../ThemeToggle/ThemeIcons'
import { MasterBallIcon, PokeBallIcon, SignOutIcon } from './HeaderMenuIcons'
import styles from './HeaderMenu.module.scss'

export default function HeaderMenu() {
  const { status, user, error, signIn, signOut } = useContext(AuthContext)
  const { darkTheme, toggleTheme } = useContext(ThemeContext)
  const { germanNames, toggleLanguage } = useContext(LanguageContext)
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

  const choose = (action: () => void) => {
    action()
    setOpen(false)
  }

  const isSignedIn = status == 'signedIn'
  const label = isSignedIn ? `Menu, signed in as ${user?.email ?? user?.displayName ?? 'account'}` : 'Menu'

  return (
    <div className={styles.menu} ref={wrapperRef}>
      <button
        ref={triggerRef}
        type='button'
        className={styles.trigger}
        onClick={() => setOpen((previous) => !previous)}
        aria-label={label}
        title={label}
        aria-expanded={isOpen}
        aria-haspopup='menu'
      >
        {isSignedIn ? <MasterBallIcon /> : <PokeBallIcon />}
      </button>
      {isOpen && (
        <div className={styles.panel} role='menu' aria-label='Menu'>
          <MenuRow icon={darkTheme ? <EspeonIcon /> : <UmbreonIcon />} onClick={() => choose(toggleTheme)}>
            Toggle Theme
          </MenuRow>
          <MenuRow icon={germanNames ? <TeacupIcon /> : <PretzelIcon />} onClick={() => choose(toggleLanguage)}>
            Toggle Language
          </MenuRow>
          <div className={styles.divider} role='separator' />
          {isSignedIn ? (
            <>
              <div className={styles.account}>
                <span className={styles.rowIcon}>
                  <MasterBallIcon />
                </span>
                <div className={styles.accountDetails}>
                  <div className={styles.name}>{user?.displayName}</div>
                  <div className={styles.email}>{user?.email}</div>
                </div>
              </div>
              <MenuRow icon={<SignOutIcon />} onClick={() => void signOut()} className={styles.signOut}>
                Sign out
              </MenuRow>
            </>
          ) : (
            <MenuRow icon={<PokeBallIcon />} onClick={() => void signIn()} disabled={status == 'loading'}>
              {status == 'loading' ? 'Signing in' : 'Sign in with Google'}
            </MenuRow>
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

interface MenuRowProps {
  icon: ReactNode
  onClick: () => void
  disabled?: boolean
  className?: string
  children: ReactNode
}

function MenuRow(props: MenuRowProps) {
  return (
    <button
      type='button'
      role='menuitem'
      className={props.className ? `${styles.row} ${props.className}` : styles.row}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      <span className={styles.rowIcon}>{props.icon}</span>
      <span>{props.children}</span>
    </button>
  )
}
