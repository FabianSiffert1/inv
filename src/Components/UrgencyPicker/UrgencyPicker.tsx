import { useContext } from 'react'
import { PokemonCard } from '../../util/api/pokemonTGC/model/PokemonCard'
import { urgencies, Urgency } from '../../util/ui/favorites/Favorite'
import { FavoritesContext } from '../../util/ui/favorites/FavoritesProvider'
import { useStrings } from '../../util/ui/language/LanguageProvider'
import styles from './UrgencyPicker.module.scss'

interface UrgencyPickerProps {
  card: PokemonCard
  print?: string
}

const urgencyClassNames: Record<Urgency, string> = {
  asap: styles.asap,
  urgent: styles.urgent,
  normal: styles.normal,
  later: styles.later
}

export function UrgencyPicker({ card, print }: UrgencyPickerProps) {
  const { isFavorite, urgencyOf, setUrgency } = useContext(FavoritesContext)
  const t = useStrings()
  if (!isFavorite(card.id, print)) {
    return null
  }
  const current = urgencyOf(card.id, print)

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>{t.purchaseUrgency}</span>
      </div>
      <div className={styles.options} role='radiogroup' aria-label={t.purchaseUrgency}>
        {urgencies.map((urgency) => {
          const isCurrent = urgency == current
          return (
            <button
              key={urgency}
              type='button'
              role='radio'
              aria-checked={isCurrent}
              className={isCurrent ? `${styles.option} ${styles.current} ${urgencyClassNames[urgency]}` : styles.option}
              onClick={() => setUrgency(card.id, print, urgency)}
            >
              {t.urgencies[urgency]}
            </button>
          )
        })}
      </div>
    </section>
  )
}

export function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  const t = useStrings()
  if (urgency == 'normal') {
    return null
  }
  return <span className={`${styles.badge} ${urgencyClassNames[urgency]}`}>{t.urgencies[urgency]}</span>
}
