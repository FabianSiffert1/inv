import styles from './CardListStatus.module.scss'

interface CardListStatusProps {
  hasSelectedEra: boolean
  hasSelectedSet: boolean
  isFetching: boolean
  error: unknown
  cardCount: number
  hasNoSearchMatches: boolean
}

const messageForError = (error: unknown): string => {
  const status = (error as { response?: { status?: number } })?.response?.status
  if (status == 404) {
    return 'No card data is available for this yet. Try again later.'
  }
  if (status != undefined && status >= 500) {
    return 'The server is currently unavailable. Try again later.'
  }
  if ((error as { message?: string })?.message == 'Network Error') {
    return 'Could not reach the server. Check your connection.'
  }
  return 'Could not load cards. Reload the page to try again.'
}

export default function CardListStatus(props: CardListStatusProps) {
  if (props.isFetching) {
    return undefined
  }

  if (props.error != null) {
    return (
      <div className={styles.status} role='alert'>
        <div className={styles.headline}>Cards could not be loaded</div>
        <div className={styles.detail}>{messageForError(props.error)}</div>
      </div>
    )
  }

  if (!props.hasSelectedSet) {
    return (
      <div className={styles.status}>
        <div className={styles.hint}>
          <div className={styles.headline}>{props.hasSelectedEra ? 'Now pick a set' : 'Welcome, trainer'}</div>
          <div className={styles.detail}>
            {props.hasSelectedEra
              ? 'Choose a set from the menu above to browse its cards and current market prices.'
              : 'Start by choosing an era from the menu above, then pick a set to browse its cards and current market prices.'}
          </div>
        </div>
      </div>
    )
  }

  if (props.cardCount == 0) {
    return (
      <div className={styles.status}>
        <div className={styles.headline}>No cards found</div>
        <div className={styles.detail}>There are no cards for this set yet.</div>
      </div>
    )
  }

  if (props.hasNoSearchMatches) {
    return (
      <div className={styles.status}>
        <div className={styles.headline}>No matching cards</div>
        <div className={styles.detail}>Try a different name, type, rarity or card number.</div>
      </div>
    )
  }

  return undefined
}
