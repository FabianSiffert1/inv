import { useContext, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CopyButton } from '../../../../../Components/CopyButton/CopyButton'
import { FavoriteButton } from '../../../../../Components/FavoriteButton/FavoriteButton'
import { PokemonCard, PokemonCardProp } from '../../../../../util/api/pokemonTGC/model/PokemonCard'
import { spriteUrl } from '../../../../../util/api/pokemonTGC/model/Pokemon'
import { setPath } from '../../../../../util/api/pokemonTGC/model/PokemonSet'
import { cardPriceRows, PriceCell } from '../../../../../util/cardPrice'
import { Currency, formatPrice } from '../../../../../util/format/price'
import { formatPriceDate, formatSetReleaseDate } from '../../../../../util/format/date'
import { useLocalizedName } from '../../../../../util/ui/language/LanguageProvider'
import { SearchContext } from '../../../../../util/ui/search/SearchProvider'
import { cardShareLink, priceChartingSearchLink } from '../../../../../util/shareLinks'
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
  print?: string
  navigation?: CardNavigationProps
  onClose: () => void
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
            <CardBaseDetails card={props.card} print={props.print} onClose={props.onClose} />
            <SetInformation card={props.card} />
            <CardPrices card={props.card} />
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
  print?: string
  onClose?: () => void
}

export function CardBaseDetails(props: CardBaseDetailsProps) {
  const cardName = useLocalizedName(props.card)
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
        <FavoriteButton card={props.card} print={props.print} showPrint={props.print != undefined} />
      </div>
      <div className={styles.metaRow}>
        {props.card.rarity && <span className={styles.metaChip}>{props.card.rarity}</span>}
        <span className={styles.metaChip}>
          {props.card.number}/{props.card.set.printedTotal}
        </span>
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

function PriceUpdatedAt({ updatedAt }: { updatedAt?: string }) {
  const formatted = formatPriceDate(updatedAt)
  if (formatted == undefined) {
    return null
  }
  return (
    <div className={styles.priceUpdated}>
      Prices from <span className={styles.priceDate}>{formatted}</span>
    </div>
  )
}

function PriceCellContent({ cell, currency, emphasized }: { cell?: PriceCell; currency: Currency; emphasized: boolean }) {
  if (cell == undefined) {
    return <span className={styles.priceMissing}>–</span>
  }
  const amount = formatPrice(cell.amount, currency)
  const highest = formatPrice(cell.highestAmount, currency)
  const text = highest != undefined && highest != amount ? `${amount} to ${highest}` : amount
  const className = emphasized ? `${styles.priceAmount} ${styles.priceAmountMain}` : styles.priceAmount
  return cell.url ? (
    <ExternalLink href={cell.url} className={`${className} ${styles.priceLink}`} plain>
      {text}
    </ExternalLink>
  ) : (
    <span className={className}>{text}</span>
  )
}

export function CardPrices(props: PokemonCardProp) {
  const rows = cardPriceRows(props.card)
  const cardmarketUrl = props.card.cardmarket?.url

  return (
    <section className={styles.panel}>
      {rows.length == 0 ? (
        <div className={styles.emptyPanel}>No prices available.</div>
      ) : (
        <>
          <table className={styles.priceTable}>
            <thead>
              <tr>
                <th scope='col' />
                <th scope='col'>
                  <span className={styles.priceColumn}>
                    <span className={styles.priceColumnLabel}>Cardmarket</span>
                    <GermanListingsLink cardmarketUrl={cardmarketUrl} />
                  </span>
                </th>
                <th scope='col'>
                  <span className={styles.priceColumnLabel}>TCGplayer</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <th scope='row' className={styles.priceRowLabel}>
                    <FavoriteButton card={props.card} print={row.isMain ? undefined : row.label} small />
                    {row.label}
                  </th>
                  <td>
                    <PriceCellContent cell={row.cardmarket} currency='EUR' emphasized={row.isMain} />
                  </td>
                  <td>
                    <PriceCellContent cell={row.tcgplayer} currency='USD' emphasized={row.isMain} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.priceFooter}>
            <ExternalLink
              href={priceChartingSearchLink(props.card)}
              className={styles.panelLink}
              title='Graded and raw prices on PriceCharting'
            >
              <span className={styles.panelTitle}>PriceCharting</span>
            </ExternalLink>
            <PriceUpdatedAt updatedAt={props.card.cardmarket?.updatedAt ?? props.card.tcgplayer?.updatedAt} />
          </div>
        </>
      )}
    </section>
  )
}
