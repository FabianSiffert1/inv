import { Outlet } from 'react-router-dom'
import Header from '../../Header/Header'
import HeaderProvider from '../../Header/HeaderProvider'
import { useSnapshotCacheEviction } from '../../util/api/pokemonTGC/hooks'
import styles from './Home.module.scss'

export default function Home() {
  useSnapshotCacheEviction()

  return (
    <HeaderProvider>
      <Header />
      <div className={styles.home}>
        <div className={styles.pageContainer}>
          <Outlet />
        </div>
      </div>
    </HeaderProvider>
  )
}
