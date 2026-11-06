import { ReactElement, useContext, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CopyButton } from '../../../../../Components/CopyButton/CopyButton'
import { FavoriteButton } from '../../../../../Components/FavoriteButton/FavoriteButton'
import {
  CardMarketPriceSet,
  PokemonCard,
  PokemonCardProp,
  TcgPlayer,
  TcgPlayerPriceSet
} from '../../../../../util/api/pokemonTGC/model/PokemonCard'
import { spriteUrl } from '../../../../../util/api/pokemonTGC/model/Pokemon'
import { setPath } from '../../../../../util/api/pokemonTGC/model/PokemonSet'
import { variantLabels } from '../../../../../util/cardVariants'
import { Currency, formatPrice } from '../../../../../util/format/price'
import { formatPriceDate, formatSetReleaseDate } from '../../../../../util/format/date'
import { useLocalizedName } from '../../../../../util/ui/language/LanguageProvider'
import { SearchContext } from '../../../../../util/ui/search/SearchProvider'
import { cardShareLink } from '../../../../../util/shareLinks'
import { useModalBehaviour } from '../../../../../util/ui/useModalBehaviour'
import { CardImage } from '../CardImage/CardImage'
import { ExternalLink } from '../ExternalLink/ExternalLink'
import { GermanListingsLink } from '../GermanListingsLink/GermanListingsLink'
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
  navigation?: CardNavigationProps
  onClose: () => void
}

interface PriceSetProps {
  cardType: string
  priceSet?: TcgPlayerPriceSet
}

interface PriceRowProps {
  label: string
  price?: number
  currency?: Currency
}

export function CardDetails(props: CardDetailsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  useModalBehaviour(containerRef, props.onClose, props.navigation)
  const cardName = useLocalizedName(props.card)
  const [isZoomOpen, setZoomOpen] = useState(false)
  const imageSources = [props.card.images.large, props.card.images.small]
  const pokedexNumber = props.card.nationalPokedexNumbers?.[0]

  return (
    <div className={styles.cardDetailsWrapper}>
      <div className={styles.overlay} onClick={props.onClose} />
      <div className={styles.cardDetailsPositioner}>
        <div className={styles.cardDetailsContainer} ref={containerRef} role='dialog' aria-modal='true' aria-label={cardName}>
          <button type='button' className={styles.closeButton} aria-label='Close' onClick={props.onClose}>
            ×
          </button>
          <div className={styles.imageColumn}>
            <button type='button' className={styles.cardLargeImage} onClick={() => setZoomOpen(true)} aria-label={`Zoom into ${cardName}`}>
              <CardImage sources={imageSources} alt={cardName} pokedexNumber={pokedexNumber} />
            </button>
            {props.navigation && <CardNavigation {...props.navigation} />}
          </div>
          <div className={styles.detailsColumn}>
            <CardBaseDetails card={props.card} onClose={props.onClose} />
            <SetInformation card={props.card} />
            <div className={styles.panelRow}>
              <CardMarketPrices card={props.card} />
              <TcgPlayerPrices card={props.card} />
            </div>
          </div>
        </div>
      </div>
      {isZoomOpen && <ImageZoom sources={imageSources} alt={cardName} pokedexNumber={pokedexNumber} onClose={() => setZoomOpen(false)} />}
    </div>
  )
}

export function CardNavigation(props: CardNavigationProps) {
  return (
    <div className={styles.cardNavigation}>
      <button
        type='button'
        className={styles.navigationButton}
        aria-label='Previous card'
        disabled={!props.onPrevious}
        onClick={props.onPrevious}
      >
        ‹
      </button>
      <span className={styles.navigationPosition}>
        {props.position} / {props.count}
      </span>
      <button type='button' className={styles.navigationButton} aria-label='Next card' disabled={!props.onNext} onClick={props.onNext}>
        ›
      </button>
    </div>
  )
}

interface CardBaseDetailsProps extends PokemonCardProp {
  onClose?: () => void
}

