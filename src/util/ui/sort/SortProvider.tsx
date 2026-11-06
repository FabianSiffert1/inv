import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { PokemonCard } from '../../api/pokemonTGC/model/PokemonCard'
import { cardDisplayPrice } from '../../cardPrice'
import { localizedName } from '../language/LanguageProvider'
import { rarityOf, rarityRank } from './rarity'

export type SortMode = 'price' | 'number' | 'name' | 'rarity' | 'release'

export const sortModes: SortMode[] = ['price', 'number', 'name', 'rarity', 'release']

export const nextSortMode = (sortMode: SortMode, modes: SortMode[] = sortModes): SortMode =>
  modes[(modes.indexOf(sortMode) + 1) % modes.length]

type SortScope = 'browse' | 'favorites'

const sortScopeSettings: Record<SortScope, { storageKey: string; defaultMode: SortMode }> = {
  browse: { storageKey: 'inv-sort', defaultMode: 'price' },
  favorites: { storageKey: 'inv-sort-favorites', defaultMode: 'release' }
}

const sortScopeOfPath = (pathname: string): SortScope => (pathname.startsWith('/inventory') ? 'favorites' : 'browse')

interface ContextProps {
  sortMode: SortMode
  cycleSortMode: (modes?: SortMode[]) => void
}

export const SortContext = createContext<ContextProps>({
  sortMode: 'price',
  cycleSortMode: () => {}
})

interface Props {
  children?: React.ReactNode
}

const preferredSortMode = (scope: SortScope): SortMode => {
  const { storageKey, defaultMode } = sortScopeSettings[scope]
  try {
    const stored = window.localStorage.getItem(storageKey)
    return sortModes.find((sortMode) => sortMode == stored) ?? defaultMode
  } catch {
    return defaultMode
  }
}

const SortProvider: React.FC<Props> = ({ children }) => {
  const location = useLocation()
  const scope = sortScopeOfPath(location.pathname)
  const [sortModeOfScope, setSortModeOfScope] = useState<Record<SortScope, SortMode>>(() => ({
    browse: preferredSortMode('browse'),
    favorites: preferredSortMode('favorites')
  }))
  const sortMode = sortModeOfScope[scope]

  useEffect(() => {
    try {
      window.localStorage.setItem(sortScopeSettings[scope].storageKey, sortMode)
    } catch {
      return
    }
  }, [scope, sortMode])

  const cycleSortMode = useCallback(
    (modes?: SortMode[]) => setSortModeOfScope((previous) => ({ ...previous, [scope]: nextSortMode(previous[scope], modes) })),
    [scope]
  )

  const contextValue = useMemo(() => ({ sortMode, cycleSortMode }), [sortMode, cycleSortMode])

  return <SortContext.Provider value={contextValue}>{children}</SortContext.Provider>
}

const trendPrice = (card: PokemonCard): number => cardDisplayPrice(card)?.amount ?? -1

export const sortCards = (cards: PokemonCard[], sortMode: SortMode, germanNames: boolean): PokemonCard[] => {
  const collator = new Intl.Collator(germanNames ? 'de' : 'en', { numeric: true, sensitivity: 'base' })
  const compare: Record<SortMode, (a: PokemonCard, b: PokemonCard) => number> = {
    price: (a, b) => trendPrice(b) - trendPrice(a),
    number: (a, b) => collator.compare(a.number, b.number),
    name: (a, b) => collator.compare(localizedName(a, germanNames), localizedName(b, germanNames)),
    rarity: (a, b) =>
      rarityRank(rarityOf(a)) - rarityRank(rarityOf(b)) || rarityOf(a).localeCompare(rarityOf(b)) || trendPrice(b) - trendPrice(a),
    release: (a, b) => b.set.releaseDate.localeCompare(a.set.releaseDate) || collator.compare(a.number, b.number)
  }
  return [...cards].sort(compare[sortMode])
}

export default SortProvider
