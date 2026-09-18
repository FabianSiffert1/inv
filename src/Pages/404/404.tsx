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
      Well that didnt work! <br />
      <br />
      <Link to={'/'}>return to base</Link> <br />
      <p>
        Error: &nbsp;
        <i>{messageForRouteError(error)}</i>
      </p>
    </div>
  )
}
