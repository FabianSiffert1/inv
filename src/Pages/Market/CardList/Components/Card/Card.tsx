import React, { useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { Link } from 'react-router-dom'
import { PokemonCard } from '../../../../../util/api/pokemonTGC/model/PokemonCard'
import { CardDetails } from '../CardDetails/CardDetails'
import { MobileCardDetails } from '../MobileCardDetails/MobileCardDetails'
import styles from './Card.module.scss'

interface CardProps {
  card: PokemonCard
}

export const Card = ({ card }: { card: PokemonCard }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2
  })

  return (
    <div ref={ref} key={card.id + 'lazy'} className={styles.cardWrapper}>
      {inView && <CardContent card={card} />}
    </div>
  )
}

function CardContent(props: CardProps) {
  const [cardDetailsVisible, _setCardDetailsVisible] = useState(false)

  function setCardDetailsVisible(newState: boolean) {
    _setCardDetailsVisible(newState)
  }

  return (
    <div className={styles.cardContainer} key={props.card.id}>
      {cardDetailsVisible && <MobileCardDetails card={props.card} toggleCardDetailsPopUp={setCardDetailsVisible} />}
      {cardDetailsVisible && <CardDetails card={props.card} toggleCardDetailsPopUp={setCardDetailsVisible} />}
      <div
        key={props.card.set.id}
        className={styles.card}
        style={props.card.images.small ? { backgroundImage: `url(${props.card.images.small})` } : undefined}
        onClick={() => setCardDetailsVisible(true)}
      />
      <div className={styles.cardInformationWrapper}>
        <div className={styles.cardName}>{props.card.name ? props.card.name : null}</div>
        {CardSubLines(props)}
      </div>
    </div>
  )
}

function CardSubLines(props: CardProps) {
  return (
    <div className={styles.cardAdditionalInformation}>
      <div className={styles.cardPrices}>
        <span className={styles.cardMarketPriceAndLink}>
          {props?.card?.cardmarket?.url ? (
            <Link to={props.card.cardmarket.url} target='_blank' rel='noopener noreferrer'>
              {props?.card?.cardmarket?.prices?.trendPrice?.toString().concat(' €')}
            </Link>
          ) : (
            props?.card?.cardmarket?.prices?.trendPrice?.toString().concat(' €')
          )}
        </span>
      </div>
    </div>
  )
}
