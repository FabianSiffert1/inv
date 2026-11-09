import { useContext, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { HeaderContext } from '../../Header/HeaderProvider'
import SearchToggle from '../../Header/SearchToggle/SearchToggle'
import { useAllSets, useCardsOfSet, useEurPerUsd, useSearchIndex } from '../../util/api/pokemonTGC/hooks'
import { CardEntry } from '../../util/api/pokemonTGC/model/PokemonCard'
import { matchesSearchIndex, toLightCard } from '../../util/api/pokemonTGC/model/SearchIndex'
import { useCardNavigation } from '../../util/ui/cards/useCardNavigation'
import { LanguageContext, useStrings } from '../../util/ui/language/LanguageProvider'
import { SearchContext } from '../../util/ui/search/SearchProvider'
import { SortContext, sortEntries } from '../../util/ui/sort/SortProvider'
import { useIsMobile } from '../../util/ui/useIsMobile'
import CardList from '../Market/CardList/CardList'
import CardListStatus from '../Market/CardListStatus'
import styles from '../Page.module.scss'

export default function Search() {
  const { setHeaderItem, setBusy } = useContext(HeaderContext)
  const { sortMode, isReversed } = useContext(SortContext)
  const { germanNames } = useContext(LanguageContext)
  const t = useStrings()
  const eurPerUsd = useEurPerUsd()
  const isMobile = useIsMobile()
  const [searchParams, setSearchParams] = useSearchParams()
  const { query: liveQuery, isSearchOpen, setQuery, openSearch } = useContext(SearchContext)
  const urlQuery = searchParams.get('q') ?? ''
  const query = urlQuery.trim()
  const normalizedQuery = query.toLowerCase()

  const seededQuery = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (urlQuery != '' && seededQuery.current != urlQuery && liveQuery != urlQuery) {
      seededQuery.current = urlQuery
      setQuery(urlQuery)
      openSearch()
    }
  }, [urlQuery, liveQuery, setQuery, openSearch])

  useEffect(() => {
    if (isSearchOpen && liveQuery != urlQuery) {
      seededQuery.current = liveQuery
      setSearchParams(liveQuery == '' ? {} : { q: liveQuery }, { replace: true })
    }
  }, [isSearchOpen, liveQuery, urlQuery, setSearchParams])

  const { data: sets } = useAllSets()
  const { data: index, isFetching, error } = useSearchIndex(normalizedQuery != '')

  const entries = useMemo((): CardEntry[] => {
    if (index == undefined || sets == undefined || normalizedQuery == '') {
      return []
    }
    const setsById = new Map(sets.map((set) => [set.id, set]))
    return index.flatMap((entry) => {
      const set = setsById.get(entry.setId)
      return set != undefined && matchesSearchIndex(entry, normalizedQuery) ? [{ card: toLightCard(entry, set) }] : []
    })
  }, [index, sets, normalizedQuery])
  const sortedEntries = useMemo(
    () => sortEntries(entries, sortMode, germanNames, eurPerUsd, isReversed),
    [entries, sortMode, germanNames, eurPerUsd, isReversed]
  )

  const baseParams = useMemo(() => (urlQuery == '' ? undefined : { q: urlQuery }), [urlQuery])
  const { openCardId, openCard, stepToCard, closeCard } = useCardNavigation(baseParams)
  const openEntry = sortedEntries.find((entry) => entry.card.id == openCardId)
  const { data: openSetCards } = useCardsOfSet(openEntry?.card.set.name)
  const fullOpenCard = openSetCards?.find((card) => card.id == openCardId)
  const displayedEntries = useMemo(
    () =>
      fullOpenCard == undefined
        ? sortedEntries
        : sortedEntries.map((entry) => (entry.card.id == fullOpenCard.id ? { card: fullOpenCard } : entry)),
    [sortedEntries, fullOpenCard]
  )

  useEffect(() => {
    setHeaderItem(<SearchStatus query={query} count={entries.length} isLoading={isFetching} />)
  }, [setHeaderItem, query, entries.length, isFetching])

  useEffect(() => {
    setBusy(isFetching)
  }, [setBusy, isFetching])

  useEffect(() => () => setBusy(false), [setBusy])

  return (
    <div className={styles.page}>
      {query == '' ? (
        <div className={styles.status}>
          <div className={styles.hint}>
            <div className={styles.headline}>{t.searchEveryCard}</div>
            <div className={styles.detail}>{t.searchHint}</div>
          </div>
        </div>
      ) : (
        <>
          {error != null && (
            <CardListStatus hasSelectedEra hasSelectedSet isFetching={isFetching} error={error} cardCount={0} hasNoSearchMatches={false} />
          )}
          {error == null && !isFetching && index != undefined && entries.length == 0 && (
            <div className={styles.status}>
              <div className={styles.headline}>{t.noCardsNamed(query)}</div>
              <div className={styles.detail}>{t.noCardsNamedHint}</div>
            </div>
          )}
          <div className={styles.listWrapper}>
            <CardList
              entries={displayedEntries}
              openCardId={openCardId}
              onOpenCard={openCard}
              onStepToCard={stepToCard}
              onCloseCard={closeCard}
            />
          </div>
        </>
      )}
      {isMobile && <SearchToggle floating />}
    </div>
  )
}

interface SearchStatusProps {
  query: string
  count: number
  isLoading: boolean
}

function SearchStatus(props: SearchStatusProps) {
  const t = useStrings()
  if (props.query == '') {
    return <span className={styles.pageCount}>{t.allCards}</span>
  }
  const countLabel = props.isLoading ? t.searching : t.cardCount(props.count)
  return <span className={styles.pageCount}>{t.countFor(countLabel, props.query)}</span>
}
