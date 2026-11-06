import { ReactElement, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CardBackIcon, PikachuIcon, SmeargleIcon } from './ModeIcons'
import styles from './Title.module.scss'

type Mode = 'cards' | 'dex' | 'artists'

const modes: Mode[] = ['cards', 'dex', 'artists']

const modeSettings: Record<Mode, { storageKey: string; fallbackPath: string; label: string; switchLabel: string; icon: ReactElement }> = {
  cards: {
    storageKey: 'inv-last-cards-location',
    fallbackPath: '/',
    label: 'Cards',
    switchLabel: 'Switch to cards',
    icon: <CardBackIcon />
  },
  dex: {
    storageKey: 'inv-last-dex-location',
    fallbackPath: '/pokemon',
    label: 'Dex',
    switchLabel: 'Switch to Pokédex',
    icon: <PikachuIcon />
  },
  artists: {
    storageKey: 'inv-last-artists-location',
    fallbackPath: '/artists',
    label: 'Artists',
    switchLabel: 'Switch to artists',
    icon: <SmeargleIcon />
  }
}

const modeOfPath = (pathname: string): Mode => {
  if (pathname.startsWith('/pokemon')) {
    return 'dex'
  }
  return pathname.startsWith('/artists') ? 'artists' : 'cards'
}

const nextMode = (mode: Mode): Mode => modes[(modes.indexOf(mode) + 1) % modes.length]

const readLocation = (key: string, fallback: string): string => {
  try {
    return window.localStorage.getItem(key) ?? fallback
  } catch {
    return fallback
  }
}

const storeLocation = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    return
  }
}

const withoutOpenCard = (search: string): string => {
  const params = new URLSearchParams(search)
  params.delete('card')
  const remaining = params.toString()
  return remaining == '' ? '' : `?${remaining}`
}

export default function Title() {
  const location = useLocation()
  const currentMode = modeOfPath(location.pathname)
  const [pendingMode, setPendingMode] = useState<Mode | undefined>(undefined)
  const shownMode = pendingMode ?? currentMode

  useEffect(() => {
    storeLocation(modeSettings[currentMode].storageKey, `${location.pathname}${withoutOpenCard(location.search)}`)
  }, [currentMode, location.pathname, location.search])

  useEffect(() => {
    setPendingMode(undefined)
  }, [currentMode])

  const targetMode = nextMode(shownMode)
  const target = readLocation(modeSettings[targetMode].storageKey, modeSettings[targetMode].fallbackPath)
  const label = modeSettings[targetMode].switchLabel

  return (
    <div className={styles.title}>
      <Link className={styles.modeToggle} to={target} aria-label={label} title={label} onClick={() => setPendingMode(targetMode)}>
        <span className={styles.modeIcon}>{modeSettings[shownMode].icon}</span>
        <span className={styles.modeLabel}>{modeSettings[shownMode].label}</span>
      </Link>
    </div>
  )
}
