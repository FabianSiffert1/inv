import { Link, useRouteError } from 'react-router-dom'
import styles from './404.module.scss'

const messageForRouteError = (error: unknown): string => {
  const routeError = error as { statusText?: string; message?: string }
  return routeError?.statusText ?? routeError?.message ?? 'Unknown error'
}

export default function ErrorPage() {
  const error = useRouteError()

  return (
    <div className={styles.errorPage}>
      <h1 className={styles.headline}>Well, that didn&apos;t work.</h1>
      <p className={styles.detail}>{messageForRouteError(error)}</p>
      <Link className={styles.homeLink} to='/'>
        Return to base
      </Link>
    </div>
  )
}
