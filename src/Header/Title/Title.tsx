import { MouseEvent, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { CardBackIcon, PikachuIcon } from './ModeIcons'
import styles from './Title.module.scss'

const cardsLocationStorageKey = 'inv-last-cards-location'
const dexLocationStorageKey = 'inv-last-dex-location'

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

const isPlainLeftClick = (event: MouseEvent) => event.button == 0 && !event.metaKey && !event.altKey && !event.ctrlKey && !event.shiftKey

const afterNextPaint = (callback: () => void) => window.requestAnimationFrame(() => window.requestAnimationFrame(callback))

export default function Title() {
  const location = useLocation()
  const navigate = useNavigate()
  const isDexMode = location.pathname.startsWith('/pokemon')
  const [pendingDexMode, setPendingDexMode] = useState<boolean | undefined>(undefined)
  const isShowingDexMode = pendingDexMode ?? isDexMode
  const isNavigating = useRef(false)

  useEffect(() => {
    storeLocation(isDexMode ? dexLocationStorageKey : cardsLocationStorageKey, `${location.pathname}${withoutOpenCard(location.search)}`)
  }, [isDexMode, location.pathname, location.search])

  useEffect(() => {
    setPendingDexMode(undefined)
    isNavigating.current = false
  }, [isDexMode])

  const target = isShowingDexMode ? readLocation(cardsLocationStorageKey, '/') : readLocation(dexLocationStorageKey, '/pokemon')
  const label = isShowingDexMode ? 'Switch to cards' : 'Switch to Pokédex'

  const toggle = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!isPlainLeftClick(event)) {
      return
    }
    event.preventDefault()
    if (isNavigating.current) {
      return
    }
    isNavigating.current = true
    setPendingDexMode(!isShowingDexMode)
    afterNextPaint(() => navigate(target))
  }

  return (
    <div className={styles.title}>
      <Link className={styles.modeToggle} to={target} aria-label={label} title={label} onClick={toggle}>
        <span className={styles.modeIcon}>{isShowingDexMode ? <PikachuIcon /> : <CardBackIcon />}</span>
        <span className={styles.modeLabel}>{isShowingDexMode ? 'Dex' : 'Cards'}</span>
      </Link>
    </div>
  )
}
