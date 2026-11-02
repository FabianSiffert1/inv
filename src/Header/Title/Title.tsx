import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
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

export default function Title() {
  const location = useLocation()
  const isDexMode = location.pathname.startsWith('/pokemon')
  const [hasToggled, setToggled] = useState(false)

  useEffect(() => {
    storeLocation(isDexMode ? dexLocationStorageKey : cardsLocationStorageKey, `${location.pathname}${withoutOpenCard(location.search)}`)
  }, [isDexMode, location.pathname, location.search])

  const target = isDexMode ? readLocation(cardsLocationStorageKey, '/') : readLocation(dexLocationStorageKey, '/pokemon')
  const label = isDexMode ? 'Switch to cards' : 'Switch to Pokédex'

  return (
    <div className={styles.title}>
      <Link className={styles.modeToggle} to={target} aria-label={label} title={label} onClick={() => setToggled(true)}>
        <span key={isDexMode ? 'dex' : 'cards'} className={hasToggled ? `${styles.modeIcon} ${styles.flipIn}` : styles.modeIcon}>
          {isDexMode ? <PikachuIcon /> : <CardBackIcon />}
        </span>
        <span className={styles.modeLabel}>{isDexMode ? 'Dex' : 'Cards'}</span>
      </Link>
    </div>
  )
}
