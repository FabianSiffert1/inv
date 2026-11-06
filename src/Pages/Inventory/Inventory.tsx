import { useContext, useEffect, useMemo } from 'react'
import { HeaderContext } from '../../Header/HeaderProvider'
import { AuthContext } from '../../util/auth/AuthProvider'
import { useCardsOfSets } from '../../util/api/pokemonTGC/hooks'
import { PokemonCard } from '../../util/api/pokemonTGC/model/PokemonCard'
import { noBaseParams, useCardNavigation } from '../../util/ui/cards/useCardNavigation'
import { useVisibleCards } from '../../util/ui/cards/useVisibleCards'
import { FavoritesContext, FavoritesSource } from '../../util/ui/favorites/FavoritesProvider'
import CardList from '../Market/CardList/CardList'
import PokemonSuggestions from '../Pokemon/PokemonSuggestions'
import styles from './Inventory.module.scss'

export default function Inventory() {
  const { setHeaderItem, setBusy } = useContext(HeaderContext)
  const { favorites, source, isLoading, error } = useContext(FavoritesContext)
  const { status, signIn } = useContext(AuthContext)

  const { openCardId, openCard, stepToCard, closeCard } = useCardNavigation(noBaseParams)

  const setIds = useMemo(() => [...new Set(favorites.map((favorite) => favorite.setId))], [favorites])
  const setQueries = useCardsOfSets(setIds)
  const isFetching = setQueries.some((setQuery) => setQuery.isFetching)
  const loadedCards = setQueries.flatMap((setQuery) => setQuery.data ?? [])

  const favoriteIds = new Set(favorites.map((favorite) => favorite.cardId))
  const favoriteCards = useVisibleCards(loadedCards.filter((card: PokemonCard) => favoriteIds.has(card.id))) ?? []

  useEffect(() => {
    setHeaderItem(<FavoritesStatus count={favorites.length} source={source} isLoading={isLoading} />)
  }, [setHeaderItem, favorites.length, source, isLoading])

  useEffect(() => {
    setBusy(isFetching)
  }, [setBusy, isFetching])

  useEffect(() => () => setBusy(false), [setBusy])

  return (
    <div className={styles.inventoryPage}>
      <div className={styles.backdrop} aria-hidden='true' />
      <PokemonSuggestions />
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

interface FavoritesStatusProps {
  count: number
  source: FavoritesSource
  isLoading: boolean
}

function FavoritesStatus(props: FavoritesStatusProps) {
  const countLabel = props.isLoading ? 'Loading favorites' : `${props.count} ${props.count == 1 ? 'favorite' : 'favorites'}`

  return (
    <div className={styles.headerStatus}>
      <span className={styles.pageCount}>{countLabel}</span>
      <span className={styles.syncTag}>{props.source == 'cloud' ? 'synced' : 'on this device'}</span>
    </div>
  )
}
