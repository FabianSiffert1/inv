import { useStrings } from '../../util/ui/language/LanguageProvider'
import styles from './LoadingSpinner.module.scss'

interface LoadingSpinnerProps {
  small?: boolean
}

export function LoadingSpinner(props: LoadingSpinnerProps) {
  const t = useStrings()

  return (
    <div className={props.small ? `${styles.spinner} ${styles.small}` : styles.spinner} role='status' aria-label={t.loading}>
      <div className={styles.bobber}>
        <div className={styles.ball}></div>
      </div>
      <div className={styles.bobber}>
        <div className={styles.ball}></div>
      </div>
      <div className={styles.bobber}>
        <div className={styles.ball}></div>
      </div>
    </div>
  )
}
