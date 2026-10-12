import { NavLink } from 'react-router-dom'
import { StarIcon } from '../../../Components/FavoriteButton/FavoriteButton'
import LanguageToggle from '../../LanguageToggle/LanguageToggle'
import SearchToggle from '../../SearchToggle/SearchToggle'
import SortToggle from '../../SortToggle/SortToggle'
import ThemeToggle from '../../ThemeToggle/ThemeToggle'
import { useIsMobile } from '../../../util/ui/useIsMobile'
import styles from './WebNavigation.module.scss'

export default function WebNavigation() {
  const isMobile = useIsMobile()

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
            <NavLink
              to='/inventory'
              className={({ isActive }) => `${styles.favoritesLink} ${isActive ? styles.favoritesLinkActive : ''}`}
              aria-label='Favorites'
              title='Favorites'
            >
              <StarIcon />
            </NavLink>
          </li>
          <li key={'sortToggle'}>
            <div className={styles.themeToggle}>
              <SortToggle />
            </div>
          </li>
          <li key={'languageToggle'}>
            <div className={styles.themeToggle}>
              <LanguageToggle />
            </div>
          </li>
          <li key={'themeToggle'}>
            <div className={styles.themeToggle}>
              <ThemeToggle />
            </div>
          </li>
        </ul>
      </nav>
    </div>
  )
}
