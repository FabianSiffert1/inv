import LanguageToggle from '../../LanguageToggle/LanguageToggle'
import SearchToggle from '../../SearchToggle/SearchToggle'
import SortToggle from '../../SortToggle/SortToggle'
import ThemeToggle from '../../ThemeToggle/ThemeToggle'
import styles from './WebNavigation.module.scss'

export default function WebNavigation() {
  return (
    <div className={styles.webNavigation}>
      <nav>
        <ul>
          <li key={'searchToggle'}>
            <div className={styles.themeToggle}>
              <SearchToggle />
            </div>
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
