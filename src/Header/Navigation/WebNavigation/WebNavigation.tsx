import { Link, useLocation } from 'react-router-dom'
import { StarIcon } from '../../../Components/FavoriteButton/FavoriteButton'
import HeaderMenu from '../../HeaderMenu/HeaderMenu'
import SearchToggle from '../../SearchToggle/SearchToggle'
import SortToggle from '../../SortToggle/SortToggle'
import { useStrings } from '../../../util/ui/language/LanguageProvider'
import { useIsMobile } from '../../../util/ui/useIsMobile'
import styles from './WebNavigation.module.scss'

const returnLocationStorageKey = 'inv-favorites-return-location'

const readReturnLocation = (): string => {
  try {
    return window.sessionStorage.getItem(returnLocationStorageKey) ?? '/'
  } catch {
    return '/'
  }
}

const storeReturnLocation = (location: string) => {
  try {
    window.sessionStorage.setItem(returnLocationStorageKey, location)
  } catch {
    return
  }
}

export default function WebNavigation() {
  const isMobile = useIsMobile()
  const t = useStrings()
  const location = useLocation()
  const isOnFavorites = location.pathname.startsWith('/inventory')
  const currentLocation = `${location.pathname}${location.search}`

  return (
    <div className={styles.webNavigation}>
      <nav>
        <ul>
          {!isMobile && (
            <li key={'searchToggle'}>
              <div className={styles.themeToggle}>
                <SearchToggle />
              </div>
            </li>
          )}
          <li key={'favoritesLink'}>
            <Link
              to={isOnFavorites ? readReturnLocation() : '/inventory'}
              onClick={() => {
                if (!isOnFavorites) {
                  storeReturnLocation(currentLocation)
                }
              }}
              className={`${styles.favoritesLink} ${isOnFavorites ? styles.favoritesLinkActive : ''}`}
              aria-label={t.favorites}
              aria-current={isOnFavorites ? 'page' : undefined}
              title={t.favorites}
            >
              <StarIcon />
            </Link>
          </li>
          <li key={'sortToggle'}>
            <div className={styles.themeToggle}>
              <SortToggle />
            </div>
          </li>
          <li key={'headerMenu'}>
            <div className={styles.themeToggle}>
              <HeaderMenu />
            </div>
          </li>
        </ul>
      </nav>
    </div>
  )
}
