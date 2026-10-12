import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { HeaderContext } from '../../Header/HeaderProvider'
import { useCardsOfSets } from '../../util/api/pokemonTGC/hooks'
import { PokemonCard } from '../../util/api/pokemonTGC/model/PokemonCard'
import { PokemonSet, PokemonTCGSeries } from '../../util/api/pokemonTGC/model/PokemonSet'
import { FavoritesContext } from '../../util/ui/favorites/FavoritesProvider'
import { LanguageContext } from '../../util/ui/language/LanguageProvider'
import { matchesSearch, SearchContext } from '../../util/ui/search/SearchProvider'
import { SortContext, sortCards } from '../../util/ui/sort/SortProvider'
import { StarIcon } from '../../Components/FavoriteButton/FavoriteButton'
import CardList from '../Market/CardList/CardList'
import SetSelector from '../Market/Selector/SetSelector'
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
  const [chosenPokemonSeries, setChosenPokemonSeries] = useState<PokemonTCGSeries | undefined>(undefined)

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

  const selectSet = useCallback(
    (set: PokemonSet) => {
      window.scrollTo(0, 0)
      navigate({ pathname: '/market', search: `?${new URLSearchParams({ set: set.id })}` })
    },
    [navigate]
  )

  useEffect(() => {
    setHeaderItem(<SetSelector selectedSeries={chosenPokemonSeries} onSelectEra={setChosenPokemonSeries} onSelectSet={selectSet} />)
  }, [setHeaderItem, chosenPokemonSeries, selectSet])

  useEffect(() => {
    setBusy(isFetching)
  }, [setBusy, isFetching])

  useEffect(() => () => setBusy(false), [setBusy])

  return (
    <div className={styles.inventoryPage}>
      <div className={styles.backdrop} aria-hidden='true' />
      <div className={styles.pageTitle}>
        <StarIcon />
        <h1 className={styles.pageHeadline}>Favorites</h1>
        {favorites.length > 0 && <span className={styles.pageCount}>{favorites.length}</span>}
      </div>
      {favorites.length == 0 ? (
        <div className={styles.inventory}>
          <div className={styles.headline}>No favorites yet</div>
          <div className={styles.detail}>Open a card and tap the star next to its name to keep it here.</div>
        </div>
      ) : (
        <div className={styles.favorites}>
          <CardList cards={favoriteCards} openCardId={openCardId} onOpenCard={openCard} onStepToCard={stepToCard} onCloseCard={closeCard} />
        </div>
      )}
    </div>
  )
}
