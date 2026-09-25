import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { HeaderContext } from '../../Header/HeaderProvider'
import { PokemonSetName, PokemonTCGSeries } from '../../util/api/pokemonTGC/model/PokemonSet'
import { useAllSets, useCardsOfSet } from '../../util/api/pokemonTGC/hooks'
import { useCachedSetNames } from '../../util/api/pokemonTGC/useCachedSetNames'
import { useIsMobile } from '../../util/ui/useIsMobile'
import CardList from './CardList/CardList'
import CardListStatus from './CardListStatus'
import styles from './Market.module.scss'
import EraStrip from './Selector/EraStrip'
import selectorStyles from './Selector/Selector.module.scss'
import SetStrip from './Selector/SetStrip'

const maximumManualRetries = 3
const retryCooldownMilliseconds = 5000

export default function Market() {
  const { setHeaderItem, setBusy } = useContext(HeaderContext)

  const [currentlySelectedPokemonSeries, setCurrentlySelectedPokemonSeries] = useState<PokemonTCGSeries | undefined>(undefined)
  const [currentlySelectedPokemonSet, setCurrentlySelectedPokemonSet] = useState<PokemonSetName | undefined>(undefined)
  const [isEraDropdownOpen, setEraDropdownOpen] = useState(false)
  const [isSetDropdownOpen, setSetDropdownOpen] = useState(false)
  const [manualRetryCount, setManualRetryCount] = useState(0)
  const [isRetryCoolingDown, setRetryCoolingDown] = useState(false)
  const cooldownTimeout = useRef<number | undefined>(undefined)

  const { data: sets, isFetching: areSetsFetching, error: setsError, refetch: refetchSets } = useAllSets()
  const { data: cards, isFetching: areCardsFetching, error: cardsError, refetch: refetchCards } = useCardsOfSet(currentlySelectedPokemonSet)

  const isFetching = areSetsFetching || areCardsFetching
  const isMobile = useIsMobile()
  const cachedSetNames = useCachedSetNames()

  const selectEra = useCallback((series: PokemonTCGSeries) => {
    setCurrentlySelectedPokemonSeries(series)
    setCurrentlySelectedPokemonSet(undefined)
    setEraDropdownOpen(false)
    setSetDropdownOpen(true)
    setManualRetryCount(0)
  }, [])

  const selectSet = useCallback((set: PokemonSetName) => {
    window.scrollTo(0, 0)
    setCurrentlySelectedPokemonSet(set)
    setManualRetryCount(0)
  }, [])

  const openEraDropdown = useCallback((isOpen: boolean) => {
    setEraDropdownOpen(isOpen)
    if (isOpen) {
      setSetDropdownOpen(false)
    }
  }, [])

  const openSetDropdown = useCallback((isOpen: boolean) => {
    setSetDropdownOpen(isOpen)
    if (isOpen) {
      setEraDropdownOpen(false)
    }
  }, [])

  useEffect(() => {
    setHeaderItem(
      <div className={selectorStyles.selector}>
        <EraStrip
          pokemonSets={sets}
          currentlySelectedPokemonSeries={currentlySelectedPokemonSeries}
          setCurrentlySelectedPokemonSeries={selectEra}
          isOpen={isEraDropdownOpen}
          setOpen={openEraDropdown}
          isMobile={isMobile}
        />
        <SetStrip
          pokemonSets={sets}
          currentlySelectedPokemonSeries={currentlySelectedPokemonSeries}
          currentlySelectedPokemonSet={currentlySelectedPokemonSet}
          setCurrentlySelectedPokemonSet={selectSet}
          isOpen={isSetDropdownOpen}
          setOpen={openSetDropdown}
          cachedSetNames={cachedSetNames}
          isMobile={isMobile}
        />
      </div>
    )
  }, [
    setHeaderItem,
    sets,
    currentlySelectedPokemonSeries,
    currentlySelectedPokemonSet,
    isEraDropdownOpen,
    isSetDropdownOpen,
    isMobile,
    cachedSetNames,
    selectEra,
    selectSet,
    openEraDropdown,
    openSetDropdown
  ])

  useEffect(() => {
    setBusy(isFetching)
  }, [setBusy, isFetching])

  useEffect(() => () => setBusy(false), [setBusy])

  useEffect(() => () => window.clearTimeout(cooldownTimeout.current), [])

  const retryFetch = () => {
    if (isRetryCoolingDown || manualRetryCount >= maximumManualRetries) {
      return
    }
    setManualRetryCount((previous) => previous + 1)
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
        hasSelectedEra={currentlySelectedPokemonSeries != undefined}
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
