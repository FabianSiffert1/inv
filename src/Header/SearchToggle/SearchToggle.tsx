import { KeyboardEvent, useContext, useEffect, useRef } from 'react'
import { SearchContext } from '../../util/ui/search/SearchProvider'
import { MagnifyingGlassIcon } from './SearchIcon'
import styles from './SearchToggle.module.scss'

export default function SearchToggle() {
  const { query, setQuery, isSearchOpen, openSearch, closeSearch } = useContext(SearchContext)
  const inputRef = useRef<HTMLInputElement>(null)
  const label = isSearchOpen ? 'Close search' : 'Search this set'

  useEffect(() => {
    if (isSearchOpen) {
      inputRef.current?.focus()
    }
  }, [isSearchOpen])

  const closeOnEscape = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key == 'Escape') {
      closeSearch()
    }
  }

  return (
    <div className={`${styles.search} ${isSearchOpen ? styles.open : ''}`}>
      <input
        ref={inputRef}
        className={styles.searchField}
        type='search'
        placeholder='Name, type, rarity, #'
        aria-label='Search this set'
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={closeOnEscape}
        tabIndex={isSearchOpen ? 0 : -1}
        aria-hidden={!isSearchOpen}
      />
      <button
        type='button'
        className={styles.searchToggle}
        onClick={isSearchOpen ? closeSearch : openSearch}
        aria-label={label}
        aria-expanded={isSearchOpen}
        title={label}
      >
        <MagnifyingGlassIcon />
      </button>
    </div>
  )
}
