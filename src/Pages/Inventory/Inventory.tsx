import { useCallback, useContext, useEffect, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { HeaderContext } from '../../Header/HeaderProvider'
import { useCardsOfSets } from '../../util/api/pokemonTGC/hooks'
import { PokemonCard } from '../../util/api/pokemonTGC/model/PokemonCard'
import { FavoritesContext } from '../../util/ui/favorites/FavoritesProvider'
import { LanguageContext } from '../../util/ui/language/LanguageProvider'
import { matchesSearch, SearchContext } from '../../util/ui/search/SearchProvider'
import { SortContext, sortCards } from '../../util/ui/sort/SortProvider'
import CardList from '../Market/CardList/CardList'
import styles from './Inventory.module.scss'

export default function Inventory() {
  const { setHeaderItem, setBusy } = useContext(HeaderContext)
  const { favorites } = useContext(FavoritesContext)
  const { sortMode } = useContext(SortContext)
  const { germanNames } = useContext(LanguageContext)
  const { query } = useContext(SearchContext)

  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const openCardId = searchParams.get('card') ?? undefined

  const setIds = useMemo(() => [...new Set(favorites.map((favorite) => favorite.setId))], [favorites])
  const setQueries = useCardsOfSets(setIds)
  const isFetching = setQueries.some((setQuery) => setQuery.isFetching)
  const loadedCards = setQueries.flatMap((setQuery) => setQuery.data ?? [])

  const favoriteIds = new Set(favorites.map((favorite) => favorite.cardId))
  const favoriteCards = sortCards(
    loadedCards.filter((card: PokemonCard) => favoriteIds.has(card.id)),
    sortMode,
    germanNames
  ).filter((card) => matchesSearch(card, query))

  const openCard = useCallback((cardId: string) => setSearchParams({ card: cardId }, { state: { openedInApp: true } }), [setSearchParams])

  const stepToCard = useCallback(
    (cardId: string) => setSearchParams({ card: cardId }, { replace: true, state: location.state }),
    [setSearchParams, location.state]
  )

  const closeCard = useCallback(() => {
    if ((location.state as { openedInApp?: boolean } | null)?.openedInApp) {
      navigate(-1)
    } else {
      setSearchParams({}, { replace: true })
    }
  }, [location.state, navigate, setSearchParams])

  useEffect(() => {
    setHeaderItem(undefined)
  }, [setHeaderItem])

  useEffect(() => {
    setBusy(isFetching)
  }, [setBusy, isFetching])

  useEffect(() => () => setBusy(false), [setBusy])

  if (favorites.length == 0) {
    return (
      <div className={styles.inventory}>
        <div className={styles.headline}>No favorites yet</div>
        <div className={styles.detail}>Open a card and tap the star next to its name to keep it here.</div>
      </div>
    )
  }

  return (
    <div className={styles.favorites}>
      <CardList cards={favoriteCards} openCardId={openCardId} onOpenCard={openCard} onStepToCard={stepToCard} onCloseCard={closeCard} />
    </div>
  )
}