export function CardBaseDetails(props: CardBaseDetailsProps) {
  const cardName = useLocalizedName(props.card)
  const { setQuery, openSearch } = useContext(SearchContext)
  const searchFor = (label: string) => {
    setQuery(label)
    openSearch()
    props.onClose?.()
  }
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
        <CopyButton variant='share' value={cardShareLink(props.card)} label='Copy link to this card' />
        <FavoriteButton card={props.card} />
      </div>
      <div className={styles.metaRow}>
        {props.card.rarity && <span className={styles.metaChip}>{props.card.rarity}</span>}
        <span className={styles.metaChip}>
          {props.card.number}/{props.card.set.printedTotal}
        </span>
        {variantLabels(props.card).map((label) => (
          <button
            key={label}
            type='button'
            className={`${styles.metaChip} ${styles.variantChip}`}
            title={`Search for `}
            onClick={() => searchFor(label)}
          >
            {label}
          </button>
        ))}
        {props.card.evolvesFrom && <span className={styles.metaMuted}>Evolves from {props.card.evolvesFrom}</span>}
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

  return (
    <section className={`${styles.panel} ${styles.setPanel}`}>
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
        {props.card.set.images?.symbol && (
          <img
            className={styles.setSymbol}
            src={props.card.set.images.symbol}
            alt=''
            onError={(event) => (event.currentTarget.hidden = true)}
          />
        )}
      </div>
      <dl className={styles.definitionList}>
        <div className={styles.definitionRow}>
          <dt>Released</dt>
          <dd>{formatSetReleaseDate(props.card.set.releaseDate)}</dd>
        </div>
        <div className={styles.definitionRow}>
          <dt>Cards</dt>
          <dd>{props.card.set.total}</dd>
        </div>
        <div className={styles.definitionRow}>
          <dt>Series</dt>
          <dd>{seriesName}</dd>
        </div>
        {props.card.set.legalities?.unlimited && (
          <div className={styles.definitionRow}>
            <dt>Legality</dt>
            <dd>{props.card.set.legalities.unlimited}</dd>
          </div>
        )}
      </dl>
    </section>
  )
}

export function PriceRow(props: PriceRowProps) {
  const formatted = formatPrice(props.price, props.currency)
  if (formatted == undefined) {
    return null
  }
  return (
    <div className={styles.definitionRow}>
      <dt>{props.label}</dt>
      <dd className={styles.priceValue}>{formatted}</dd>
    </div>
  )
}

export function CardMarketPrices(props: PokemonCardProp) {
  const prices = props.card.cardmarket?.prices

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        {props.card.cardmarket?.url ? (
          <>
            <ExternalLink href={props.card.cardmarket.url} className={styles.panelLink}>
              <span className={styles.panelTitle}>Cardmarket</span>
            </ExternalLink>
            <GermanListingsLink cardmarketUrl={props.card.cardmarket.url} />
            <span className={styles.panelAction}>
              <CopyButton value={props.card.cardmarket.url} label='Copy Cardmarket link' />
            </span>
          </>
        ) : (
          <span className={styles.panelTitle}>Cardmarket</span>
        )}
      </div>
      {prices == undefined ? (
        <div className={styles.emptyPanel}>No prices available.</div>
      ) : (
        <>
          <dl className={styles.definitionList}>
            <PriceRow label='Trend' price={prices.trendPrice} />
            <PriceRow label='Average' price={prices.averageSellPrice} />
            <PriceRow label='Avg. 30 days' price={prices.avg30} />
            <PriceRow label='Suggested' price={prices.suggestedPrice} />
          </dl>
          <ReverseHoloPrices prices={prices} />
          <PriceUpdatedAt updatedAt={props.card.cardmarket?.updatedAt} />
        </>
      )}
    </section>
  )
}

