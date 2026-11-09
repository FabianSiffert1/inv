import { useRef, useState } from 'react'
import { UrgencyPicker } from '../../../../../Components/UrgencyPicker/UrgencyPicker'
import { PokemonCard } from '../../../../../util/api/pokemonTGC/model/PokemonCard'
import { useLocalizedName, useStrings } from '../../../../../util/ui/language/LanguageProvider'
import { useModalBehaviour } from '../../../../../util/ui/useModalBehaviour'
import { CardBaseDetails, CardNavigation, CardNavigationProps, SetInformation } from '../CardDetails/CardDetails'
import { CardPrices } from '../CardPrices/CardPrices'
import { CardImage } from '../CardImage/CardImage'
import { ImageZoom } from '../ImageZoom/ImageZoom'
import styles from './MobileCardDetails.module.scss'

interface MobileCardDetailsProps {
  card: PokemonCard
  print?: string
  navigation?: CardNavigationProps
  onClose: () => void
}

export function MobileCardDetails(props: MobileCardDetailsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  useModalBehaviour(containerRef, props.onClose, props.navigation)
  const cardName = useLocalizedName(props.card)
  const t = useStrings()
  const [isZoomOpen, setZoomOpen] = useState(false)
  const imageSources = [props.card.images.large, props.card.images.small]
  const pokedexNumber = props.card.nationalPokedexNumbers?.[0]

  return (
    <div className={styles.mobileCardDetailsWrapper}>
      <div className={styles.overlay} onClick={props.onClose} />
      <div className={styles.cardDetailsContainer} ref={containerRef} role='dialog' aria-modal='true' aria-label={cardName}>
        <div className={styles.mobileCardDetailsHeader}>
          {props.navigation && <CardNavigation {...props.navigation} />}
          <button type='button' className={styles.closeButton} aria-label={t.close} onClick={props.onClose}>
            ×
          </button>
        </div>
        <div className={styles.scrollArea}>
          <div className={styles.cardImageAndBaseInfo}>
            <button type='button' className={styles.cardImageFrame} onClick={() => setZoomOpen(true)} aria-label={t.zoomInto(cardName)}>
              <CardImage className={styles.cardImage} sources={imageSources} alt={cardName} pokedexNumber={pokedexNumber} />
            </button>
            <CardBaseDetails card={props.card} print={props.print} onClose={props.onClose} />
          </div>
          <SetInformation card={props.card} />
          <UrgencyPicker card={props.card} print={props.print} />
          <CardPrices card={props.card} />
        </div>
      </div>
      {isZoomOpen && <ImageZoom sources={imageSources} alt={cardName} pokedexNumber={pokedexNumber} onClose={() => setZoomOpen(false)} />}
    </div>
  )
}
