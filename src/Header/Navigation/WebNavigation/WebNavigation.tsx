import ThemeToggle from '../../ThemeToggle/ThemeToggle'
import styles from './WebNavigation.module.scss'

export default function WebNavigation() {
  return (
    <div className={styles.webNavigation}>
      <nav>
        <ul>
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
