import { HttpError, isNetworkError } from '../../util/api/pokemonTGC/querys'
import { useStrings } from '../../util/ui/language/LanguageProvider'
import { Strings } from '../../util/ui/language/strings'
import styles from './CardListStatus.module.scss'

interface CardListStatusProps {
  hasSelectedEra: boolean
  hasSelectedSet: boolean
  isFetching: boolean
  error: unknown
  cardCount: number
  hasNoSearchMatches: boolean
}

const messageForError = (error: unknown, t: Strings): string => {
  if (error instanceof HttpError && error.status == 404) {
    return t.loadErrorNotFound
  }
  if (error instanceof HttpError && error.status >= 500) {
    return t.loadErrorServer
  }
  if (isNetworkError(error)) {
    return t.loadErrorNetwork
  }
  return t.loadErrorGeneric
}

export default function CardListStatus(props: CardListStatusProps) {
  const t = useStrings()

  if (props.isFetching) {
    return undefined
  }

  if (props.error != null) {
    return (
      <div className={styles.status} role='alert'>
        <div className={styles.headline}>{t.cardsNotLoaded}</div>
        <div className={styles.detail}>{messageForError(props.error, t)}</div>
      </div>
    )
  }

  if (!props.hasSelectedSet) {
    return (
      <div className={styles.status}>
        <div className={styles.hint}>
          <div className={styles.headline}>{props.hasSelectedEra ? t.nowPickSet : t.welcomeTrainer}</div>
          <div className={styles.detail}>{props.hasSelectedEra ? t.pickSetHint : t.pickEraHint}</div>
        </div>
      </div>
    )
  }

  if (props.cardCount == 0) {
    return (
      <div className={styles.status}>
        <div className={styles.headline}>{t.noCardsFound}</div>
        <div className={styles.detail}>{t.noCardsInSet}</div>
      </div>
    )
  }

  if (props.hasNoSearchMatches) {
    return (
      <div className={styles.status}>
        <div className={styles.headline}>{t.noMatchingCards}</div>
        <div className={styles.detail}>{t.noMatchingCardsHint}</div>
      </div>
    )
  }

  return undefined
}
