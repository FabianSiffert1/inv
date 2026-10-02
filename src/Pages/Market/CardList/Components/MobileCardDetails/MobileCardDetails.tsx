import { useRef } from 'react'
import { PokemonCard } from '../../../../../util/api/pokemonTGC/model/PokemonCard'
import { useLocalizedName } from '../../../../../util/ui/language/LanguageProvider'
import { useModalBehaviour } from '../../../../../util/ui/useModalBehaviour'
import { CardBaseDetails, CardMarketPrices, SetInformation, TcgPlayerPrices } from '../CardDetails/CardDetails'
import { CardImage } from '../CardImage/CardImage'
import styles from './MobileCardDetails.module.scss'

interface MobileCardDetailsProps {
  card: PokemonCard
  onClose: () => void
}

export function MobileCardDetails(props: MobileCardDetailsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  useModalBehaviour(containerRef, props.onClose)
  const cardName = useLocalizedName(props.card)

  return (
    <div className={styles.mobileCardDetailsWrapper}>
      <div className={styles.overlay} onClick={props.onClose} />
      <div className={styles.cardDetailsContainer} ref={containerRef} role='dialog' aria-modal='true' aria-label={cardName}>
        <div className={styles.mobileCardDetailsHeader}>
          <button type='button' className={styles.closeButton} aria-label='Close' onClick={props.onClose}>
            ×
          </button>
        </div>
        <div className={styles.scrollArea}>
          <div className={styles.cardImageAndBaseInfo}>
            <div className={styles.cardImageFrame}>
              <CardImage className={styles.cardImage} sources={[props.card.images.large, props.card.images.small]} alt={cardName} />
            </div>
            <CardBaseDetails card={props.card} />
          </div>
          <SetInformation card={props.card} />
          <CardMarketPrices card={props.card} />
          <TcgPlayerPrices card={props.card} />
        </div>
      </div>
    </div>
  )
}
