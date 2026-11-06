import { useContext, useEffect, useMemo } from 'react'
import CardsValue from '../../Components/CardsValue/CardsValue'
import { HeaderContext } from '../../Header/HeaderProvider'
import { AuthContext } from '../../util/auth/AuthProvider'
import { CardEntry } from '../../util/api/pokemonTGC/model/PokemonCard'
import { useCardsOfSets } from '../../util/api/pokemonTGC/hooks'
import { noBaseParams, useCardNavigation } from '../../util/ui/cards/useCardNavigation'
import { useVisibleEntries } from '../../util/ui/cards/useVisibleCards'
import { FavoritesContext, FavoritesSource } from '../../util/ui/favorites/FavoritesProvider'
import CardList from '../Market/CardList/CardList'
import cardListStyles from '../Market/CardList/CardList.module.scss'
import cardStyles from '../Market/CardList/Components/Card/Card.module.scss'
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

  const allFavoriteEntries = useMemo(() => {
    const cardsById = new Map(setQueries.flatMap((setQuery) => setQuery.data ?? []).map((card) => [card.id, card]))
    return favorites.flatMap((favorite): CardEntry[] => {
      const card = cardsById.get(favorite.cardId)
      return card == undefined ? [] : [favorite.print == undefined ? { card } : { card, print: favorite.print }]
    })
  }, [setQueries, favorites])
  const favoriteEntries = useVisibleEntries(allFavoriteEntries) ?? []

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
      {!isLoading && !isFetching && allFavoriteEntries.length > 0 && <CardsValue entries={allFavoriteEntries} label='Favorites value' />}
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
          {isFetching ? (
            <FavoritesSkeleton count={favorites.length} />
          ) : (
            <CardList
              entries={favoriteEntries}
              openCardId={openCardId}
              onOpenCard={openCard}
              onStepToCard={stepToCard}
              onCloseCard={closeCard}
            />
          )}
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

function FavoritesSkeleton({ count }: { count: number }) {
  return (
    <div className={cardListStyles.cardList} aria-busy='true' aria-label='Loading favorites'>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className={`${cardStyles.cardWrapper} ${styles.skeletonTile}`}>
          <div className={styles.skeletonImage} />
          <div className={styles.skeletonName} />
          <div className={styles.skeletonPrice} />
        </div>
      ))}
    </div>
  )
}
