import { useContext, useMemo } from 'react'
import { useEurPerUsd } from '../../api/pokemonTGC/hooks'
import { CardEntry, PokemonCard, toCardEntries } from '../../api/pokemonTGC/model/PokemonCard'
import { FavoritesContext } from '../favorites/FavoritesProvider'
import { LanguageContext } from '../language/LanguageProvider'
import { matchesSearch, SearchContext } from '../search/SearchProvider'
import { SortContext, sortEntries } from '../sort/SortProvider'

export const useVisibleEntries = (entries?: CardEntry[]): CardEntry[] | undefined => {
  const { sortMode, isReversed } = useContext(SortContext)
  const { germanNames } = useContext(LanguageContext)
  const { query } = useContext(SearchContext)
  const eurPerUsd = useEurPerUsd()
  const { urgencyOf } = useContext(FavoritesContext)

  const sortedEntries = useMemo(
    () =>
      entries == undefined
        ? undefined
        : sortEntries(entries, sortMode, germanNames, eurPerUsd, isReversed, (entry) => urgencyOf(entry.card.id, entry.print)),
    [entries, sortMode, germanNames, eurPerUsd, isReversed, urgencyOf]
  )

  return useMemo(() => sortedEntries?.filter((entry) => matchesSearch(entry.card, query)), [sortedEntries, query])
}

export const useVisibleCards = (cards?: PokemonCard[]): PokemonCard[] | undefined => {
  const entries = useMemo(() => (cards == undefined ? undefined : toCardEntries(cards)), [cards])
  const visibleEntries = useVisibleEntries(entries)
  return useMemo(() => visibleEntries?.map((entry) => entry.card), [visibleEntries])
}
