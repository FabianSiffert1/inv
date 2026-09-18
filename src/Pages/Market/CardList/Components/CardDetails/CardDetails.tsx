import React, { ReactElement, useEffect } from 'react'
import { PokemonCard, PokemonCardProp, TcgPlayer, TcgPlayerPriceSet } from '../../../../../util/api/pokemonTGC/model/PokemonCard'
import { formatPrice } from '../../../../../util/format/price'
import { ExternalLink } from '../ExternalLink/ExternalLink'
import styles from './CardDetails.module.scss'

interface CardDetailsProps {
  card: PokemonCard
  toggleCardDetailsPopUp: (newState: boolean) => void
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
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key == 'Escape') {
        props.toggleCardDetailsPopUp(false)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className={styles.cardDetailsWrapper} key={props.card.id}>
      <div className={styles.overlay} onClick={() => props.toggleCardDetailsPopUp(false)} />
      <div className={styles.cardDetailsPositioner}>
        <div className={styles.cardDetailsContainer} role="dialog" aria-modal="true" aria-label={props.card.name}>
        <button
          type="button"
          className={styles.closeButton}
          aria-label="Close"
          onClick={() => props.toggleCardDetailsPopUp(false)}
        >
          ×
        </button>
        <div className={styles.cardLargeImage}>
          {props.card.images.large && <img src={props.card.images.large} alt={props.card.name} />}
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

export function CardBaseDetails(card: PokemonCardProp) {
  return (
    <div className={styles.cardBaseInformationContainer}>
      <h2 className={styles.cardTitle}>{card.card.name}</h2>
      <div className={styles.metaRow}>
        {card.card.rarity && <span className={styles.metaChip}>{card.card.rarity}</span>}
        <span className={styles.metaChip}>
          {card.card.number}/{card.card.set.printedTotal}
        </span>
        {card.card.evolvesFrom && <span className={styles.metaMuted}>Evolves from {card.card.evolvesFrom}</span>}
        {card.card.artist && <span className={styles.metaMuted}>Illus. {card.card.artist}</span>}
      </div>
    </div>
  )
}

export function SetInformation(card: PokemonCardProp) {
  const setReleaseDate = new Date(card.card?.set?.releaseDate)
  const setReleaseMonth = setReleaseDate.toLocaleString('default', { month: 'long' })
  const setReleaseString = setReleaseMonth.concat(' ').concat(setReleaseDate.getFullYear().toString())

  return (
    <section className={`${styles.panel} ${styles.setPanel}`}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>{card.card?.set?.name}</span>
        {card.card?.set?.images?.symbol && <img className={styles.setSymbol} src={card.card.set.images.symbol} alt="" />}
      </div>
      <dl className={styles.definitionList}>
        <div className={styles.definitionRow}>
          <dt>Released</dt>
          <dd>{setReleaseString}</dd>
        </div>
        <div className={styles.definitionRow}>
          <dt>Cards</dt>
          <dd>{card.card.set.total}</dd>
        </div>
        <div className={styles.definitionRow}>
          <dt>Series</dt>
          <dd>{card.card.set.series}</dd>
        </div>
        {card.card.set.legalities?.unlimited && (
          <div className={styles.definitionRow}>
            <dt>Legality</dt>
            <dd>{card.card.set.legalities.unlimited}</dd>
          </div>
        )}
      </dl>
    </section>
  )
}

export function PriceRow(props: PriceRowProps) {
  const formatted = formatPrice(props.price)
  if (formatted == undefined) {
    return <></>
  }
  return (
    <div className={styles.definitionRow}>
      <dt>{props.label}</dt>
      <dd className={styles.priceValue}>{formatted}</dd>
    </div>
  )
}

export function CardMarketPrices(card: PokemonCardProp) {
  const prices = card.card.cardmarket?.prices

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        {card.card.cardmarket?.url ? (
          <ExternalLink href={card.card.cardmarket.url}>
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
          <PriceRow label="Trend" price={prices.trendPrice} />
          <PriceRow label="Average" price={prices.averageSellPrice} />
          <PriceRow label="Avg. 30 days" price={prices.avg30} />
          <PriceRow label="Suggested" price={prices.suggestedPrice} />
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
        TcgPlayerComponent(props.card.tcgplayer)
      )}
    </section>
  )
}

export function TcgPlayerComponent(tcgPlayer: TcgPlayer) {
  if (tcgPlayer.prices == undefined) {
    return <div className={styles.emptyPanel}>No prices available.</div>
  }
  return (
    <div className={styles.tcgPlayerPriceList}>
      <PriceSet cardType="Normal" priceSet={tcgPlayer.prices.normal} />
      <PriceSet cardType="1st Edition Holofoil" priceSet={tcgPlayer.prices['1stEditionHolofoil']} />
      <PriceSet cardType="1st Edition" priceSet={tcgPlayer.prices['1stEdition']} />
      <PriceSet cardType="Unlimited Holofoil" priceSet={tcgPlayer.prices.unlimitedHolofoil} />
      <PriceSet cardType="Unlimited" priceSet={tcgPlayer.prices.unlimited} />
      <PriceSet cardType="Holofoil" priceSet={tcgPlayer.prices.holofoil} />
      <PriceSet cardType="Reverse Holofoil" priceSet={tcgPlayer.prices.reverseHolofoil} />
    </div>
  )
}

export function PriceSet({ cardType, priceSet }: PriceSetProps): ReactElement {
  if (priceSet == undefined) {
    return <></>
  }
  return (
    <div className={styles.tcgPlayerPriceSet}>
      <div className={styles.priceSetTitle}>{cardType}</div>
      <dl className={styles.definitionList}>
        {Object.entries(priceSet).map(([key, value]) => (value ? <PriceRow key={key} label={key} price={value} /> : undefined))}
      </dl>
    </div>
  )
}
