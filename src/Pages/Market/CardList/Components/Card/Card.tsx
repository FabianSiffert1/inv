import { MouseEvent, useContext } from 'react'
import { StarIcon } from '../../../../../Components/FavoriteButton/FavoriteButton'
import { LanguageBadge } from '../../../../../Components/LanguageBadge/LanguageBadge'
import { UrgencyBadge } from '../../../../../Components/UrgencyPicker/UrgencyPicker'
import { PokemonCard } from '../../../../../util/api/pokemonTGC/model/PokemonCard'
import { FavoritesContext } from '../../../../../util/ui/favorites/FavoritesProvider'
import { useLocalizedName, useStrings } from '../../../../../util/ui/language/LanguageProvider'
import { printDisplayPrice } from '../../../../../util/cardPrice'
import { formatPriceParts } from '../../../../../util/format/price'
import { CardDetails, CardNavigationProps } from '../CardDetails/CardDetails'
import { CardImage } from '../CardImage/CardImage'
import { ExternalLink } from '../ExternalLink/ExternalLink'
import { MobileCardDetails } from '../MobileCardDetails/MobileCardDetails'
import styles from './Card.module.scss'

interface CardProps {
  card: PokemonCard
}

interface CardWithDetailsProps extends CardProps {
  print?: string
  isDetailsOpen: boolean
  isMobile: boolean
  showNumber?: boolean
  showUrgency?: boolean
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

export function Card({
  card,
  print,
  isDetailsOpen,
  isMobile,
  showNumber = false,
  showUrgency = false,
  navigation,
  onOpen,
  onClose
}: CardWithDetailsProps) {
  const cardName = useLocalizedName(card)
  const { favorites, urgencyOf } = useContext(FavoritesContext)
  const showFavoriteMark =
    !showUrgency && favorites.some((favorite) => favorite.cardId == card.id && (print == undefined || favorite.print == print))

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
          <MobileCardDetails card={card} print={print} navigation={navigation} onClose={onClose} />
        ) : (
          <CardDetails card={card} print={print} navigation={navigation} onClose={onClose} />
        ))}
      <button type='button' className={styles.card} onClick={onOpen}>
        <CardImage
          className={styles.cardImage}
          sources={[card.images.small]}
          alt={cardName}
          pokedexNumber={card.nationalPokedexNumbers?.[0]}
          lazy
        />
        {showFavoriteMark && (
          <span className={styles.favoriteMark} aria-hidden='true'>
            <StarIcon />
          </span>
        )}
      </button>
      <div className={styles.cardInformationWrapper}>
        <div className={styles.cardName}>{cardName}</div>
        <LanguageBadge language={card.language} />
        {print != undefined && <div className={styles.cardPrint}>{print}</div>}
        {showUrgency && <UrgencyBadge urgency={urgencyOf(card.id, print)} />}
        {showNumber && (
          <div className={styles.cardNumber}>
            {card.number}/{card.set.printedTotal}
          </div>
        )}
        <CardPrice card={card} print={print} />
      </div>
    </div>
  )
}

function CardPrice({ card, print }: CardProps & { print?: string }) {
  const t = useStrings()
  const displayPrice = printDisplayPrice(card, print)
  const formatted = displayPrice && formatPriceParts(displayPrice.amount, displayPrice.currency)
  const priceLabel = formatted && (
    <>
      {formatted.amount}&nbsp;<span className={styles.currency}>{formatted.currency}</span>
    </>
  )

  return (
    <div className={displayPrice?.source == 'tcgplayer' ? `${styles.cardPrice} ${styles.fallbackPrice}` : styles.cardPrice}>
      {displayPrice == undefined || priceLabel == undefined ? (
        <span className={styles.noPrice}>{t.noPrice}</span>
      ) : displayPrice.url ? (
        <ExternalLink href={displayPrice.url} plain>
          {priceLabel}
        </ExternalLink>
      ) : (
        <span>{priceLabel}</span>
      )}
      {displayPrice?.source == 'tcgplayer' && <span className={styles.priceSource}>TCGplayer</span>}
    </div>
  )
}
