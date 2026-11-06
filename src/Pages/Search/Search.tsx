import { useCallback, useContext, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { HeaderContext } from '../../Header/HeaderProvider'
import SearchToggle from '../../Header/SearchToggle/SearchToggle'
import { useAllSets, useSearchIndex } from '../../util/api/pokemonTGC/hooks'
import { CardEntry } from '../../util/api/pokemonTGC/model/PokemonCard'
import { cardPath } from '../../util/api/pokemonTGC/model/PokemonSet'
import { matchesSearchIndex, toLightCard } from '../../util/api/pokemonTGC/model/SearchIndex'
import { LanguageContext } from '../../util/ui/language/LanguageProvider'
import { SortContext, sortEntries } from '../../util/ui/sort/SortProvider'
import { useIsMobile } from '../../util/ui/useIsMobile'
import CardList from '../Market/CardList/CardList'
import CardListStatus from '../Market/CardListStatus'
import styles from '../Pokemon/Pokemon.module.scss'

const noop = () => {}

export default function Search() {
  const { setHeaderItem, setBusy } = useContext(HeaderContext)
  const { sortMode } = useContext(SortContext)
  const { germanNames } = useContext(LanguageContext)
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const query = (searchParams.get('q') ?? '').trim()
  const normalizedQuery = query.toLowerCase()

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

  const openCard = useCallback(
    (key: string) => {
      const entry = entries.find((candidate) => candidate.card.id == key)
      if (entry != undefined) {
        window.scrollTo(0, 0)
        navigate(cardPath(entry.card.set.id, entry.card.id))
      }
    },
    [entries, navigate]
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
            <CardList entries={sortedEntries} onOpenCard={openCard} onStepToCard={noop} onCloseCard={noop} />
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
