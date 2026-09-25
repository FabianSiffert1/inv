import styles from './CardListStatus.module.scss'

interface CardListStatusProps {
  hasSelectedEra: boolean
  hasSelectedSet: boolean
  isFetching: boolean
  error: unknown
  cardCount: number
  onRetry: () => void
  retriesLeft: number
  isRetryCoolingDown: boolean
}

const messageForError = (error: unknown): string => {
  const status = (error as { response?: { status?: number } })?.response?.status
  if (status == 429) {
    return 'The Pokémon TCG API is rate limiting requests. Wait a moment and try again.'
  }
  if (status == 403 || status == 401) {
    return 'The Pokémon TCG API rejected the API key. Check VITE_POKEMON_TCG_API_KEY.'
  }
  if (status != undefined && status >= 500) {
    return 'The Pokémon TCG API is currently unavailable. Try again later.'
  }
  if ((error as { message?: string })?.message == 'Network Error') {
    return 'Could not reach the Pokémon TCG API. Check your connection.'
  }
  return 'Could not load cards from the Pokémon TCG API.'
}

function RetryControl(props: CardListStatusProps) {
  if (props.retriesLeft <= 0) {
    return <div className={styles.detail}>No retries left. Reload the page to try again.</div>
  }
  return (
    <button type='button' className={styles.retryButton} disabled={props.isRetryCoolingDown} onClick={props.onRetry}>
      {props.isRetryCoolingDown ? 'Retrying…' : `Try again (${props.retriesLeft} left)`}
    </button>
  )
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
        <RetryControl {...props} />
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
        <div className={styles.detail}>The API returned no cards for this set.</div>
        <RetryControl {...props} />
      </div>
    )
  }

  return undefined
}
