import { Link } from 'react-router-dom'
import ThemeToggle from '../../ThemeToggle/ThemeToggle'
import styles from './WebNavigation.module.scss'

export default function WebNavigation() {
  return (
    <div className={styles.webNavigation}>
      <nav>
        <ul>
          <li key={'market'}>
            <Link to={`market`}>Market</Link>
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
