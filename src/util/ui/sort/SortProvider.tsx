import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { PokemonCard } from '../../api/pokemonTGC/model/PokemonCard'
import { localizedName } from '../language/LanguageProvider'

export const sortStorageKey = 'inv-sort'

export type SortMode = 'price' | 'number' | 'name'

const sortModes: SortMode[] = ['price', 'number', 'name']

export const nextSortMode = (sortMode: SortMode): SortMode => sortModes[(sortModes.indexOf(sortMode) + 1) % sortModes.length]

interface ContextProps {
  sortMode: SortMode
  cycleSortMode: () => void
}

export const SortContext = createContext<ContextProps>({
  sortMode: 'price',
  cycleSortMode: () => {}
})

interface Props {
  children?: React.ReactNode
}

const preferredSortMode = (): SortMode => {
  try {
    const stored = window.localStorage.getItem(sortStorageKey)
    return sortModes.find((sortMode) => sortMode == stored) ?? 'price'
  } catch {
    return 'price'
  }
}

const SortProvider: React.FC<Props> = ({ children }) => {
  const [sortMode, setSortMode] = useState(preferredSortMode)

  useEffect(() => {
    try {
      window.localStorage.setItem(sortStorageKey, sortMode)
    } catch {
      return
    }
  }, [sortMode])

  const cycleSortMode = useCallback(() => setSortMode(nextSortMode), [])

  const contextValue = useMemo(() => ({ sortMode, cycleSortMode }), [sortMode, cycleSortMode])

  return <SortContext.Provider value={contextValue}>{children}</SortContext.Provider>
}

const trendPrice = (card: PokemonCard): number => card.cardmarket?.prices?.trendPrice ?? -1

export const sortCards = (cards: PokemonCard[], sortMode: SortMode, germanNames: boolean): PokemonCard[] => {
  const collator = new Intl.Collator(germanNames ? 'de' : 'en', { numeric: true, sensitivity: 'base' })
  const compare: Record<SortMode, (a: PokemonCard, b: PokemonCard) => number> = {
    price: (a, b) => trendPrice(b) - trendPrice(a),
    number: (a, b) => collator.compare(a.number, b.number),
    name: (a, b) => collator.compare(localizedName(a, germanNames), localizedName(b, germanNames))
  }
  return [...cards].sort(compare[sortMode])
}

export default SortProvider
