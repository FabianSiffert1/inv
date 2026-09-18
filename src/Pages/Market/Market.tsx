import React, { useContext, useEffect, useRef, useState } from 'react'
import { LoadingSpinner } from '../../Components/LoadingSpinner/LoadingSpinner'
import { HeaderContext } from '../../Header/HeaderProvider'
import { PokemonSetName, PokemonTCGSeries } from '../../util/api/pokemonTGC/model/PokemonSet'
import { useAllSets, useCardsOfSet } from '../../util/api/pokemonTGC/hooks'
import CardList from './CardList/CardList'
import CardListStatus from './CardListStatus'
import styles from './Market.module.scss'
import EraStrip from './Selector/EraStrip'
import selectorStyles from './Selector/Selector.module.scss'
import SetStrip from './Selector/SetStrip'

const maximumManualRetries = 3
const retryCooldownMilliseconds = 5000

export default function Market() {
  const headerContext = useContext(HeaderContext)

  const [currentlySelectedPokemonSeries, setCurrentlySelectedPokemonSeries] = useState<PokemonTCGSeries | undefined>(undefined)
  const [currentlySelectedPokemonSet, setCurrentlySelectedPokemonSet] = useState<PokemonSetName | undefined>(undefined)
  const [isEraDropdownOpen, setEraDropdownOpen] = useState(true)
  const [isSetDropdownOpen, setSetDropdownOpen] = useState(false)
  const [manualRetryCount, setManualRetryCount] = useState(0)
  const [isRetryCoolingDown, setRetryCoolingDown] = useState(false)
  const cooldownTimeout = useRef<number | undefined>(undefined)

  const { data: sets, isFetching: areSetsFetching, error: setsError, refetch: refetchSets } = useAllSets()
  const {
    data: cards,
    isFetching: areCardsFetching,
    error: cardsError,
    refetch: refetchCards
  } = useCardsOfSet(currentlySelectedPokemonSet)

  const isFetching = areSetsFetching || areCardsFetching

  useEffect(() => {
    headerContext.setHeaderItem(
    <div className={selectorStyles.selector}>
      <EraStrip
        pokemonSets={sets}
        currentlySelectedPokemonSeries={currentlySelectedPokemonSeries}
        setCurrentlySelectedPokemonSeries={selectEra}
        isOpen={isEraDropdownOpen}
        setOpen={(isOpen) => {
          setEraDropdownOpen(isOpen)
          if (isOpen) {
            setSetDropdownOpen(false)
          }
        }}
      />
      <SetStrip
        pokemonSets={sets}
        currentlySelectedPokemonSeries={currentlySelectedPokemonSeries}
        currentlySelectedPokemonSet={currentlySelectedPokemonSet}
        setCurrentlySelectedPokemonSet={selectSet}
        isOpen={isSetDropdownOpen}
        setOpen={(isOpen) => {
          setSetDropdownOpen(isOpen)
          if (isOpen) {
            setEraDropdownOpen(false)
          }
        }}
      />
      {isFetching && (
        <div className={selectorStyles.selectorSpinner}>
          <LoadingSpinner small />
        </div>
      )}
    </div>
    )
  }, [sets, currentlySelectedPokemonSeries, currentlySelectedPokemonSet, isEraDropdownOpen, isSetDropdownOpen, isFetching])

  useEffect(() => () => window.clearTimeout(cooldownTimeout.current), [])

  const selectEra = (series: PokemonTCGSeries) => {
    setCurrentlySelectedPokemonSeries(series)
    setCurrentlySelectedPokemonSet(undefined)
    setEraDropdownOpen(false)
    setSetDropdownOpen(true)
    setManualRetryCount(0)
  }

  const selectSet = (set: PokemonSetName) => {
    scroll(0, 0)
    setCurrentlySelectedPokemonSet(set)
    setManualRetryCount(0)
  }

  const retryFetch = () => {
    if (isRetryCoolingDown || manualRetryCount >= maximumManualRetries) {
      return
    }
    setManualRetryCount(manualRetryCount + 1)
    setRetryCoolingDown(true)
    cooldownTimeout.current = window.setTimeout(() => setRetryCoolingDown(false), retryCooldownMilliseconds)
    if (setsError != null) {
      refetchSets()
    }
    if (currentlySelectedPokemonSet != undefined) {
      refetchCards()
    }
  }

  return (
    <div className={styles.market}>
      <CardListStatus
        hasSelectedSet={currentlySelectedPokemonSet != undefined}
        isFetching={isFetching}
        error={cardsError ?? setsError}
        cardCount={cards?.length ?? 0}
        onRetry={retryFetch}
        retriesLeft={maximumManualRetries - manualRetryCount}
        isRetryCoolingDown={isRetryCoolingDown}
      />

      <div className={styles.cardListWrapper}>
        <CardList cards={cards} />
      </div>
    </div>
  )
}
