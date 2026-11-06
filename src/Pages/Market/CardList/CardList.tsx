import { useContext } from 'react'
import { CardEntry, cardEntryKey, PokemonCard } from '../../../util/api/pokemonTGC/model/PokemonCard'
import { formatSetReleaseDate } from '../../../util/format/date'
import { rarityOf, rarityTier, RarityTier } from '../../../util/ui/sort/rarity'
import { releaseAgeBucketOf } from '../../../util/ui/sort/releaseAge'
import { SortContext } from '../../../util/ui/sort/SortProvider'
import { useIsMobile } from '../../../util/ui/useIsMobile'
import styles from './CardList.module.scss'
import { Card } from './Components/Card/Card'
import { CardNavigationProps } from './Components/CardDetails/CardDetails'

export interface CardListProps {
  entries?: CardEntry[]
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
  entries: CardEntry[]
}

const groupConsecutive = (entries: CardEntry[], keyOf: (card: PokemonCard) => string): CardEntry[][] =>
  entries.reduce<CardEntry[][]>((groups, entry) => {
    const lastGroup = groups[groups.length - 1]
    if (lastGroup != undefined && keyOf(lastGroup[0].card) == keyOf(entry.card)) {
      lastGroup.push(entry)
    } else {
      groups.push([entry])
    }
    return groups
  }, [])

const raritySections = (entries: CardEntry[]): CardSection[] =>
  groupConsecutive(entries, rarityOf).map((group) => {
    const rarity = rarityOf(group[0].card)
    return { key: rarity, title: rarity, tier: rarityTier(rarity), entries: group }
  })

const releaseSpan = (entries: CardEntry[]): string => {
  const newest = formatSetReleaseDate(entries[0].card.set.releaseDate)
  const oldest = formatSetReleaseDate(entries[entries.length - 1].card.set.releaseDate)
  return newest == oldest ? newest : `${oldest} to ${newest}`
}

const releaseAgeSections = (entries: CardEntry[]): CardSection[] => {
  const now = new Date()
  const bucketOf = (card: PokemonCard) => releaseAgeBucketOf(card.set.releaseDate, now)
  return groupConsecutive(entries, (card) => bucketOf(card).label).map((group) => {
    const bucket = bucketOf(group[0].card)
    return { key: bucket.label, title: bucket.label, subtitle: releaseSpan(group), tier: bucket.tier, entries: group }
  })
}

const spansSeveralSets = (entries: CardEntry[]): boolean => new Set(entries.map((entry) => entry.card.set.id)).size > 1

const tierClassNames: Record<RarityTier, string> = {
  top: styles.tierTop,
  high: styles.tierHigh,
  regular: styles.tierRegular
}

export default function CardList(props: CardListProps) {
  const { sortMode } = useContext(SortContext)
  const isMobile = useIsMobile()
  const entries = props.entries ?? []
  const openIndex = entries.findIndex((entry) => cardEntryKey(entry) == props.openCardId)
  const previousEntry = entries[openIndex - 1]
  const nextEntry = entries[openIndex + 1]
  const navigation: CardNavigationProps | undefined =
    openIndex < 0
      ? undefined
      : {
          position: openIndex + 1,
          count: entries.length,
          onPrevious: previousEntry && (() => props.onStepToCard(cardEntryKey(previousEntry))),
          onNext: nextEntry && (() => props.onStepToCard(cardEntryKey(nextEntry)))
        }

  const renderCard = (entry: CardEntry) => {
    const key = cardEntryKey(entry)
    const isOpen = key == props.openCardId
    return (
      <Card
        key={key}
        card={entry.card}
        print={entry.print}
        isDetailsOpen={isOpen}
        isMobile={isMobile}
        showNumber={sortMode == 'number'}
        navigation={isOpen ? navigation : undefined}
        onOpen={() => props.onOpenCard(key)}
        onClose={props.onCloseCard}
      />
    )
  }

  const sections =
    sortMode == 'rarity'
      ? raritySections(entries)
      : sortMode == 'release' && spansSeveralSets(entries)
        ? releaseAgeSections(entries)
        : undefined

  if (sections == undefined) {
    return <div className={styles.cardList}>{entries.map(renderCard)}</div>
  }

  return (
    <div className={styles.sections}>
      {sections.map((section) => (
        <section key={section.key} className={styles.section} aria-label={section.title}>
          <div className={`${styles.sectionHeader} ${tierClassNames[section.tier]}`}>
            <h2 className={styles.sectionTitle} title={section.subtitle}>
              {section.title}
            </h2>
            <span className={styles.sectionCount}>
              {section.entries.length} {section.entries.length == 1 ? 'card' : 'cards'}
            </span>
            <span className={styles.sectionRule} aria-hidden='true' />
          </div>
          <div className={styles.cardList}>{section.entries.map(renderCard)}</div>
        </section>
      ))}
    </div>
  )
}
