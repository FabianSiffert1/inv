import { useContext, useEffect, useRef } from 'react'
import { LoadingSpinner } from '../Components/LoadingSpinner/LoadingSpinner'
import styles from './Header.module.scss'
import { HeaderContext } from './HeaderProvider'
import WebNavigation from './Navigation/WebNavigation/WebNavigation'
import Title from './Title/Title'

export default function Header() {
  const { headerItem, isBusy } = useContext(HeaderContext)
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const header = headerRef.current
    if (header == null) {
      return
    }
    const rootStyle = document.documentElement.style
    const observer = new ResizeObserver(() => rootStyle.setProperty('--header-height', `${header.offsetHeight}px`))
    observer.observe(header)
    return () => {
      observer.disconnect()
      rootStyle.removeProperty('--header-height')
    }
  }, [])

  return (
    <div className={styles.header} ref={headerRef}>
      <div className={styles.headerContent}>
        <div className={styles.title}>
          <Title />
        </div>
        {isBusy && (
          <div className={styles.headerSpinner}>
            <LoadingSpinner small />
          </div>
        )}
        <div className={styles.middleItem}>{headerItem}</div>
        <div className={styles.navigation}>
          <WebNavigation />
        </div>
      </div>
    </div>
  )
}
