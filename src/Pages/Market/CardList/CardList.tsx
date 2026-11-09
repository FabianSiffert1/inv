import { useContext } from 'react'
import { CardEntry, cardEntryKey, PokemonCard } from '../../../util/api/pokemonTGC/model/PokemonCard'
import { formatSetReleaseDate } from '../../../util/format/date'
import { rarityOf, rarityTier, RarityTier } from '../../../util/ui/sort/rarity'
import { releaseAgeBucketOf } from '../../../util/ui/sort/releaseAge'
import { SortContext } from '../../../util/ui/sort/SortProvider'
import { Urgency } from '../../../util/ui/favorites/Favorite'
import { FavoritesContext } from '../../../util/ui/favorites/FavoritesProvider'
import { LanguageContext, localizedName, useStrings } from '../../../util/ui/language/LanguageProvider'
import { Strings } from '../../../util/ui/language/strings'
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
  showUrgency?: boolean
}

interface CardSection {
  key: string
  title: string
  subtitle?: string
  tier: RarityTier
  headerClassName?: string
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

const releaseSpan = (entries: CardEntry[], t: Strings): string => {
  const newest = formatSetReleaseDate(entries[0].card.set.releaseDate, t)
  const oldest = formatSetReleaseDate(entries[entries.length - 1].card.set.releaseDate, t)
  return newest == oldest ? newest : t.range(oldest, newest)
}

const releaseAgeSections = (entries: CardEntry[], t: Strings): CardSection[] => {
  const now = new Date()
  const bucketOf = (card: PokemonCard) => releaseAgeBucketOf(card.set.releaseDate, now)
  return groupConsecutive(entries, (card) => bucketOf(card).age).map((group) => {
    const bucket = bucketOf(group[0].card)
    return { key: bucket.age, title: t.releaseAges[bucket.age], subtitle: releaseSpan(group, t), tier: bucket.tier, entries: group }
  })
}

const initialOf = (name: string): string => {
  const first = name
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .charAt(0)
    .toUpperCase()
  return /[A-Z]/.test(first) ? first : '#'
}

const nameSections = (entries: CardEntry[], germanNames: boolean): CardSection[] =>
  groupConsecutive(entries, (card) => initialOf(localizedName(card, germanNames))).map((group) => {
    const letter = initialOf(localizedName(group[0].card, germanNames))
    return { key: letter, title: letter, tier: 'regular', entries: group }
  })

const urgencyHeaderClassNames: Record<Urgency, string> = {
  urgent: styles.priorityHigh,
  normal: styles.priorityMedium,
  later: styles.priorityLow
}

const urgencySections = (entries: CardEntry[], urgencyOf: (entry: CardEntry) => Urgency, t: Strings): CardSection[] =>
  [...new Set(entries.map(urgencyOf))].map((urgency) => ({
    key: urgency,
    title: t.urgencies[urgency],
    tier: 'regular',
    headerClassName: urgencyHeaderClassNames[urgency],
    entries: entries.filter((entry) => urgencyOf(entry) == urgency)
  }))

const spansSeveralSets = (entries: CardEntry[]): boolean => new Set(entries.map((entry) => entry.card.set.id)).size > 1

const tierClassNames: Record<RarityTier, string> = {
  top: styles.tierTop,
  high: styles.tierHigh,
  regular: styles.tierRegular
}

export default function CardList(props: CardListProps) {
  const { sortMode } = useContext(SortContext)
  const { germanNames } = useContext(LanguageContext)
  const { urgencyOf } = useContext(FavoritesContext)
  const t = useStrings()
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
        showUrgency={props.showUrgency}
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
        ? releaseAgeSections(entries, t)
        : sortMode == 'name'
          ? nameSections(entries, germanNames)
          : sortMode == 'urgency'
            ? urgencySections(entries, (entry) => urgencyOf(entry.card.id, entry.print), t)
            : undefined

  if (sections == undefined) {
    return <div className={styles.cardList}>{entries.map(renderCard)}</div>
  }

  return (
    <div className={styles.sections}>
      {sections.map((section) => (
        <section key={section.key} className={styles.section} aria-label={section.title}>
          <div className={`${styles.sectionHeader} ${section.headerClassName ?? tierClassNames[section.tier]}`}>
            <h2 className={styles.sectionTitle} title={section.subtitle}>
              {section.title}
            </h2>
            <span className={styles.sectionCount}>{t.cardCount(section.entries.length)}</span>
            <span className={styles.sectionRule} aria-hidden='true' />
          </div>
          <div className={styles.cardList}>{section.entries.map(renderCard)}</div>
        </section>
      ))}
    </div>
  )
}
