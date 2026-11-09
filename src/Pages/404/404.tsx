import { Link, useRouteError } from 'react-router-dom'
import { useStrings } from '../../util/ui/language/LanguageProvider'
import styles from './404.module.scss'

const messageForRouteError = (error: unknown): string | undefined => {
  const routeError = error as { statusText?: string; message?: string }
  return routeError?.statusText ?? routeError?.message
}

export default function ErrorPage() {
  const error = useRouteError()
  const t = useStrings()

  return (
    <div className={styles.errorPage}>
      <h1 className={styles.headline}>{t.errorHeadline}</h1>
      <p className={styles.detail}>{messageForRouteError(error) ?? t.unknownError}</p>
      <Link className={styles.homeLink} to='/'>
        {t.returnToBase}
      </Link>
    </div>
  )
}
