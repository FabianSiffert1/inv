import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { usePokemonIndex } from '../../util/api/pokemonTGC/hooks'
import { pokemonPath, spriteUrl } from '../../util/api/pokemonTGC/model/Pokemon'
import { LanguageContext, localizedName } from '../../util/ui/language/LanguageProvider'
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
  const { data: pokemonIndex } = usePokemonIndex()

  const trimmedQuery = query.trim()
  if (pokemonIndex == undefined || trimmedQuery.length < minimumQueryLength || /^#?\d+$/.test(trimmedQuery)) {
    return null
  }
  const suggestions = matchingPokemon(pokemonIndex, trimmedQuery, germanNames)
    .filter((entry) => entry.number != props.excludedNumber)
    .slice(0, suggestionLimit)
  if (suggestions.length == 0) {
    return null
  }

  return (
    <ul className={styles.suggestions} aria-label='Pokémon'>
      {suggestions.map((entry) => (
        <li key={entry.number}>
          <Link
            className={styles.suggestion}
            to={pokemonPath(entry.number)}
            onClick={() => {
              closeSearch()
              window.scrollTo(0, 0)
            }}
          >
            <img className={styles.sprite} src={spriteUrl(entry.number)} alt='' onError={(event) => (event.currentTarget.hidden = true)} />
            <span className={styles.name}>{localizedName(entry, germanNames)}</span>
            <span className={styles.count}>{entry.cardCount} cards in all sets</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
