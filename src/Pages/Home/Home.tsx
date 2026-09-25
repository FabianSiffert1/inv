import { Outlet } from 'react-router-dom'
import Header from '../../Header/Header'
import HeaderProvider from '../../Header/HeaderProvider'
import styles from './Home.module.scss'

export default function Home() {
  return (
    <div className={styles.home}>
      <div className={`${styles.spectrum} ${styles.spectrumTop}`} aria-hidden='true' />
      <HeaderProvider>
        <Header />
        <div className={styles.pageContainer}>
          <Outlet />
        </div>
      </HeaderProvider>
      <div className={`${styles.spectrum} ${styles.spectrumBottom}`} aria-hidden='true' />
    </div>
  )
}
