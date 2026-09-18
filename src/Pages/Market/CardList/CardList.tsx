import { PokemonCard } from '../../../util/api/pokemonTGC/model/PokemonCard'
import styles from './CardList.module.scss'
import { Card } from './Components/Card/Card'

export interface CardListProps {
  cards?: PokemonCard[]
}

export default function CardList(props: CardListProps) {
  return (
    <div className={styles.cardList}>
      {props.cards?.map((card) => (
        <Card key={card.id} card={card} />
      ))}
    </div>
  )
}
