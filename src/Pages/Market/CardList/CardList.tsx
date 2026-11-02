import { useContext } from 'react'
import { PokemonCard } from '../../../util/api/pokemonTGC/model/PokemonCard'
import { rarityOf, rarityTier } from '../../../util/ui/sort/rarity'
import { SortContext } from '../../../util/ui/sort/SortProvider'
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

interface RaritySection {
  rarity: string
  cards: PokemonCard[]
}

const raritySections = (cards: PokemonCard[]): RaritySection[] =>
  cards.reduce<RaritySection[]>((sections, card) => {
    const rarity = rarityOf(card)
    const lastSection = sections[sections.length - 1]
    if (lastSection?.rarity == rarity) {
      lastSection.cards.push(card)
    } else {
      sections.push({ rarity, cards: [card] })
    }
    return sections
  }, [])

const tierClassNames = {
  top: styles.tierTop,
  high: styles.tierHigh,
  regular: styles.tierRegular
}

export default function CardList(props: CardListProps) {
  const { sortMode } = useContext(SortContext)
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

  const renderCard = (card: PokemonCard) => (
    <Card
      key={card.id}
      card={card}
      isDetailsOpen={card.id == props.openCardId}
      navigation={card.id == props.openCardId ? navigation : undefined}
      onOpen={() => props.onOpenCard(card.id)}
      onClose={props.onCloseCard}
    />
  )

  if (sortMode != 'rarity') {
    return <div className={styles.cardList}>{cards.map(renderCard)}</div>
  }

  return (
    <div className={styles.sections}>
      {raritySections(cards).map((section) => (
        <section key={section.rarity} className={styles.section} aria-label={section.rarity}>
          <div className={`${styles.sectionHeader} ${tierClassNames[rarityTier(section.rarity)]}`}>
            <h2 className={styles.sectionTitle}>{section.rarity}</h2>
            <span className={styles.sectionCount}>{section.cards.length}</span>
            <span className={styles.sectionRule} aria-hidden='true' />
          </div>
          <div className={styles.cardList}>{section.cards.map(renderCard)}</div>
        </section>
      ))}
    </div>
  )
}
