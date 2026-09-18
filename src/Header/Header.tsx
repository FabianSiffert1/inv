import { useContext } from 'react'
import styles from './Header.module.scss'
import { HeaderContext } from './HeaderProvider'
import WebNavigation from './Navigation/WebNavigation/WebNavigation'
import Title from './Title/Title'

export default function Header() {
  const headerContext = useContext(HeaderContext)

  return (
    <div className={styles.header}>
      <div className={styles.title}>
        <Title />
      </div>
      <div className={styles.middleItem}>{headerContext.headerItem}</div>
      <div className={styles.navigation}>
        <WebNavigation />
      </div>
    </div>
  )
}
