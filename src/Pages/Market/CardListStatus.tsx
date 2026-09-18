import styles from './CardListStatus.module.scss'

interface CardListStatusProps {
  hasSelectedSet: boolean
  isFetching: boolean
  error: unknown
  cardCount: number
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

export default function CardListStatus(props: CardListStatusProps) {
  if (props.isFetching) {
    return undefined
  }

  if (props.error != null) {
    return (
      <div className={styles.status} role="alert">
        <div className={styles.headline}>Cards could not be loaded</div>
        <div className={styles.detail}>{messageForError(props.error)}</div>
      </div>
    )
  }

  if (!props.hasSelectedSet) {
    return (
      <div className={styles.status}>
        <div className={styles.detail}>Pick an era, then a set to see its cards.</div>
      </div>
    )
  }

  if (props.cardCount == 0) {
    return (
      <div className={styles.status}>
        <div className={styles.headline}>No cards found</div>
        <div className={styles.detail}>The API returned no cards for this set.</div>
      </div>
    )
  }

  return undefined
}
