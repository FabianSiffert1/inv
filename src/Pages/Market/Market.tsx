import { useCallback, useContext, useEffect, useState } from 'react'
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

export default function Market() {
  const { setHeaderItem, setBusy } = useContext(HeaderContext)

  const [currentlySelectedPokemonSeries, setCurrentlySelectedPokemonSeries] = useState<PokemonTCGSeries | undefined>(undefined)
  const [currentlySelectedPokemonSet, setCurrentlySelectedPokemonSet] = useState<PokemonSetName | undefined>(undefined)
  const [isEraDropdownOpen, setEraDropdownOpen] = useState(false)
  const [isSetDropdownOpen, setSetDropdownOpen] = useState(false)

  const { data: sets, isFetching: areSetsFetching, error: setsError } = useAllSets()
  const { data: cards, isFetching: areCardsFetching, error: cardsError } = useCardsOfSet(currentlySelectedPokemonSet)

  const isFetching = areSetsFetching || areCardsFetching
  const isMobile = useIsMobile()
  const cachedSetNames = useCachedSetNames()

  const selectEra = useCallback((series: PokemonTCGSeries) => {
    setCurrentlySelectedPokemonSeries(series)
    setCurrentlySelectedPokemonSet(undefined)
    setEraDropdownOpen(false)
    setSetDropdownOpen(true)
  }, [])

  const selectSet = useCallback((set: PokemonSetName) => {
    window.scrollTo(0, 0)
    setCurrentlySelectedPokemonSet(set)
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

  return (
    <div className={styles.market}>
      <CardListStatus
        hasSelectedEra={currentlySelectedPokemonSeries != undefined}
        hasSelectedSet={currentlySelectedPokemonSet != undefined}
        isFetching={isFetching}
        error={cardsError ?? setsError}
        cardCount={cards?.length ?? 0}
      />

      <div className={styles.cardListWrapper}>
        <CardList cards={cards} />
      </div>
    </div>
  )
}
