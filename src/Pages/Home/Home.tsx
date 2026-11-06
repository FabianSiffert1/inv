import { Outlet } from 'react-router-dom'
import Header from '../../Header/Header'
import HeaderProvider from '../../Header/HeaderProvider'
import styles from './Home.module.scss'

export default function Home() {
  return (
    <div className={styles.home}>
      <HeaderProvider>
        <Header />
        <div className={styles.pageContainer}>
          <Outlet />
        </div>
      </HeaderProvider>
    </div>
  )
}
