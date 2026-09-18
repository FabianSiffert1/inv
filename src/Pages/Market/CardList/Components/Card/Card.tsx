import { useState } from 'react'
import { PokemonCard } from '../../../../../util/api/pokemonTGC/model/PokemonCard'
import { formatPrice } from '../../../../../util/format/price'
import { useIsMobile } from '../../../../../util/ui/useIsMobile'
import { CardDetails } from '../CardDetails/CardDetails'
import { ExternalLink } from '../ExternalLink/ExternalLink'
import { MobileCardDetails } from '../MobileCardDetails/MobileCardDetails'
import styles from './Card.module.scss'

interface CardProps {
  card: PokemonCard
}

export function Card({ card }: CardProps) {
  const [areCardDetailsVisible, setCardDetailsVisible] = useState(false)
  const isMobile = useIsMobile()

  const closeCardDetails = () => setCardDetailsVisible(false)

  return (
    <div className={styles.cardWrapper}>
      {areCardDetailsVisible &&
        (isMobile ? <MobileCardDetails card={card} onClose={closeCardDetails} /> : <CardDetails card={card} onClose={closeCardDetails} />)}
      <button type='button' className={styles.card} onClick={() => setCardDetailsVisible(true)}>
        {card.images.small ? (
          <img className={styles.cardImage} src={card.images.small} alt={card.name} loading='lazy' decoding='async' />
        ) : (
          <span className={styles.missingImage} aria-hidden='true' />
        )}
      </button>
      <div className={styles.cardInformationWrapper}>
        <div className={styles.cardName}>{card.name}</div>
        <CardPrice card={card} />
      </div>
    </div>
  )
}

function CardPrice({ card }: CardProps) {
  const trendPrice = formatPrice(card.cardmarket?.prices?.trendPrice)
  const cardMarketUrl = card.cardmarket?.url

  return (
    <div className={styles.cardPrice}>
      {trendPrice == undefined ? (
        <span className={styles.noPrice}>No price</span>
      ) : cardMarketUrl ? (
        <ExternalLink href={cardMarketUrl} plain>
          {trendPrice}
        </ExternalLink>
      ) : (
        <span>{trendPrice}</span>
      )}
    </div>
  )
}
