import { useContext } from 'react'
import { PokemonCard } from '../../../util/api/pokemonTGC/model/PokemonCard'
import { formatSetReleaseDate } from '../../../util/format/date'
import { rarityOf, rarityTier, RarityTier } from '../../../util/ui/sort/rarity'
import { releaseAgeBucketOf } from '../../../util/ui/sort/releaseAge'
import { SortContext } from '../../../util/ui/sort/SortProvider'
import { useIsMobile } from '../../../util/ui/useIsMobile'
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

interface CardSection {
  key: string
  title: string
  subtitle?: string
  tier: RarityTier
  cards: PokemonCard[]
}

const groupConsecutive = (cards: PokemonCard[], keyOf: (card: PokemonCard) => string): PokemonCard[][] =>
  cards.reduce<PokemonCard[][]>((groups, card) => {
    const lastGroup = groups[groups.length - 1]
    if (lastGroup != undefined && keyOf(lastGroup[0]) == keyOf(card)) {
      lastGroup.push(card)
    } else {
      groups.push([card])
    }
    return groups
  }, [])

const raritySections = (cards: PokemonCard[]): CardSection[] =>
  groupConsecutive(cards, rarityOf).map((group) => {
    const rarity = rarityOf(group[0])
    return { key: rarity, title: rarity, tier: rarityTier(rarity), cards: group }
  })

const releaseSpan = (cards: PokemonCard[]): string => {
  const newest = formatSetReleaseDate(cards[0].set.releaseDate)
  const oldest = formatSetReleaseDate(cards[cards.length - 1].set.releaseDate)
  return newest == oldest ? newest : `${oldest} to ${newest}`
}

const releaseAgeSections = (cards: PokemonCard[]): CardSection[] => {
  const now = new Date()
  const bucketOf = (card: PokemonCard) => releaseAgeBucketOf(card.set.releaseDate, now)
  return groupConsecutive(cards, (card) => bucketOf(card).label).map((group) => {
    const bucket = bucketOf(group[0])
    return { key: bucket.label, title: bucket.label, subtitle: releaseSpan(group), tier: bucket.tier, cards: group }
  })
}

const spansSeveralSets = (cards: PokemonCard[]): boolean => new Set(cards.map((card) => card.set.id)).size > 1

const tierClassNames: Record<RarityTier, string> = {
  top: styles.tierTop,
  high: styles.tierHigh,
  regular: styles.tierRegular
}

export default function CardList(props: CardListProps) {
  const { sortMode } = useContext(SortContext)
  const isMobile = useIsMobile()
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
      isMobile={isMobile}
      navigation={card.id == props.openCardId ? navigation : undefined}
      onOpen={() => props.onOpenCard(card.id)}
      onClose={props.onCloseCard}
    />
  )

  const sections =
    sortMode == 'rarity' ? raritySections(cards) : sortMode == 'release' && spansSeveralSets(cards) ? releaseAgeSections(cards) : undefined

  if (sections == undefined) {
    return <div className={styles.cardList}>{cards.map(renderCard)}</div>
  }

  return (
    <div className={styles.sections}>
      {sections.map((section) => (
        <section key={section.key} className={styles.section} aria-label={section.title}>
          <div className={`${styles.sectionHeader} ${tierClassNames[section.tier]}`}>
            <h2 className={styles.sectionTitle}>{section.title}</h2>
            <span className={styles.sectionCount}>{section.cards.length}</span>
            {section.subtitle && <span className={styles.sectionSubtitle}>{section.subtitle}</span>}
            <span className={styles.sectionRule} aria-hidden='true' />
          </div>
          <div className={styles.cardList}>{section.cards.map(renderCard)}</div>
        </section>
      ))}
    </div>
  )
}
