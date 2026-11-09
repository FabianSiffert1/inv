import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { CardEntry, PokemonCard, toCardEntries } from '../../api/pokemonTGC/model/PokemonCard'
import { printDisplayPrice } from '../../cardPrice'
import { toEur } from '../../format/price'
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

export const sortEntries = (entries: CardEntry[], sortMode: SortMode, germanNames: boolean, eurPerUsd: number): CardEntry[] => {
  const priceOf = (entry: CardEntry): number => {
    const price = printDisplayPrice(entry.card, entry.print)
    return price == undefined ? -1 : toEur(price.amount, price.currency, eurPerUsd)
  }
  const collator = new Intl.Collator(germanNames ? 'de' : 'en', { numeric: true, sensitivity: 'base' })
  const compare: Record<SortMode, (a: CardEntry, b: CardEntry) => number> = {
    price: (a, b) => priceOf(b) - priceOf(a),
    number: (a, b) => collator.compare(a.card.number, b.card.number),
    name: (a, b) => collator.compare(localizedName(a.card, germanNames), localizedName(b.card, germanNames)),
    rarity: (a, b) =>
      rarityRank(rarityOf(a.card)) - rarityRank(rarityOf(b.card)) ||
      rarityOf(a.card).localeCompare(rarityOf(b.card)) ||
      priceOf(b) - priceOf(a),
    release: (a, b) => b.card.set.releaseDate.localeCompare(a.card.set.releaseDate) || collator.compare(a.card.number, b.card.number)
  }
  return [...entries].sort(compare[sortMode])
}

export const sortCards = (cards: PokemonCard[], sortMode: SortMode, germanNames: boolean, eurPerUsd: number): PokemonCard[] =>
  sortEntries(toCardEntries(cards), sortMode, germanNames, eurPerUsd).map((entry) => entry.card)

export default SortProvider
