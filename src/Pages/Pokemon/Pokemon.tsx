import { useCallback, useContext, useEffect, useMemo } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { HeaderContext } from '../../Header/HeaderProvider'
import SearchToggle from '../../Header/SearchToggle/SearchToggle'
import { useCardsOfPokemon, usePokemonIndex } from '../../util/api/pokemonTGC/hooks'
import { AnimatedSprite } from '../../Components/AnimatedSprite/AnimatedSprite'
import { Pokemon as PokemonEntry, pokemonPath } from '../../util/api/pokemonTGC/model/Pokemon'
import { LanguageContext, localizedName } from '../../util/ui/language/LanguageProvider'
import { matchesSearch, SearchContext } from '../../util/ui/search/SearchProvider'
import { SortContext, sortCards } from '../../util/ui/sort/SortProvider'
import { useIsMobile } from '../../util/ui/useIsMobile'
import CardList from '../Market/CardList/CardList'
import CardListStatus from '../Market/CardListStatus'
import { Generation, generationByNumber, generationLabel, generationOfPokemon, generationPath, isInGeneration } from './generations'
import PokedexSelector from './PokedexSelector'
import styles from './Pokemon.module.scss'
import PokemonGrid from './PokemonGrid'
import { matchingPokemon } from './pokemonSearch'
import PokemonSuggestions from './PokemonSuggestions'

export default function Pokemon() {
  const { setHeaderItem, setBusy } = useContext(HeaderContext)
  const isMobile = useIsMobile()

  const params = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const pokedexNumber = params.pokedexNumber == undefined ? undefined : Number(params.pokedexNumber)
  const hasInvalidNumber = pokedexNumber != undefined && !(Number.isInteger(pokedexNumber) && pokedexNumber > 0)
  const selectedGeneration =
    pokedexNumber != undefined ? generationOfPokemon(pokedexNumber) : generationByNumber(Number(searchParams.get('generation')))

  const { data: pokemonIndex, isFetching: isIndexFetching, error: indexError } = usePokemonIndex()
  const { data: cards, isFetching: areCardsFetching, error: cardsError } = useCardsOfPokemon(hasInvalidNumber ? undefined : pokedexNumber)
  const isFetching = isIndexFetching || areCardsFetching

  const selectGeneration = useCallback(
    (generation: Generation) => {
      window.scrollTo(0, 0)
      navigate(generationPath(generation))
    },
    [navigate]
  )

  const selectPokemon = useCallback(
    (number: number) => {
      window.scrollTo(0, 0)
      navigate(pokemonPath(number))
    },
    [navigate]
  )

  useEffect(() => {
    setHeaderItem(
      <PokedexSelector
        pokemon={pokemonIndex}
        selectedGeneration={selectedGeneration}
        selectedNumber={pokedexNumber}
        onSelectGeneration={selectGeneration}
        onSelectPokemon={selectPokemon}
      />
    )
  }, [setHeaderItem, pokemonIndex, selectedGeneration, pokedexNumber, selectGeneration, selectPokemon])

  useEffect(() => {
    setBusy(isFetching)
  }, [setBusy, isFetching])

  useEffect(() => () => setBusy(false), [setBusy])

  if (hasInvalidNumber) {
    return <Navigate to='/pokemon' replace />
  }

  return (
    <div className={styles.pokemonPage}>
      {pokedexNumber == undefined ? (
        <GenerationOverview generation={selectedGeneration} pokemonIndex={pokemonIndex} isFetching={isIndexFetching} error={indexError} />
      ) : (
        <PokemonCards
          pokemon={pokemonIndex?.find((entry) => entry.number == pokedexNumber)}
          generation={selectedGeneration}
          cards={cards}
          pokedexNumber={pokedexNumber}
          isFetching={isFetching}
          error={cardsError ?? indexError}
        />
      )}
      {isMobile && (pokedexNumber != undefined || selectedGeneration != undefined) && <SearchToggle floating />}
    </div>
  )
}

interface GenerationOverviewProps {
  generation?: Generation
  pokemonIndex?: PokemonEntry[]
  isFetching: boolean
  error: unknown
}

