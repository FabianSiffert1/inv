import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { CardEntry, PokemonCard, toCardEntries } from '../../api/pokemonTGC/model/PokemonCard'
import { compareWithinSetGroup } from '../../api/pokemonTGC/setGroups'
import { printDisplayPrice } from '../../cardPrice'
import { toEur } from '../../format/price'
import { Urgency } from '../favorites/Favorite'
import { localizedName } from '../language/LanguageProvider'
import { noRarity, rarityOf, rarityRank } from './rarity'

export type SortMode = 'price' | 'number' | 'name' | 'rarity' | 'release' | 'urgency'

export const sortModes: SortMode[] = ['price', 'number', 'name', 'rarity', 'release', 'urgency']

const urgencyRanks: Record<Urgency, number> = { asap: 0, urgent: 1, normal: 2, later: 3 }

type SortScope = 'browse' | 'favorites'

const sortScopeSettings: Record<SortScope, { storageKey: string; defaultMode: SortMode }> = {
  browse: { storageKey: 'inv-sort', defaultMode: 'price' },
  favorites: { storageKey: 'inv-sort-favorites', defaultMode: 'release' }
}

const sortScopeOfPath = (pathname: string): SortScope => (pathname.startsWith('/inventory') ? 'favorites' : 'browse')

interface ContextProps {
  sortMode: SortMode
  isReversed: boolean
  selectSortMode: (mode: SortMode) => void
  toggleSortDirection: () => void
}

export const SortContext = createContext<ContextProps>({
  sortMode: 'price',
  isReversed: false,
  selectSortMode: () => {},
  toggleSortDirection: () => {}
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

const reversedStorageKey = (scope: SortScope): string => `${sortScopeSettings[scope].storageKey}-reversed`

const preferredReversed = (scope: SortScope): boolean => {
  try {
    return window.localStorage.getItem(reversedStorageKey(scope)) == 'true'
  } catch {
    return false
  }
}

const SortProvider: React.FC<Props> = ({ children }) => {
  const location = useLocation()
  const scope = sortScopeOfPath(location.pathname)
  const [sortModeOfScope, setSortModeOfScope] = useState<Record<SortScope, SortMode>>(() => ({
    browse: preferredSortMode('browse'),
    favorites: preferredSortMode('favorites')
  }))
  const [reversedOfScope, setReversedOfScope] = useState<Record<SortScope, boolean>>(() => ({
    browse: preferredReversed('browse'),
    favorites: preferredReversed('favorites')
  }))
  const sortMode = sortModeOfScope[scope]
  const isReversed = reversedOfScope[scope]

  useEffect(() => {
    try {
      window.localStorage.setItem(sortScopeSettings[scope].storageKey, sortMode)
      window.localStorage.setItem(reversedStorageKey(scope), String(isReversed))
    } catch {
      return
    }
  }, [scope, sortMode, isReversed])

  const selectSortMode = useCallback(
    (mode: SortMode) => {
      if (mode == sortMode) {
        return
      }
      setReversedOfScope((previous) => ({ ...previous, [scope]: false }))
      setSortModeOfScope((previous) => ({ ...previous, [scope]: mode }))
    },
    [scope, sortMode]
  )

  const toggleSortDirection = useCallback(() => setReversedOfScope((previous) => ({ ...previous, [scope]: !previous[scope] })), [scope])

  const contextValue = useMemo(
    () => ({ sortMode, isReversed, selectSortMode, toggleSortDirection }),
    [sortMode, isReversed, selectSortMode, toggleSortDirection]
  )

  return <SortContext.Provider value={contextValue}>{children}</SortContext.Provider>
}

export const sortEntries = (
  entries: CardEntry[],
  sortMode: SortMode,
  germanNames: boolean,
  eurPerUsd: number,
  isReversed: boolean,
  urgencyOf: (entry: CardEntry) => Urgency = () => 'normal'
): CardEntry[] => {
  const direction = isReversed ? -1 : 1
  const priceOf = (entry: CardEntry): number => {
    const price = printDisplayPrice(entry.card, entry.print)
    return price == undefined ? -1 : toEur(price.amount, price.currency, eurPerUsd)
  }
  const comparePrice = (a: CardEntry, b: CardEntry): number => {
    const priceOfA = priceOf(a)
    const priceOfB = priceOf(b)
    return priceOfA < 0 || priceOfB < 0 ? priceOfB - priceOfA : direction * (priceOfB - priceOfA)
  }
  const compareRarity = (a: CardEntry, b: CardEntry): number => {
    const rarityOfA = rarityOf(a.card)
    const rarityOfB = rarityOf(b.card)
    const rankDifference = rarityRank(rarityOfA) - rarityRank(rarityOfB)
    return rarityOfA == noRarity || rarityOfB == noRarity
      ? rankDifference
      : direction * (rankDifference || rarityOfA.localeCompare(rarityOfB))
  }
  const collator = new Intl.Collator(germanNames ? 'de' : 'en', { numeric: true, sensitivity: 'base' })
  const compareRelease = (a: CardEntry, b: CardEntry): number =>
    b.card.set.releaseDate.localeCompare(a.card.set.releaseDate) || collator.compare(a.card.number, b.card.number)
  const compare: Record<SortMode, (a: CardEntry, b: CardEntry) => number> = {
    price: comparePrice,
    number: (a, b) => direction * (compareWithinSetGroup(a.card.set.id, b.card.set.id) || collator.compare(a.card.number, b.card.number)),
    name: (a, b) => direction * collator.compare(localizedName(a.card, germanNames), localizedName(b.card, germanNames)),
    rarity: (a, b) => compareRarity(a, b) || comparePrice(a, b),
    release: (a, b) => direction * compareRelease(a, b),
    urgency: (a, b) => direction * (urgencyRanks[urgencyOf(a)] - urgencyRanks[urgencyOf(b)]) || compareRelease(a, b)
  }
  return [...entries].sort(compare[sortMode])
}

export const sortCards = (
  cards: PokemonCard[],
  sortMode: SortMode,
  germanNames: boolean,
  eurPerUsd: number,
  isReversed: boolean
): PokemonCard[] => sortEntries(toCardEntries(cards), sortMode, germanNames, eurPerUsd, isReversed).map((entry) => entry.card)

export default SortProvider
