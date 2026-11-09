import { useContext, useEffect, useMemo } from 'react'
import CardsValue from '../../Components/CardsValue/CardsValue'
import { HeaderContext } from '../../Header/HeaderProvider'
import SearchToggle from '../../Header/SearchToggle/SearchToggle'
import { AuthContext } from '../../util/auth/AuthProvider'
import { CardEntry } from '../../util/api/pokemonTGC/model/PokemonCard'
import { useCardsOfSets } from '../../util/api/pokemonTGC/hooks'
import { noBaseParams, useCardNavigation } from '../../util/ui/cards/useCardNavigation'
import { useVisibleEntries } from '../../util/ui/cards/useVisibleCards'
import { FavoritesContext, FavoritesSource } from '../../util/ui/favorites/FavoritesProvider'
import { useStrings } from '../../util/ui/language/LanguageProvider'
import { useIsMobile } from '../../util/ui/useIsMobile'
import CardList from '../Market/CardList/CardList'
import cardListStyles from '../Market/CardList/CardList.module.scss'
import cardStyles from '../Market/CardList/Components/Card/Card.module.scss'
import PokemonSuggestions from '../Pokemon/PokemonSuggestions'
import styles from './Inventory.module.scss'

export default function Inventory() {
  const { setHeaderItem, setBusy } = useContext(HeaderContext)
  const { favorites, source, isLoading, error } = useContext(FavoritesContext)
  const { status, signIn } = useContext(AuthContext)
  const isMobile = useIsMobile()
  const t = useStrings()

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
      {!isLoading && !isFetching && allFavoriteEntries.length > 0 && <CardsValue entries={allFavoriteEntries} label={t.favoritesValue} />}
      {error && (
        <div className={styles.error} role='alert'>
          {t.favoritesErrors[error]}
        </div>
      )}
      {isLoading ? null : favorites.length == 0 ? (
        <div className={styles.inventory}>
          <div className={styles.headline}>{t.noFavorites}</div>
          <div className={styles.detail}>{t.noFavoritesHint}</div>
          {status == 'signedOut' && (
            <>
              <div className={styles.detail}>{t.signInHint}</div>
              <button type='button' className={styles.signIn} onClick={() => void signIn()}>
                {t.signInWithGoogle}
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
      {isMobile && <SearchToggle floating />}
    </div>
  )
}

interface FavoritesStatusProps {
  count: number
  source: FavoritesSource
  isLoading: boolean
}

function FavoritesStatus(props: FavoritesStatusProps) {
  const t = useStrings()
  const countLabel = props.isLoading ? t.loadingFavorites : `${props.count} ${t.favoriteNoun(props.count)}`

  return (
    <div className={styles.headerStatus}>
      <span className={styles.pageCount}>{countLabel}</span>
      <span className={styles.syncTag}>{props.source == 'cloud' ? t.synced : t.onThisDevice}</span>
    </div>
  )
}

function FavoritesSkeleton({ count }: { count: number }) {
  const t = useStrings()

  return (
    <div className={cardListStyles.cardList} aria-busy='true' aria-label={t.loadingFavorites}>
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
