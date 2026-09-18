import styles from './LoadingSpinner.module.scss'

interface LoadingSpinnerProps {
  small?: boolean
}

export function LoadingSpinner(props: LoadingSpinnerProps) {
  return (
    <div className={props.small ? `${styles.spinner} ${styles.small}` : styles.spinner} role="status" aria-label="Loading">
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
