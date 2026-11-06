import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HeaderContext } from '../../Header/HeaderProvider'
import { AuthContext } from '../../util/auth/AuthProvider'
import { useCardsOfSets } from '../../util/api/pokemonTGC/hooks'
import { PokemonCard } from '../../util/api/pokemonTGC/model/PokemonCard'
import { PokemonSet, PokemonTCGSeries } from '../../util/api/pokemonTGC/model/PokemonSet'
import { noBaseParams, useCardNavigation } from '../../util/ui/cards/useCardNavigation'
import { useVisibleCards } from '../../util/ui/cards/useVisibleCards'
import { FavoritesContext } from '../../util/ui/favorites/FavoritesProvider'
import { StarIcon } from '../../Components/FavoriteButton/FavoriteButton'
import CardList from '../Market/CardList/CardList'
import SetSelector from '../Market/Selector/SetSelector'
import PokemonSuggestions from '../Pokemon/PokemonSuggestions'
import styles from './Inventory.module.scss'

export default function Inventory() {
  const { setHeaderItem, setBusy } = useContext(HeaderContext)
  const { favorites, source, isLoading, error } = useContext(FavoritesContext)
  const { status, signIn } = useContext(AuthContext)

  const navigate = useNavigate()
  const { openCardId, openCard, stepToCard, closeCard } = useCardNavigation(noBaseParams)
  const [chosenPokemonSeries, setChosenPokemonSeries] = useState<PokemonTCGSeries | undefined>(undefined)

  const setIds = useMemo(() => [...new Set(favorites.map((favorite) => favorite.setId))], [favorites])
  const setQueries = useCardsOfSets(setIds)
  const isFetching = setQueries.some((setQuery) => setQuery.isFetching)
  const loadedCards = setQueries.flatMap((setQuery) => setQuery.data ?? [])

  const favoriteIds = new Set(favorites.map((favorite) => favorite.cardId))
  const favoriteCards = useVisibleCards(loadedCards.filter((card: PokemonCard) => favoriteIds.has(card.id))) ?? []

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
      <PokemonSuggestions />
      <div className={styles.pageTitle}>
        <StarIcon />
        <h1 className={styles.pageHeadline}>Favorites</h1>
        {favorites.length > 0 && <span className={styles.pageCount}>{favorites.length}</span>}
        {source == 'cloud' && <span className={styles.syncTag}>synced</span>}
      </div>
      {error && (
        <div className={styles.error} role='alert'>
          {error}
        </div>
      )}
      {isLoading ? null : favorites.length == 0 ? (
        <div className={styles.inventory}>
          <div className={styles.headline}>No favorites yet</div>
          <div className={styles.detail}>Open a card and tap the star next to its name to keep it here.</div>
          {status == 'signedOut' && (
            <>
              <div className={styles.detail}>Sign in to keep favorites on every device.</div>
              <button type='button' className={styles.signIn} onClick={() => void signIn()}>
                Sign in with Google
              </button>
            </>
          )}
        </div>
      ) : (
        <div className={styles.favorites}>
          <CardList cards={favoriteCards} openCardId={openCardId} onOpenCard={openCard} onStepToCard={stepToCard} onCloseCard={closeCard} />
        </div>
      )}
    </div>
  )
}
