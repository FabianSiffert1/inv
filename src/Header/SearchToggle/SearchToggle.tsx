import { KeyboardEvent, useContext, useEffect, useRef } from 'react'
import { useStrings } from '../../util/ui/language/LanguageProvider'
import { SearchContext } from '../../util/ui/search/SearchProvider'
import { MagnifyingGlassIcon } from './SearchIcon'
import styles from './SearchToggle.module.scss'

interface SearchToggleProps {
  floating?: boolean
}

export default function SearchToggle({ floating = false }: SearchToggleProps) {
  const { input, setInput, isSearchOpen, openSearch, closeSearch } = useContext(SearchContext)
  const inputRef = useRef<HTMLInputElement>(null)
  const t = useStrings()
  const label = isSearchOpen ? t.closeSearch : t.searchCards

  useEffect(() => {
    if (isSearchOpen) {
      inputRef.current?.focus()
    }
  }, [isSearchOpen])

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key == 'Escape') {
      closeSearch()
    }
    if (event.key == 'Enter') {
      inputRef.current?.blur()
    }
  }

  return (
    <div className={`${styles.search} ${floating ? styles.floating : ''} ${isSearchOpen ? styles.open : ''}`}>
      <input
        ref={inputRef}
        className={styles.searchField}
        type='search'
        placeholder={t.searchPlaceholder}
        aria-label={t.searchCards}
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={handleKeyDown}
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
        {floating && isSearchOpen ? <span className={styles.closeGlyph}>×</span> : <MagnifyingGlassIcon />}
      </button>
    </div>
  )
}
