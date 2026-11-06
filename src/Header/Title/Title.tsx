import { ReactElement, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { StarIcon } from '../../Components/FavoriteButton/FavoriteButton'
import { CardBackIcon, PikachuIcon, SmeargleIcon } from './ModeIcons'
import styles from './Title.module.scss'

type BrowseMode = 'cards' | 'dex' | 'artists'
type Mode = BrowseMode | 'favorites'

const browseModes: BrowseMode[] = ['cards', 'dex', 'artists']
const lastBrowseModeStorageKey = 'inv-last-mode'

interface ModeSettings {
  label: string
  icon: ReactElement
}

interface BrowseModeSettings extends ModeSettings {
  storageKey: string
  fallbackPath: string
  switchLabel: string
}

const browseModeSettings: Record<BrowseMode, BrowseModeSettings> = {
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

const favoritesSettings: ModeSettings = {
  label: 'Favorites',
  icon: (
    <span className={styles.modeStar}>
      <StarIcon />
    </span>
  )
}

const isBrowseMode = (mode: Mode): mode is BrowseMode => mode != 'favorites'

const modeOfPath = (pathname: string): Mode => {
  if (pathname.startsWith('/inventory')) {
    return 'favorites'
  }
  if (pathname.startsWith('/pokemon')) {
    return 'dex'
  }
  return pathname.startsWith('/artists') ? 'artists' : 'cards'
}

const nextBrowseMode = (mode: BrowseMode): BrowseMode => browseModes[(browseModes.indexOf(mode) + 1) % browseModes.length]

const readStored = (key: string, fallback: string): string => {
  try {
    return window.localStorage.getItem(key) ?? fallback
  } catch {
    return fallback
  }
}

const store = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    return
  }
}

const readLastBrowseMode = (): BrowseMode => {
  const stored = readStored(lastBrowseModeStorageKey, 'cards')
  return browseModes.find((mode) => mode == stored) ?? 'cards'
}

const readBrowseLocation = (mode: BrowseMode): string => {
  const { storageKey, fallbackPath } = browseModeSettings[mode]
  const stored = readStored(storageKey, fallbackPath)
  return modeOfPath(stored.split('?')[0]) == mode ? stored : fallbackPath
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
    if (!isBrowseMode(currentMode)) {
      return
    }
    store(lastBrowseModeStorageKey, currentMode)
    store(browseModeSettings[currentMode].storageKey, `${location.pathname}${withoutOpenCard(location.search)}`)
  }, [currentMode, location.pathname, location.search])

  useEffect(() => {
    setPendingMode(undefined)
  }, [currentMode])

  const targetMode = isBrowseMode(shownMode) ? nextBrowseMode(shownMode) : readLastBrowseMode()
  const targetSettings = browseModeSettings[targetMode]
  const target = readBrowseLocation(targetMode)
  const label = isBrowseMode(shownMode) ? targetSettings.switchLabel : `Back to ${targetSettings.label.toLowerCase()}`
  const shownSettings = isBrowseMode(shownMode) ? browseModeSettings[shownMode] : favoritesSettings

  return (
    <div className={styles.title}>
      <Link className={styles.modeToggle} to={target} aria-label={label} title={label} onClick={() => setPendingMode(targetMode)}>
        <span className={styles.modeIcon}>{shownSettings.icon}</span>
        <span className={styles.modeLabel}>{shownSettings.label}</span>
      </Link>
    </div>
  )
}