function PriceUpdatedAt({ updatedAt }: { updatedAt?: string }) {
  const formatted = formatPriceDate(updatedAt)
  if (formatted == undefined) {
    return null
  }
  return <div className={styles.priceUpdated}>Prices from {formatted}</div>
}

function ReverseHoloPrices({ prices }: { prices: CardMarketPriceSet }) {
  const hasReverseHoloPrices = [prices.reverseHoloTrend, prices.reverseHoloSell, prices.reverseHoloAvg30, prices.reverseHoloLow].some(
    (price) => price != undefined
  )
  if (!hasReverseHoloPrices) {
    return null
  }
  return (
    <div className={styles.tcgPlayerPriceSet}>
      <div className={styles.priceSetTitle}>Reverse Holofoil</div>
      <dl className={styles.definitionList}>
        <PriceRow label='Trend' price={prices.reverseHoloTrend} />
        <PriceRow label='Average' price={prices.reverseHoloSell} />
        <PriceRow label='Avg. 30 days' price={prices.reverseHoloAvg30} />
        <PriceRow label='Low' price={prices.reverseHoloLow} />
      </dl>
    </div>
  )
}

export function TcgPlayerPrices(props: PokemonCardProp) {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        {props.card.tcgplayer?.url ? (
          <>
            <ExternalLink href={props.card.tcgplayer.url} className={styles.panelLink}>
              <span className={styles.panelTitle}>TCGPlayer</span>
            </ExternalLink>
            <span className={styles.panelAction}>
              <CopyButton value={props.card.tcgplayer.url} label='Copy TCGPlayer link' />
            </span>
          </>
        ) : (
          <span className={styles.panelTitle}>TCGPlayer</span>
        )}
      </div>
      {props.card.tcgplayer == undefined ? (
        <div className={styles.emptyPanel}>No prices available.</div>
      ) : (
        <>
          <TcgPlayerPriceList tcgPlayer={props.card.tcgplayer} />
          <PriceUpdatedAt updatedAt={props.card.tcgplayer.updatedAt} />
        </>
      )}
    </section>
  )
}

export function TcgPlayerPriceList({ tcgPlayer }: { tcgPlayer: TcgPlayer }) {
  if (tcgPlayer.prices == undefined) {
    return <div className={styles.emptyPanel}>No prices available.</div>
  }
  return (
    <div className={styles.tcgPlayerPriceList}>
      <PriceSet cardType='Normal' priceSet={tcgPlayer.prices.normal} />
      <PriceSet cardType='1st Edition Holofoil' priceSet={tcgPlayer.prices['1stEditionHolofoil']} />
      <PriceSet cardType='1st Edition' priceSet={tcgPlayer.prices['1stEdition']} />
      <PriceSet cardType='Unlimited Holofoil' priceSet={tcgPlayer.prices.unlimitedHolofoil} />
      <PriceSet cardType='Unlimited' priceSet={tcgPlayer.prices.unlimited} />
      <PriceSet cardType='Holofoil' priceSet={tcgPlayer.prices.holofoil} />
      <PriceSet cardType='Reverse Holofoil' priceSet={tcgPlayer.prices.reverseHolofoil} />
    </div>
  )
}

const tcgPlayerPriceLabels: Record<keyof TcgPlayerPriceSet, string> = {
  low: 'Low',
  mid: 'Mid',
  high: 'High',
  market: 'Market',
  directLow: 'Direct low'
}

export function PriceSet({ cardType, priceSet }: PriceSetProps): ReactElement | null {
  if (priceSet == undefined) {
    return null
  }
  return (
    <div className={styles.tcgPlayerPriceSet}>
      <div className={styles.priceSetTitle}>{cardType}</div>
      <dl className={styles.definitionList}>
        {(Object.keys(tcgPlayerPriceLabels) as (keyof TcgPlayerPriceSet)[]).map((key) => (
          <PriceRow key={key} label={tcgPlayerPriceLabels[key]} price={priceSet[key]} currency='USD' />
        ))}
      </dl>
    </div>
  )
}
