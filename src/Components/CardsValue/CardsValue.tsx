import { useMemo } from 'react'
import { CardEntry } from '../../util/api/pokemonTGC/model/PokemonCard'
import { printDisplayPrice } from '../../util/cardPrice'
import { formatPrice } from '../../util/format/price'
import styles from './CardsValue.module.scss'

interface CardsValueProps {
  entries: CardEntry[]
  label: string
}

export default function CardsValue({ entries, label }: CardsValueProps) {
  const { total, pricedCount } = useMemo(() => {
    const euroPrices = entries
      .map((entry) => printDisplayPrice(entry.card, entry.print))
      .filter((price) => price?.currency == 'EUR')
      .map((price) => price!.amount)
    return { total: euroPrices.reduce((sum, price) => sum + price, 0), pricedCount: euroPrices.length }
  }, [entries])

  if (pricedCount == 0) {
    return null
  }

  return (
    <div className={styles.value}>
      <span className={styles.label}>{label}</span>
      <span className={styles.amount}>{formatPrice(total)}</span>
      {pricedCount < entries.length && (
        <span className={styles.coverage}>
          {pricedCount} of {entries.length} cards priced
        </span>
      )}
    </div>
  )
}
