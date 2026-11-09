import { ReactElement, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { StarIcon } from '../../Components/FavoriteButton/FavoriteButton'
import { useStrings } from '../../util/ui/language/LanguageProvider'
import { MagnifyingGlassIcon } from '../SearchToggle/SearchIcon'
import { CardBackIcon, PikachuIcon, SmeargleIcon } from './ModeIcons'
import styles from './Title.module.scss'

type BrowseMode = 'cards' | 'dex' | 'artists'
type PlaceMode = 'favorites' | 'search'
type Mode = BrowseMode | PlaceMode

const browseModes: BrowseMode[] = ['cards', 'dex', 'artists']

type ModeLabel = 'sets' | 'pokemon' | 'artists' | 'favorites' | 'search'

interface ModeSettings {
  label: ModeLabel
  icon: ReactElement
}

interface BrowseModeSettings extends ModeSettings {
  storageKey: string
  fallbackPath: string
}

const browseModeSettings: Record<BrowseMode, BrowseModeSettings> = {
  cards: {
    storageKey: 'inv-last-cards-location',
    fallbackPath: '/',
    label: 'sets',
    icon: <CardBackIcon />
  },
  dex: {
    storageKey: 'inv-last-dex-location',
    fallbackPath: '/pokemon',
    label: 'pokemon',
    icon: <PikachuIcon />
  },
  artists: {
    storageKey: 'inv-last-artists-location',
    fallbackPath: '/artists',
    label: 'artists',
    icon: <SmeargleIcon />
  }
}

const placeModeSettings: Record<PlaceMode, ModeSettings> = {
  favorites: {
    label: 'favorites',
    icon: (
      <span className={styles.modeStar}>
        <StarIcon />
      </span>
    )
  },
  search: {
    label: 'search',
    icon: (
      <span className={styles.modeStar}>
        <MagnifyingGlassIcon />
      </span>
    )
  }
}

const isBrowseMode = (mode: Mode): mode is BrowseMode => mode != 'favorites' && mode != 'search'

const modeOfPath = (pathname: string): Mode => {
  if (pathname.startsWith('/inventory')) {
    return 'favorites'
  }
  if (pathname.startsWith('/search')) {
    return 'search'
  }
  if (pathname.startsWith('/pokemon')) {
    return 'dex'
  }
  return pathname.startsWith('/artists') ? 'artists' : 'cards'
}

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
  const [isOpen, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const t = useStrings()

  useEffect(() => {
    if (!isBrowseMode(currentMode)) {
      return
    }
    store(browseModeSettings[currentMode].storageKey, `${location.pathname}${withoutOpenCard(location.search)}`)
  }, [currentMode, location.pathname, location.search])

  useEffect(() => {
    setPendingMode(undefined)
  }, [currentMode])

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

  const shownSettings = isBrowseMode(shownMode) ? browseModeSettings[shownMode] : placeModeSettings[shownMode]

  return (
    <div className={styles.title} ref={wrapperRef}>
      <button
        ref={triggerRef}
        type='button'
        className={styles.modeToggle}
        title={t.switchMode}
        aria-expanded={isOpen}
        aria-haspopup='menu'
        onClick={() => setOpen((previous) => !previous)}
      >
        <span className={styles.modeIcon}>{shownSettings.icon}</span>
        <span className={styles.modeLabel}>{t[shownSettings.label]}</span>
      </button>
      {isOpen && (
        <div className={styles.panel} role='menu' aria-label={t.switchMode}>
          {browseModes.map((mode) => {
            const settings = browseModeSettings[mode]
            const isCurrent = mode == shownMode
            return (
              <Link
                key={mode}
                role='menuitem'
                className={isCurrent ? `${styles.row} ${styles.rowCurrent}` : styles.row}
                to={readBrowseLocation(mode)}
                aria-current={isCurrent ? 'page' : undefined}
                onClick={() => {
                  setPendingMode(mode)
                  setOpen(false)
                }}
              >
                <span className={styles.modeIcon}>{settings.icon}</span>
                <span>{t[settings.label]}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
