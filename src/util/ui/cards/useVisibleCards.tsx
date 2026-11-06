import { useContext, useMemo } from 'react'
import { PokemonCard } from '../../api/pokemonTGC/model/PokemonCard'
import { LanguageContext } from '../language/LanguageProvider'
import { matchesSearch, SearchContext } from '../search/SearchProvider'
import { SortContext, sortCards } from '../sort/SortProvider'

export const useVisibleCards = (cards?: PokemonCard[]): PokemonCard[] | undefined => {
  const { sortMode } = useContext(SortContext)
  const { germanNames } = useContext(LanguageContext)
  const { query } = useContext(SearchContext)

  const sortedCards = useMemo(
    () => (cards == undefined ? undefined : sortCards(cards, sortMode, germanNames)),
    [cards, sortMode, germanNames]
  )

  return useMemo(() => sortedCards?.filter((card) => matchesSearch(card, query)), [sortedCards, query])
}
