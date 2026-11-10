import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { PokemonCard } from '../../api/pokemonTGC/model/PokemonCard'
import { variantLabels } from '../../cardVariants'

const searchDelayMs = 200

interface ContextProps {
  input: string
  setInput: (input: string) => void
  query: string
  setQuery: (query: string) => void
  isSearchOpen: boolean
  openSearch: () => void
  closeSearch: () => void
}

export const SearchContext = createContext<ContextProps>({
  input: '',
  setInput: () => {},
  query: '',
  setQuery: () => {},
  isSearchOpen: false,
  openSearch: () => {},
  closeSearch: () => {}
})

interface Props {
  children?: React.ReactNode
}

const SearchProvider: React.FC<Props> = ({ children }) => {
  const [input, setInput] = useState('')
  const [query, setDebouncedQuery] = useState('')
  const [isSearchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    if (input.trim() == '') {
      setDebouncedQuery(input)
      return
    }
    const timeout = window.setTimeout(() => setDebouncedQuery(input), searchDelayMs)
    return () => window.clearTimeout(timeout)
  }, [input])

  const setQuery = useCallback((nextQuery: string) => {
    setInput(nextQuery)
    setDebouncedQuery(nextQuery)
  }, [])

  const openSearch = useCallback(() => setSearchOpen(true), [])

  const closeSearch = useCallback(() => {
    setSearchOpen(false)
    setQuery('')
  }, [setQuery])

  const contextValue = useMemo(
    () => ({ input, setInput, query, setQuery, isSearchOpen, openSearch, closeSearch }),
    [input, query, setQuery, isSearchOpen, openSearch, closeSearch]
  )

  return <SearchContext.Provider value={contextValue}>{children}</SearchContext.Provider>
}

const germanTypeNames: Record<string, string> = {
  Colorless: 'Farblos',
  Darkness: 'Unlicht',
  Dragon: 'Drache',
  Fairy: 'Fee',
  Fighting: 'Kampf',
  Fire: 'Feuer',
  Grass: 'Pflanze',
  Lightning: 'Elektro',
  Metal: 'Metall',
  Psychic: 'Psycho',
  Water: 'Wasser'
}

const withoutLeadingZeros = (number: string): string => number.replace(/^0+(?=.)/, '')

export const matchesSearch = (card: PokemonCard, query: string): boolean => {
  const normalizedQuery = query.trim().toLowerCase()
  if (normalizedQuery == '') {
    return true
  }
  const types = card.types ?? []
  const texts = [card.name, card.germanName, card.rarity, ...types, ...types.map((type) => germanTypeNames[type]), ...variantLabels(card)]
  const numberQuery = withoutLeadingZeros(normalizedQuery.replace(/^#/, ''))
  return (
    texts.some((text) => text?.toLowerCase().includes(normalizedQuery)) || withoutLeadingZeros(card.number.toLowerCase()) == numberQuery
  )
}

export default SearchProvider
