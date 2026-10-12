import { PokemonCard } from '../../../util/api/pokemonTGC/model/PokemonCard'
import styles from './CardList.module.scss'
import { Card } from './Components/Card/Card'
import { CardNavigationProps } from './Components/CardDetails/CardDetails'

export interface CardListProps {
  cards?: PokemonCard[]
  openCardId?: string
  onOpenCard: (cardId: string) => void
  onStepToCard: (cardId: string) => void
  onCloseCard: () => void
}

export default function CardList(props: CardListProps) {
  const cards = props.cards ?? []
  const openIndex = cards.findIndex((card) => card.id == props.openCardId)
  const previousCard = cards[openIndex - 1]
  const nextCard = cards[openIndex + 1]
  const navigation: CardNavigationProps | undefined =
    openIndex < 0
      ? undefined
      : {
          position: openIndex + 1,
          count: cards.length,
          onPrevious: previousCard && (() => props.onStepToCard(previousCard.id)),
          onNext: nextCard && (() => props.onStepToCard(nextCard.id))
        }

  return (
    <div className={styles.cardList}>
      {cards.map((card) => (
        <Card
          key={card.id}
          card={card}
          isDetailsOpen={card.id == props.openCardId}
          navigation={card.id == props.openCardId ? navigation : undefined}
          onOpen={() => props.onOpenCard(card.id)}
          onClose={props.onCloseCard}
        />
      ))}
    </div>
  )
}