function GenerationOverview(props: GenerationOverviewProps) {
  const { germanNames } = useContext(LanguageContext)
  const { query } = useContext(SearchContext)
  const { generation, pokemonIndex } = props

  const pokemonOfGeneration = useMemo(
    () => (generation == undefined ? [] : (pokemonIndex ?? []).filter((entry) => isInGeneration(entry.number, generation))),
    [pokemonIndex, generation]
  )
  const visiblePokemon = useMemo(() => matchingPokemon(pokemonOfGeneration, query, germanNames), [pokemonOfGeneration, query, germanNames])

  if (generation == undefined) {
    return (
      <>
        <PokemonSuggestions />
        <div className={styles.status}>
          <div className={styles.hint}>
            <div className={styles.headline}>Welcome to the Pokédex</div>
            <div className={styles.detail}>Choose a generation from the menu above, then pick a Pokémon to see all of its cards.</div>
          </div>
        </div>
      </>
    )
  }

  if (props.error != null) {
    return (
      <CardListStatus
        hasSelectedEra
        hasSelectedSet
        isFetching={props.isFetching}
        error={props.error}
        cardCount={0}
        hasNoSearchMatches={false}
      />
    )
  }

  return (
    <>
      <div className={styles.pageTitle}>
        <h1 className={styles.pageHeadline}>{generationLabel(generation, germanNames)}</h1>
        {pokemonOfGeneration.length > 0 && <span className={styles.pageCount}>{pokemonOfGeneration.length} Pokémon</span>}
      </div>
      {pokemonOfGeneration.length > 0 && visiblePokemon.length == 0 && (
        <div className={styles.status}>
          <div className={styles.headline}>No matching Pokémon</div>
          <div className={styles.detail}>Try a different name or Pokédex number.</div>
        </div>
      )}
      <div className={styles.listWrapper}>
        <PokemonGrid pokemon={visiblePokemon} />
      </div>
    </>
  )
}

interface PokemonCardsProps {
  pokemon?: PokemonEntry
  generation?: Generation
  cards?: ReturnType<typeof useCardsOfPokemon>['data']
  pokedexNumber: number
  isFetching: boolean
  error: unknown
}

function PokemonCards(props: PokemonCardsProps) {
  const { sortMode } = useContext(SortContext)
  const { germanNames } = useContext(LanguageContext)
  const { query } = useContext(SearchContext)
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const openCardId = searchParams.get('card') ?? undefined
  const { pokemon, generation, cards } = props

  const sortedCards = useMemo(
    () => (cards == undefined ? undefined : sortCards(cards, sortMode, germanNames)),
    [cards, sortMode, germanNames]
  )
  const visibleCards = useMemo(() => sortedCards?.filter((card) => matchesSearch(card, query)), [sortedCards, query])

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

  return (
    <>
      <PokemonSuggestions excludedNumber={props.pokedexNumber} />
      {pokemon && (
        <div className={styles.pageTitle}>
          <AnimatedSprite className={styles.sprite} pokedexNumber={pokemon.number} />
          <h1 className={styles.pageHeadline}>{localizedName(pokemon, germanNames)}</h1>
          <span className={styles.pokedexNumber}>#{pokemon.number.toString().padStart(4, '0')}</span>
          <span className={styles.pageCount}>{pokemon.cardCount} cards</span>
          {generation && (
            <Link className={styles.generationLink} to={generationPath(generation)} onClick={() => window.scrollTo(0, 0)}>
              <span aria-hidden='true'>←</span> {generationLabel(generation, germanNames)}
            </Link>
          )}
        </div>
      )}
      <CardListStatus
        hasSelectedEra
        hasSelectedSet
        isFetching={props.isFetching}
        error={props.error}
        cardCount={cards?.length ?? 0}
        hasNoSearchMatches={(cards?.length ?? 0) > 0 && visibleCards?.length == 0}
      />
      <div className={styles.listWrapper}>
        <CardList cards={visibleCards} openCardId={openCardId} onOpenCard={openCard} onStepToCard={stepToCard} onCloseCard={closeCard} />
      </div>
    </>
  )
}
