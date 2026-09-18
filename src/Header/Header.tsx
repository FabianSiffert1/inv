import { useContext } from 'react'
import { LoadingSpinner } from '../Components/LoadingSpinner/LoadingSpinner'
import styles from './Header.module.scss'
import { HeaderContext } from './HeaderProvider'
import WebNavigation from './Navigation/WebNavigation/WebNavigation'
import Title from './Title/Title'

export default function Header() {
  const { headerItem, isBusy } = useContext(HeaderContext)

  return (
    <div className={styles.header}>
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
  )
}
