import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import SearchToggle from '../../Header/SearchToggle/SearchToggle'
import { HeaderContext } from '../../Header/HeaderProvider'
import { PokemonSet, PokemonTCGSeries } from '../../util/api/pokemonTGC/model/PokemonSet'
import { useAllSets, useCardsOfSet } from '../../util/api/pokemonTGC/hooks'
import { PokemonCard } from '../../util/api/pokemonTGC/model/PokemonCard'
import { formatPrice } from '../../util/format/price'
import { LanguageContext } from '../../util/ui/language/LanguageProvider'
import { matchesSearch, SearchContext } from '../../util/ui/search/SearchProvider'
import { SortContext, sortCards } from '../../util/ui/sort/SortProvider'
import { useIsMobile } from '../../util/ui/useIsMobile'
import CardList from './CardList/CardList'
import CardListStatus from './CardListStatus'
import styles from './Market.module.scss'
import SetSelector from './Selector/SetSelector'

export default function Market() {
  const { setHeaderItem, setBusy } = useContext(HeaderContext)

  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const selectedSetId = searchParams.get('set') ?? undefined
  const openCardId = searchParams.get('card') ?? undefined

  const [chosenPokemonSeries, setChosenPokemonSeries] = useState<PokemonTCGSeries | undefined>(undefined)

  const { data: sets, isFetching: areSetsFetching, error: setsError } = useAllSets()
  const selectedSet = sets?.find((set) => set.id == selectedSetId)
  const currentlySelectedPokemonSet = selectedSet?.name
  const currentlySelectedPokemonSeries = selectedSet?.series ?? chosenPokemonSeries
  const { data: cards, isFetching: areCardsFetching, error: cardsError } = useCardsOfSet(currentlySelectedPokemonSet)
  const { sortMode } = useContext(SortContext)
  const { germanNames } = useContext(LanguageContext)
  const { query } = useContext(SearchContext)
  const sortedCards = useMemo(
    () => (cards == undefined ? undefined : sortCards(cards, sortMode, germanNames)),
    [cards, sortMode, germanNames]
  )
  const visibleCards = useMemo(() => sortedCards?.filter((card) => matchesSearch(card, query)), [sortedCards, query])

  const isFetching = areSetsFetching || areCardsFetching
  const isMobile = useIsMobile()

  const selectEra = useCallback(
    (series: PokemonTCGSeries) => {
      setChosenPokemonSeries(series)
      setSearchParams({})
    },
    [setSearchParams]
  )

  const selectSet = useCallback(
    (set: PokemonSet) => {
      window.scrollTo(0, 0)
      setSearchParams({ set: set.id })
    },
    [setSearchParams]
  )

  const openCard = useCallback(
    (cardId: string) => {
      if (selectedSetId != undefined) {
        setSearchParams({ set: selectedSetId, card: cardId }, { state: { openedInApp: true } })
      }
    },
    [selectedSetId, setSearchParams]
  )

  const stepToCard = useCallback(
    (cardId: string) => {
      if (selectedSetId != undefined) {
        setSearchParams({ set: selectedSetId, card: cardId }, { replace: true, state: location.state })
      }
    },
    [selectedSetId, setSearchParams, location.state]
  )

  const closeCard = useCallback(() => {
    if ((location.state as { openedInApp?: boolean } | null)?.openedInApp) {
      navigate(-1)
    } else if (selectedSetId != undefined) {
      setSearchParams({ set: selectedSetId }, { replace: true })
    }
  }, [location.state, navigate, selectedSetId, setSearchParams])

  useEffect(() => {
    setHeaderItem(
      <SetSelector
        selectedSeries={currentlySelectedPokemonSeries}
        selectedSet={selectedSet}
        onSelectEra={selectEra}
        onSelectSet={selectSet}
      />
    )
  }, [setHeaderItem, selectedSet, currentlySelectedPokemonSeries, selectEra, selectSet])

  useEffect(() => {
    setBusy(isFetching)
  }, [setBusy, isFetching])

  useEffect(() => () => setBusy(false), [setBusy])

  return (
    <div className={styles.market}>
      <CardListStatus
        hasSelectedEra={currentlySelectedPokemonSeries != undefined}
        hasSelectedSet={currentlySelectedPokemonSet != undefined}
        isFetching={isFetching}
        error={cardsError ?? setsError}
        cardCount={cards?.length ?? 0}
        hasNoSearchMatches={(cards?.length ?? 0) > 0 && visibleCards?.length == 0}
      />

      {!isFetching && cards != undefined && <SetValue cards={cards} />}

      <div className={styles.cardListWrapper}>
        <CardList cards={visibleCards} openCardId={openCardId} onOpenCard={openCard} onStepToCard={stepToCard} onCloseCard={closeCard} />
      </div>
      {isMobile && selectedSet && <SearchToggle floating />}
    </div>
  )
}

function SetValue({ cards }: { cards: PokemonCard[] }) {
  const trendPrices = cards.map((card) => card.cardmarket?.prices?.trendPrice).filter((price): price is number => price != undefined)
  if (trendPrices.length == 0) {
    return null
  }
  const total = trendPrices.reduce((sum, price) => sum + price, 0)

  return (
    <div className={styles.setValue}>
      <span className={styles.setValueLabel}>Set value</span>
      <span className={styles.setValueAmount}>{formatPrice(total)}</span>
      {trendPrices.length < cards.length && (
        <span className={styles.setValueCoverage}>
          {trendPrices.length} of {cards.length} cards priced
        </span>
      )}
    </div>
  )
}
