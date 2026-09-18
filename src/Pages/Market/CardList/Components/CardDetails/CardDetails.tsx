import { ReactElement, useRef } from 'react'
import { PokemonCard, PokemonCardProp, TcgPlayer, TcgPlayerPriceSet } from '../../../../../util/api/pokemonTGC/model/PokemonCard'
import { formatPrice } from '../../../../../util/format/price'
import { formatSetReleaseDate } from '../../../../../util/format/date'
import { useModalBehaviour } from '../../../../../util/ui/useModalBehaviour'
import { ExternalLink } from '../ExternalLink/ExternalLink'
import styles from './CardDetails.module.scss'

interface CardDetailsProps {
  card: PokemonCard
  onClose: () => void
}

interface PriceSetProps {
  cardType: string
  priceSet?: TcgPlayerPriceSet
}

interface PriceRowProps {
  label: string
  price?: number
}

export function CardDetails(props: CardDetailsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  useModalBehaviour(containerRef, props.onClose)

  return (
    <div className={styles.cardDetailsWrapper}>
      <div className={styles.overlay} onClick={props.onClose} />
      <div className={styles.cardDetailsPositioner}>
        <div className={styles.cardDetailsContainer} ref={containerRef} role='dialog' aria-modal='true' aria-label={props.card.name}>
          <button type='button' className={styles.closeButton} aria-label='Close' onClick={props.onClose}>
            ×
          </button>
          <div className={styles.cardLargeImage}>
            {props.card.images.large && <img src={props.card.images.large} alt={props.card.name} decoding='async' />}
          </div>
          <div className={styles.detailsColumn}>
            <CardBaseDetails card={props.card} />
            <SetInformation card={props.card} />
            <div className={styles.panelRow}>
              <CardMarketPrices card={props.card} />
              <TcgPlayerPrices card={props.card} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CardBaseDetails(props: PokemonCardProp) {
  return (
    <div className={styles.cardBaseInformationContainer}>
      <h2 className={styles.cardTitle}>{props.card.name}</h2>
      <div className={styles.metaRow}>
        {props.card.rarity && <span className={styles.metaChip}>{props.card.rarity}</span>}
        <span className={styles.metaChip}>
          {props.card.number}/{props.card.set.printedTotal}
        </span>
        {props.card.evolvesFrom && <span className={styles.metaMuted}>Evolves from {props.card.evolvesFrom}</span>}
        {props.card.artist && <span className={styles.metaMuted}>Illus. {props.card.artist}</span>}
      </div>
    </div>
  )
}

export function SetInformation(props: PokemonCardProp) {
  return (
    <section className={`${styles.panel} ${styles.setPanel}`}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>{props.card.set.name}</span>
        {props.card.set.images?.symbol && <img className={styles.setSymbol} src={props.card.set.images.symbol} alt='' />}
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
          <dd>{props.card.set.series}</dd>
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
  const formatted = formatPrice(props.price)
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
          <ExternalLink href={props.card.cardmarket.url}>
            <span className={styles.panelTitle}>Cardmarket</span>
          </ExternalLink>
        ) : (
          <span className={styles.panelTitle}>Cardmarket</span>
        )}
      </div>
      {prices == undefined ? (
        <div className={styles.emptyPanel}>No prices available.</div>
      ) : (
        <dl className={styles.definitionList}>
          <PriceRow label='Trend' price={prices.trendPrice} />
          <PriceRow label='Average' price={prices.averageSellPrice} />
          <PriceRow label='Avg. 30 days' price={prices.avg30} />
          <PriceRow label='Suggested' price={prices.suggestedPrice} />
        </dl>
      )}
    </section>
  )
}

export function TcgPlayerPrices(props: PokemonCardProp) {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        {props.card.tcgplayer?.url ? (
          <ExternalLink href={props.card.tcgplayer.url}>
            <span className={styles.panelTitle}>TCGPlayer</span>
          </ExternalLink>
        ) : (
          <span className={styles.panelTitle}>TCGPlayer</span>
        )}
      </div>
      {props.card.tcgplayer == undefined ? (
        <div className={styles.emptyPanel}>No prices available.</div>
      ) : (
        <TcgPlayerPriceList tcgPlayer={props.card.tcgplayer} />
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
          <PriceRow key={key} label={tcgPlayerPriceLabels[key]} price={priceSet[key]} />
        ))}
      </dl>
    </div>
  )
}
