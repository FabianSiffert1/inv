import { useCallback, useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { CopyButton } from '../../Components/CopyButton/CopyButton'
import { HeaderContext } from '../../Header/HeaderProvider'
import { PokemonSetName, PokemonTCGSeries } from '../../util/api/pokemonTGC/model/PokemonSet'
import { useAllSets, useCardsOfSet } from '../../util/api/pokemonTGC/hooks'
import { useCachedSetNames } from '../../util/api/pokemonTGC/useCachedSetNames'
import { setShareLink } from '../../util/shareLinks'
import { useIsMobile } from '../../util/ui/useIsMobile'
import CardList from './CardList/CardList'
import CardListStatus from './CardListStatus'
import styles from './Market.module.scss'
import EraStrip from './Selector/EraStrip'
import selectorStyles from './Selector/Selector.module.scss'
import SetStrip from './Selector/SetStrip'

export default function Market() {
  const { setHeaderItem, setBusy } = useContext(HeaderContext)

  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const selectedSetId = searchParams.get('set') ?? undefined
  const openCardId = searchParams.get('card') ?? undefined

  const [chosenPokemonSeries, setChosenPokemonSeries] = useState<PokemonTCGSeries | undefined>(undefined)
  const [isEraDropdownOpen, setEraDropdownOpen] = useState(false)
  const [isSetDropdownOpen, setSetDropdownOpen] = useState(false)

  const { data: sets, isFetching: areSetsFetching, error: setsError } = useAllSets()
  const selectedSet = sets?.find((set) => set.id == selectedSetId)
  const currentlySelectedPokemonSet = selectedSet?.name
  const currentlySelectedPokemonSeries = selectedSet?.series ?? chosenPokemonSeries
  const { data: cards, isFetching: areCardsFetching, error: cardsError } = useCardsOfSet(currentlySelectedPokemonSet)

  const isFetching = areSetsFetching || areCardsFetching
  const isMobile = useIsMobile()
  const cachedSetNames = useCachedSetNames()

  const selectEra = useCallback(
    (series: PokemonTCGSeries) => {
      setChosenPokemonSeries(series)
      setSearchParams({})
      setEraDropdownOpen(false)
      setSetDropdownOpen(true)
    },
    [setSearchParams]
  )

  const selectSet = useCallback(
    (setName: PokemonSetName) => {
      const set = sets?.find((candidate) => candidate.name == setName)
      if (set == undefined) {
        return
      }
      window.scrollTo(0, 0)
      setSearchParams({ set: set.id })
    },
    [sets, setSearchParams]
  )

  const openCard = useCallback(
    (cardId: string) => {
      if (selectedSetId != undefined) {
        setSearchParams({ set: selectedSetId, card: cardId }, { state: { openedInApp: true } })
      }
    },
    [selectedSetId, setSearchParams]
  )

  const closeCard = useCallback(() => {
    if ((location.state as { openedInApp?: boolean } | null)?.openedInApp) {
      navigate(-1)
    } else if (selectedSetId != undefined) {
      setSearchParams({ set: selectedSetId }, { replace: true })
    }
  }, [location.state, navigate, selectedSetId, setSearchParams])

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
        {selectedSet && <CopyButton variant='share' value={setShareLink(selectedSet.id)} label='Copy link to this set' />}
      </div>
    )
  }, [
    setHeaderItem,
    sets,
    selectedSet,
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
        <CardList cards={cards} openCardId={openCardId} onOpenCard={openCard} onCloseCard={closeCard} />
      </div>
    </div>
  )
}
