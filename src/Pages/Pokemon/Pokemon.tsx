import { useCallback, useContext, useEffect, useMemo } from 'react'
import { Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { HeaderContext } from '../../Header/HeaderProvider'
import SearchToggle from '../../Header/SearchToggle/SearchToggle'
import { useCardsOfPokemon, usePokemonIndex } from '../../util/api/pokemonTGC/hooks'
import { pokemonPath, spriteUrl } from '../../util/api/pokemonTGC/model/Pokemon'
import { LanguageContext, localizedName } from '../../util/ui/language/LanguageProvider'
import { matchesSearch, SearchContext } from '../../util/ui/search/SearchProvider'
import { SortContext, sortCards } from '../../util/ui/sort/SortProvider'
import { useIsMobile } from '../../util/ui/useIsMobile'
import CardList from '../Market/CardList/CardList'
import CardListStatus from '../Market/CardListStatus'
import styles from './Pokemon.module.scss'
import PokemonPicker from './PokemonPicker'
import PokemonSuggestions from './PokemonSuggestions'

export const defaultPokedexNumber = 25

export default function Pokemon() {
  const { setHeaderItem, setBusy } = useContext(HeaderContext)
  const { sortMode } = useContext(SortContext)
  const { germanNames } = useContext(LanguageContext)
  const { query } = useContext(SearchContext)
  const isMobile = useIsMobile()

  const params = useParams()
  const pokedexNumber = Number(params.pokedexNumber)
  const hasValidNumber = Number.isInteger(pokedexNumber) && pokedexNumber > 0
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const openCardId = searchParams.get('card') ?? undefined

  const { data: pokemonIndex, isFetching: isIndexFetching, error: indexError } = usePokemonIndex()
  const { data: cards, isFetching: areCardsFetching, error: cardsError } = useCardsOfPokemon(hasValidNumber ? pokedexNumber : undefined)
  const pokemon = pokemonIndex?.find((entry) => entry.number == pokedexNumber)
  const isFetching = isIndexFetching || areCardsFetching

  const sortedCards = useMemo(
    () => (cards == undefined ? undefined : sortCards(cards, sortMode, germanNames)),
    [cards, sortMode, germanNames]
  )
  const visibleCards = useMemo(() => sortedCards?.filter((card) => matchesSearch(card, query)), [sortedCards, query])

  const selectPokemon = useCallback(
    (number: number) => {
      window.scrollTo(0, 0)
      navigate(pokemonPath(number))
    },
    [navigate]
  )

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
    setHeaderItem(<PokemonPicker pokemon={pokemonIndex} selectedNumber={pokedexNumber} onSelect={selectPokemon} />)
  }, [setHeaderItem, pokemonIndex, pokedexNumber, selectPokemon])

  useEffect(() => {
    setBusy(isFetching)
  }, [setBusy, isFetching])

  useEffect(() => () => setBusy(false), [setBusy])

  if (!hasValidNumber) {
    return <Navigate to={pokemonPath(defaultPokedexNumber)} replace />
  }

  return (
    <div className={styles.pokemonPage}>
      <PokemonSuggestions excludedNumber={pokedexNumber} />
      {pokemon && (
        <div className={styles.pageTitle}>
          <img className={styles.sprite} src={spriteUrl(pokemon.number)} alt='' onError={(event) => (event.currentTarget.hidden = true)} />
          <h1 className={styles.pageHeadline}>{localizedName(pokemon, germanNames)}</h1>
          <span className={styles.pokedexNumber}>#{pokemon.number.toString().padStart(4, '0')}</span>
          <span className={styles.pageCount}>{pokemon.cardCount} cards</span>
        </div>
      )}
      <CardListStatus
        hasSelectedEra
        hasSelectedSet
        isFetching={isFetching}
        error={cardsError ?? indexError}
        cardCount={cards?.length ?? 0}
        hasNoSearchMatches={(cards?.length ?? 0) > 0 && visibleCards?.length == 0}
      />
      <div className={styles.cardListWrapper}>
        <CardList cards={visibleCards} openCardId={openCardId} onOpenCard={openCard} onStepToCard={stepToCard} onCloseCard={closeCard} />
      </div>
      {isMobile && <SearchToggle floating />}
    </div>
  )
}
