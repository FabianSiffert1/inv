import { useMemo } from 'react'
import { PokemonCard } from '../../util/api/pokemonTGC/model/PokemonCard'
import { formatPrice } from '../../util/format/price'
import styles from './CardsValue.module.scss'

interface CardsValueProps {
  cards: PokemonCard[]
  label: string
}

export default function CardsValue({ cards, label }: CardsValueProps) {
  const { total, pricedCount } = useMemo(() => {
    const trendPrices = cards.map((card) => card.cardmarket?.prices?.trendPrice).filter((price): price is number => price != undefined)
    return { total: trendPrices.reduce((sum, price) => sum + price, 0), pricedCount: trendPrices.length }
  }, [cards])

  if (pricedCount == 0) {
    return null
  }

  return (
    <div className={styles.value}>
      <span className={styles.label}>{label}</span>
      <span className={styles.amount}>{formatPrice(total)}</span>
      {pricedCount < cards.length && (
        <span className={styles.coverage}>
          {pricedCount} of {cards.length} cards priced
        </span>
      )}
    </div>
  )
}
