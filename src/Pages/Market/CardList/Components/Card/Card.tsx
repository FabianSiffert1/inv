import { MouseEvent } from 'react'
import { PokemonCard } from '../../../../../util/api/pokemonTGC/model/PokemonCard'
import { useLocalizedName } from '../../../../../util/ui/language/LanguageProvider'
import { formatPriceParts } from '../../../../../util/format/price'
import { useIsMobile } from '../../../../../util/ui/useIsMobile'
import { CardDetails, CardNavigationProps } from '../CardDetails/CardDetails'
import { CardImage } from '../CardImage/CardImage'
import { ExternalLink } from '../ExternalLink/ExternalLink'
import { MobileCardDetails } from '../MobileCardDetails/MobileCardDetails'
import styles from './Card.module.scss'

interface CardProps {
  card: PokemonCard
}

interface CardWithDetailsProps extends CardProps {
  isDetailsOpen: boolean
  navigation?: CardNavigationProps
  onOpen: () => void
  onClose: () => void
}

const typeTintClassNames: Record<string, string> = {
  Water: styles.tintBlue,
  Grass: styles.tintMint,
  Psychic: styles.tintLavender,
  Fairy: styles.tintPink,
  Fire: styles.tintRed,
  Fighting: styles.tintBrown,
  Lightning: styles.tintYellow,
  Colorless: styles.tintBeige,
  Darkness: styles.tintDarkGreen,
  Metal: styles.tintMetal,
  Dragon: styles.tintTeal
}

export const tintClassNameOfType = (type?: string): string => typeTintClassNames[type ?? ''] ?? styles.tintEggshell

const tintClassName = (card: PokemonCard): string => tintClassNameOfType(card.types?.[0])

export function Card({ card, isDetailsOpen, navigation, onOpen, onClose }: CardWithDetailsProps) {
  const isMobile = useIsMobile()
  const cardName = useLocalizedName(card)

  const openFromTile = (event: MouseEvent<HTMLDivElement>) => {
    if (isDetailsOpen || (event.target as HTMLElement).closest('a, button') != null) {
      return
    }
    onOpen()
  }

  return (
    <div className={`${styles.cardWrapper} ${tintClassName(card)} ${isDetailsOpen ? styles.detailsOpen : ''}`} onClick={openFromTile}>
      {isDetailsOpen &&
        (isMobile ? (
          <MobileCardDetails card={card} navigation={navigation} onClose={onClose} />
        ) : (
          <CardDetails card={card} navigation={navigation} onClose={onClose} />
        ))}
      <button type='button' className={styles.card} onClick={onOpen}>
        <CardImage
          className={styles.cardImage}
          sources={[card.images.small]}
          alt={cardName}
          pokedexNumber={card.nationalPokedexNumbers?.[0]}
          lazy
        />
      </button>
      <div className={styles.cardInformationWrapper}>
        <div className={styles.cardName}>{cardName}</div>
        <CardPrice card={card} />
      </div>
    </div>
  )
}

function CardPrice({ card }: CardProps) {
  const trendPrice = formatPriceParts(card.cardmarket?.prices?.trendPrice)
  const cardMarketUrl = card.cardmarket?.url
  const priceLabel = trendPrice && (
    <>
      {trendPrice.amount}&nbsp;<span className={styles.currency}>{trendPrice.currency}</span>
    </>
  )

  return (
    <div className={styles.cardPrice}>
      {trendPrice == undefined ? (
        <span className={styles.noPrice}>No price</span>
      ) : cardMarketUrl ? (
        <ExternalLink href={cardMarketUrl} plain>
          {priceLabel}
        </ExternalLink>
      ) : (
        <span>{priceLabel}</span>
      )}
    </div>
  )
}
