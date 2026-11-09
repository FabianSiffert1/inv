import { useContext, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CopyButton } from '../../../../../Components/CopyButton/CopyButton'
import { FavoriteButton } from '../../../../../Components/FavoriteButton/FavoriteButton'
import { UrgencyPicker } from '../../../../../Components/UrgencyPicker/UrgencyPicker'
import { PokemonCard, PokemonCardProp } from '../../../../../util/api/pokemonTGC/model/PokemonCard'
import { spriteUrl } from '../../../../../util/api/pokemonTGC/model/Pokemon'
import { setPath } from '../../../../../util/api/pokemonTGC/model/PokemonSet'
import { formatSetReleaseDate } from '../../../../../util/format/date'
import { useLocalizedName, useStrings } from '../../../../../util/ui/language/LanguageProvider'
import { SearchContext } from '../../../../../util/ui/search/SearchProvider'
import { cardShareLink } from '../../../../../util/shareLinks'
import { useModalBehaviour } from '../../../../../util/ui/useModalBehaviour'
import { CardImage } from '../CardImage/CardImage'
import { CardPrices } from '../CardPrices/CardPrices'
import { ImageZoom } from '../ImageZoom/ImageZoom'
import ArtistLink from '../../../../Artists/ArtistLink'
import AllCardsOfPokemonLink from '../../../../Pokemon/AllCardsOfPokemonLink'
import styles from './CardDetails.module.scss'

export interface CardNavigationProps {
  position: number
  count: number
  onPrevious?: () => void
  onNext?: () => void
}

interface CardDetailsProps {
  card: PokemonCard
  print?: string
  navigation?: CardNavigationProps
  onClose: () => void
}

export function CardDetails(props: CardDetailsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  useModalBehaviour(containerRef, props.onClose, props.navigation)
  const cardName = useLocalizedName(props.card)
  const t = useStrings()
  const [isZoomOpen, setZoomOpen] = useState(false)
  const imageSources = [props.card.images.large, props.card.images.small]
  const pokedexNumber = props.card.nationalPokedexNumbers?.[0]

  return (
    <div className={styles.cardDetailsWrapper}>
      <div className={styles.overlay} onClick={props.onClose} />
      <div className={styles.cardDetailsPositioner}>
        <div className={styles.cardDetailsContainer} ref={containerRef} role='dialog' aria-modal='true' aria-label={cardName}>
          <button type='button' className={styles.closeButton} aria-label={t.close} onClick={props.onClose}>
            ×
          </button>
          <div className={styles.imageColumn}>
            <button type='button' className={styles.cardLargeImage} onClick={() => setZoomOpen(true)} aria-label={t.zoomInto(cardName)}>
              <CardImage sources={imageSources} alt={cardName} pokedexNumber={pokedexNumber} />
            </button>
            {props.navigation && <CardNavigation {...props.navigation} />}
          </div>
          <div className={styles.detailsColumn}>
            <CardBaseDetails card={props.card} print={props.print} onClose={props.onClose} />
            <SetInformation card={props.card} />
            <UrgencyPicker card={props.card} print={props.print} />
            <CardPrices card={props.card} />
          </div>
        </div>
      </div>
      {isZoomOpen && <ImageZoom sources={imageSources} alt={cardName} pokedexNumber={pokedexNumber} onClose={() => setZoomOpen(false)} />}
    </div>
  )
}

export function CardNavigation(props: CardNavigationProps) {
  const t = useStrings()

  return (
    <div className={styles.cardNavigation}>
      <button
        type='button'
        className={styles.navigationButton}
        aria-label={t.previousCard}
        disabled={!props.onPrevious}
        onClick={props.onPrevious}
      >
        ‹
      </button>
      <span className={styles.navigationPosition}>
        {props.position} / {props.count}
      </span>
      <button type='button' className={styles.navigationButton} aria-label={t.nextCard} disabled={!props.onNext} onClick={props.onNext}>
        ›
      </button>
    </div>
  )
}

interface CardBaseDetailsProps extends PokemonCardProp {
  print?: string
  onClose?: () => void
}

export function CardBaseDetails(props: CardBaseDetailsProps) {
  const cardName = useLocalizedName(props.card)
  const t = useStrings()
  const pokedexNumber = props.card.nationalPokedexNumbers?.[0]

  return (
    <div className={styles.cardBaseInformationContainer}>
      <div className={styles.titleRow}>
        {pokedexNumber != undefined && (
          <img
            key={pokedexNumber}
            className={styles.titleSprite}
            src={spriteUrl(pokedexNumber)}
            alt=''
            onError={(event) => (event.currentTarget.hidden = true)}
          />
        )}
        <h2 className={styles.cardTitle}>{cardName}</h2>
        <CopyButton variant='share' value={cardShareLink(props.card)} label={t.copyLinkToCard} />
        <FavoriteButton card={props.card} print={props.print} showPrint={props.print != undefined} />
      </div>
      <div className={styles.metaRow}>
        {props.card.rarity && <span className={styles.metaChip}>{props.card.rarity}</span>}
        <span className={styles.metaChip}>
          {props.card.number}/{props.card.set.printedTotal}
        </span>
        {props.card.evolvesFrom && <span className={styles.metaMuted}>{t.evolvesFrom(props.card.evolvesFrom)}</span>}
        {props.card.artist && <ArtistLink name={props.card.artist} className={styles.artistChip} fallbackClassName={styles.metaMuted} />}
      </div>
      {pokedexNumber != undefined && <AllCardsOfPokemonLink pokedexNumber={pokedexNumber} />}
    </div>
  )
}

export function SetInformation(props: PokemonCardProp) {
  const setName = useLocalizedName(props.card.set)
  const seriesName = useLocalizedName({ name: props.card.set.series, germanName: props.card.set.germanSeries })
  const [searchParams] = useSearchParams()
  const isCurrentSet = searchParams.get('set') == props.card.set.id
  const { closeSearch } = useContext(SearchContext)
  const t = useStrings()

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        {isCurrentSet ? (
          <span className={styles.panelTitle}>{setName}</span>
        ) : (
          <Link
            className={`${styles.panelLink} ${styles.setLink}`}
            to={setPath(props.card.set.id)}
            onClick={() => {
              closeSearch()
              window.scrollTo(0, 0)
            }}
          >
            <span className={styles.panelTitle}>{setName}</span>
          </Link>
        )}
      </div>
      <dl className={styles.definitionList}>
        <div className={styles.definitionRow}>
          <dt>{t.released}</dt>
          <dd>{formatSetReleaseDate(props.card.set.releaseDate, t)}</dd>
        </div>
        <div className={styles.definitionRow}>
          <dt>{t.cards}</dt>
          <dd>{props.card.set.total}</dd>
        </div>
        <div className={styles.definitionRow}>
          <dt>{t.series}</dt>
          <dd>{seriesName}</dd>
        </div>
        {props.card.set.legalities?.unlimited && (
          <div className={styles.definitionRow}>
            <dt>{t.legality}</dt>
            <dd>{props.card.set.legalities.unlimited}</dd>
          </div>
        )}
      </dl>
    </section>
  )
}
