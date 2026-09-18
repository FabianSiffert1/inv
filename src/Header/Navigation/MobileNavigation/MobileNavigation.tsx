import { useEffect, useState } from 'react'
import ThemeToggle from '../../ThemeToggle/ThemeToggle'
import styles from './MobileNavigation.module.scss'

export default function MobileNavigation() {
  const [hamburgerMenuOpen, setHamburgerMenuOpen] = useState(false)

  const toggleHamburgerMenu = () => {
    setHamburgerMenuOpen(!hamburgerMenuOpen)
  }

  useEffect(() => {
    if (hamburgerMenuOpen) {
      document.body.classList.add('no-scroll')
    } else {
      document.body.classList.remove('no-scroll')
    }

    return () => {
      document.body.classList.remove('no-scroll')
    }
  }, [hamburgerMenuOpen])

  return (
    <div className={styles.mobileNavigation} onClick={toggleHamburgerMenu}>
      <div className={styles.burger} />
      <div className={styles.burger} />
      <div className={styles.burger} />
      <div className={styles.navigationMenu} style={{ display: hamburgerMenuOpen ? 'flex' : 'none' }}>
        <div className={styles.linkImage}>
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}
