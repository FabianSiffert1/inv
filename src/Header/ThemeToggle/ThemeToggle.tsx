import { useContext } from 'react'
import { ThemeContext } from '../../util/ui/theme/ThemeProvider'
import { EspeonIcon, UmbreonIcon } from './ThemeIcons'
import styles from './ThemeToggle.module.scss'

export default function ThemeToggle() {
  const themeContext = useContext(ThemeContext)
  const switchesToLightTheme = themeContext.darkTheme

  return (
    <button
      type="button"
      className={styles.themeToggle}
      onClick={themeContext.toggleTheme}
      aria-label={switchesToLightTheme ? 'Switch to light theme' : 'Switch to dark theme'}
      title={switchesToLightTheme ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {switchesToLightTheme ? <EspeonIcon /> : <UmbreonIcon />}
    </button>
  )
}
