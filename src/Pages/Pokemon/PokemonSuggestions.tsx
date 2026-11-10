import { useContext, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CardBackIcon } from '../../Header/Title/ModeIcons'
import { MagnifyingGlassIcon } from '../../Header/SearchToggle/SearchIcon'
import { useAllSets, usePokemonIndex, useSearchIndex } from '../../util/api/pokemonTGC/hooks'
import { pokemonPath, spriteUrl } from '../../util/api/pokemonTGC/model/Pokemon'
import { setPath } from '../../util/api/pokemonTGC/model/PokemonSet'
import { matchesSearchIndex, searchPath } from '../../util/api/pokemonTGC/model/SearchIndex'
import { isSideSet } from '../../util/api/pokemonTGC/setGroups'
import { matchingSets } from '../Market/Selector/setSearch'
import { LanguageContext, localizedName, useStrings } from '../../util/ui/language/LanguageProvider'
import { SearchContext } from '../../util/ui/search/SearchProvider'
import { matchingPokemon } from './pokemonSearch'
import styles from './PokemonSuggestions.module.scss'

const minimumQueryLength = 2
const suggestionLimit = 3
const setSuggestionLimit = 2

interface PokemonSuggestionsProps {
  excludedNumber?: number
  excludedSetId?: string
  inline?: boolean
}

export default function PokemonSuggestions(props: PokemonSuggestionsProps) {
  const { query, closeSearch } = useContext(SearchContext)
  const { germanNames } = useContext(LanguageContext)
  const t = useStrings()
  const { data: pokemonIndex } = usePokemonIndex()
  const { data: sets } = useAllSets()
  const trimmedQuery = query.trim()
  const isActive = trimmedQuery.length >= minimumQueryLength && !/^#?\d+$/.test(trimmedQuery)
  const { data: searchIndex } = useSearchIndex(isActive)
  const normalizedQuery = trimmedQuery.toLowerCase()
  const cardCount = useMemo(
    () => (isActive && !props.inline ? searchIndex?.filter((entry) => matchesSearchIndex(entry, normalizedQuery)).length : undefined),
    [isActive, props.inline, searchIndex, normalizedQuery]
  )

  if (!isActive) {
    return null
  }
  const suggestions =
    pokemonIndex == undefined
      ? []
      : matchingPokemon(pokemonIndex, trimmedQuery, germanNames)
          .filter((entry) => entry.number != props.excludedNumber)
          .slice(0, suggestionLimit)
  const setSuggestions =
    sets == undefined
      ? []
      : matchingSets(
          sets.filter((set) => !isSideSet(set.id) && set.id != props.excludedSetId),
          trimmedQuery
        ).slice(0, setSuggestionLimit)
  const showsAllCards = !props.inline && cardCount != 0
  if (suggestions.length == 0 && setSuggestions.length == 0 && !showsAllCards) {
    return null
  }

  const leave = () => {
    closeSearch()
    window.scrollTo(0, 0)
  }

  return (
    <>
      {!props.inline && <div className={styles.backdrop} onClick={closeSearch} aria-hidden='true' />}
      <ul className={props.inline ? `${styles.suggestions} ${styles.inline}` : styles.suggestions} aria-label={t.suggestions}>
        {suggestions.map((entry) => (
          <li key={entry.number}>
            <Link className={styles.suggestion} to={pokemonPath(entry.number)} onClick={leave}>
              <img
                className={styles.sprite}
                src={spriteUrl(entry.number)}
                alt=''
                onError={(event) => (event.currentTarget.hidden = true)}
              />
              <span className={styles.name}>{localizedName(entry, germanNames)}</span>
              <span className={styles.count}>{t.cardsInAllSets(entry.cardCount)}</span>
            </Link>
          </li>
        ))}
        {setSuggestions.map((set) => (
          <li key={set.id}>
            <Link className={`${styles.suggestion} ${styles.setSuggestion}`} to={setPath(set.id)} onClick={leave}>
              <span className={styles.icon}>
                <CardBackIcon />
              </span>
              <span className={styles.name}>
                {t.set}: {localizedName(set, germanNames)}
              </span>
            </Link>
          </li>
        ))}
        {showsAllCards && (
          <li key='all-cards'>
            <Link className={`${styles.suggestion} ${styles.allCardsSuggestion}`} to={searchPath(trimmedQuery)} onClick={leave}>
              <span className={styles.icon}>
                <MagnifyingGlassIcon />
              </span>
              <span className={styles.name}>{t.allCardsNamed(trimmedQuery)}</span>
              <span className={styles.count}>{cardCount == undefined ? t.acrossEverySet : t.countAcrossEverySet(cardCount)}</span>
            </Link>
          </li>
        )}
      </ul>
    </>
  )
}
