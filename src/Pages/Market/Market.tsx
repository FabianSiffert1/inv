import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import CardsValue from '../../Components/CardsValue/CardsValue'
import SearchToggle from '../../Header/SearchToggle/SearchToggle'
import { HeaderContext } from '../../Header/HeaderProvider'
import { toCardEntries } from '../../util/api/pokemonTGC/model/PokemonCard'
import { PokemonSet, PokemonTCGSeries } from '../../util/api/pokemonTGC/model/PokemonSet'
import { useAllSets, useCardsOfSet } from '../../util/api/pokemonTGC/hooks'
import { useCardNavigation } from '../../util/ui/cards/useCardNavigation'
import { useVisibleCards } from '../../util/ui/cards/useVisibleCards'
import { useIsMobile } from '../../util/ui/useIsMobile'
import CardList from './CardList/CardList'
import CardListStatus from './CardListStatus'
import PokemonSuggestions from '../Pokemon/PokemonSuggestions'
import styles from './Market.module.scss'
import SetSelector from './Selector/SetSelector'

export default function Market() {
  const { setHeaderItem, setBusy } = useContext(HeaderContext)

  const [searchParams, setSearchParams] = useSearchParams()
  const selectedSetId = searchParams.get('set') ?? undefined
  const baseParams = useMemo(() => (selectedSetId == undefined ? undefined : { set: selectedSetId }), [selectedSetId])
  const { openCardId, openCard, stepToCard, closeCard } = useCardNavigation(baseParams)

  const [chosenPokemonSeries, setChosenPokemonSeries] = useState<PokemonTCGSeries | undefined>(undefined)

  const { data: sets, isFetching: areSetsFetching, error: setsError } = useAllSets()
  const selectedSet = sets?.find((set) => set.id == selectedSetId)
  const currentlySelectedPokemonSet = selectedSet?.name
  const currentlySelectedPokemonSeries = selectedSet?.series ?? chosenPokemonSeries
  const { data: cards, isFetching: areCardsFetching, error: cardsError } = useCardsOfSet(currentlySelectedPokemonSet)
  const visibleCards = useVisibleCards(cards)

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
      <PokemonSuggestions />
      <CardListStatus
        hasSelectedEra={currentlySelectedPokemonSeries != undefined}
        hasSelectedSet={currentlySelectedPokemonSet != undefined}
        isFetching={isFetching}
        error={cardsError ?? setsError}
        cardCount={cards?.length ?? 0}
        hasNoSearchMatches={(cards?.length ?? 0) > 0 && visibleCards?.length == 0}
      />

      {!isFetching && cards != undefined && <CardsValue entries={toCardEntries(cards)} label='Set value' />}

      <div className={styles.cardListWrapper}>
        <CardList
          entries={toCardEntries(visibleCards ?? [])}
          openCardId={openCardId}
          onOpenCard={openCard}
          onStepToCard={stepToCard}
          onCloseCard={closeCard}
        />
      </div>
      {isMobile && selectedSet && <SearchToggle floating />}
    </div>
  )
}
