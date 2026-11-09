import { useContext, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { MagnifyingGlassIcon } from '../../Header/SearchToggle/SearchIcon'
import { usePokemonIndex, useSearchIndex } from '../../util/api/pokemonTGC/hooks'
import { pokemonPath, spriteUrl } from '../../util/api/pokemonTGC/model/Pokemon'
import { matchesSearchIndex, searchPath } from '../../util/api/pokemonTGC/model/SearchIndex'
import { LanguageContext, localizedName, useStrings } from '../../util/ui/language/LanguageProvider'
import { SearchContext } from '../../util/ui/search/SearchProvider'
import { matchingPokemon } from './pokemonSearch'
import styles from './PokemonSuggestions.module.scss'

const minimumQueryLength = 2
const suggestionLimit = 3

interface PokemonSuggestionsProps {
  excludedNumber?: number
}

export default function PokemonSuggestions(props: PokemonSuggestionsProps) {
  const { query, closeSearch } = useContext(SearchContext)
  const { germanNames } = useContext(LanguageContext)
  const t = useStrings()
  const { data: pokemonIndex } = usePokemonIndex()
  const trimmedQuery = query.trim()
  const isActive = trimmedQuery.length >= minimumQueryLength && !/^#?\d+$/.test(trimmedQuery)
  const { data: searchIndex } = useSearchIndex(isActive)
  const normalizedQuery = trimmedQuery.toLowerCase()
  const cardCount = useMemo(
    () => (isActive ? searchIndex?.filter((entry) => matchesSearchIndex(entry, normalizedQuery)).length : undefined),
    [isActive, searchIndex, normalizedQuery]
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
  if (suggestions.length == 0 && cardCount == 0) {
    return null
  }

  const leave = () => {
    closeSearch()
    window.scrollTo(0, 0)
  }

  return (
    <>
      <div className={styles.backdrop} onClick={closeSearch} aria-hidden='true' />
      <ul className={styles.suggestions} aria-label={t.suggestions}>
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
        {cardCount != 0 && (
          <li key='all-cards'>
            <Link className={styles.suggestion} to={searchPath(trimmedQuery)} onClick={leave}>
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
