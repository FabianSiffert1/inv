import { useContext, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { HeaderContext } from '../../Header/HeaderProvider'
import SearchToggle from '../../Header/SearchToggle/SearchToggle'
import { useAllSets, useCardsOfSet, useSearchIndex } from '../../util/api/pokemonTGC/hooks'
import { CardEntry } from '../../util/api/pokemonTGC/model/PokemonCard'
import { matchesSearchIndex, toLightCard } from '../../util/api/pokemonTGC/model/SearchIndex'
import { useCardNavigation } from '../../util/ui/cards/useCardNavigation'
import { LanguageContext } from '../../util/ui/language/LanguageProvider'
import { SearchContext } from '../../util/ui/search/SearchProvider'
import { SortContext, sortEntries } from '../../util/ui/sort/SortProvider'
import { useIsMobile } from '../../util/ui/useIsMobile'
import CardList from '../Market/CardList/CardList'
import CardListStatus from '../Market/CardListStatus'
import styles from '../Pokemon/Pokemon.module.scss'

export default function Search() {
  const { setHeaderItem, setBusy } = useContext(HeaderContext)
  const { sortMode } = useContext(SortContext)
  const { germanNames } = useContext(LanguageContext)
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
  const sortedEntries = useMemo(() => sortEntries(entries, sortMode, germanNames), [entries, sortMode, germanNames])

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
    <div className={styles.pokemonPage}>
      {query == '' ? (
        <div className={styles.status}>
          <div className={styles.hint}>
            <div className={styles.headline}>Search every card</div>
            <div className={styles.detail}>
              Type a card name into the search box, then pick &ldquo;all cards&rdquo; from the suggestions.
            </div>
          </div>
        </div>
      ) : (
        <>
          {error != null && (
            <CardListStatus hasSelectedEra hasSelectedSet isFetching={isFetching} error={error} cardCount={0} hasNoSearchMatches={false} />
          )}
          {error == null && !isFetching && index != undefined && entries.length == 0 && (
            <div className={styles.status}>
              <div className={styles.headline}>No cards named &ldquo;{query}&rdquo;</div>
              <div className={styles.detail}>Try a shorter name, or the English name.</div>
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
  if (props.query == '') {
    return <span className={styles.pageCount}>All cards</span>
  }
  const countLabel = props.isLoading ? 'Searching' : `${props.count} ${props.count == 1 ? 'card' : 'cards'}`
  return (
    <span className={styles.pageCount}>
      {countLabel} for &ldquo;{props.query}&rdquo;
    </span>
  )
}
