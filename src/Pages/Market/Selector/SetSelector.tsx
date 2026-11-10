import { useCallback, useMemo, useState } from 'react'
import { CopyButton } from '../../../Components/CopyButton/CopyButton'
import { useAllSets } from '../../../util/api/pokemonTGC/hooks'
import { isSideSet } from '../../../util/api/pokemonTGC/setGroups'
import { PokemonSet, PokemonSetName, PokemonTCGSeries } from '../../../util/api/pokemonTGC/model/PokemonSet'
import { useCachedSetNames } from '../../../util/api/pokemonTGC/useCachedSetNames'
import { setShareLink } from '../../../util/shareLinks'
import { useStrings } from '../../../util/ui/language/LanguageProvider'
import { useIsMobile } from '../../../util/ui/useIsMobile'
import EraStrip from './EraStrip'
import styles from './Selector.module.scss'
import SetStrip from './SetStrip'
import { NextIcon, PreviousIcon } from './StepIcons'

interface SetSelectorProps {
  selectedSeries?: PokemonTCGSeries
  selectedSet?: PokemonSet
  onSelectEra: (series: PokemonTCGSeries) => void
  onSelectSet: (set: PokemonSet) => void
}

export default function SetSelector(props: SetSelectorProps) {
  const { data: sets } = useAllSets()
  const mainSets = useMemo(() => sets?.filter((set) => !isSideSet(set.id)), [sets])
  const isMobile = useIsMobile()
  const cachedSetNames = useCachedSetNames()
  const t = useStrings()
  const [isEraDropdownOpen, setEraDropdownOpen] = useState(false)
  const [isSetDropdownOpen, setSetDropdownOpen] = useState(false)
  const { onSelectEra, onSelectSet } = props

  const setsOfEra = useMemo(
    () =>
      (mainSets ?? []).filter((set) => set.series == props.selectedSet?.series).sort((a, b) => a.releaseDate.localeCompare(b.releaseDate)),
    [mainSets, props.selectedSet?.series]
  )
  const selectedIndex = setsOfEra.findIndex((set) => set.id == props.selectedSet?.id)
  const previousSet = selectedIndex > 0 ? setsOfEra[selectedIndex - 1] : undefined
  const nextSet = selectedIndex >= 0 ? setsOfEra[selectedIndex + 1] : undefined
  const showsStepButtons = selectedIndex >= 0

  const selectEra = useCallback(
    (series: PokemonTCGSeries) => {
      onSelectEra(series)
      setEraDropdownOpen(false)
      setSetDropdownOpen(true)
    },
    [onSelectEra]
  )

  const selectSet = useCallback(
    (setName: PokemonSetName) => {
      const set = sets?.find((candidate) => candidate.name == setName)
      if (set != undefined) {
        onSelectSet(set)
      }
    },
    [sets, onSelectSet]
  )

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

  return (
    <div className={styles.selector}>
      <EraStrip
        pokemonSets={sets}
        currentlySelectedPokemonSeries={props.selectedSeries}
        setCurrentlySelectedPokemonSeries={selectEra}
        isOpen={isEraDropdownOpen}
        setOpen={openEraDropdown}
        isMobile={isMobile}
      />
      {showsStepButtons && (
        <button
          type='button'
          className={styles.stepButton}
          aria-label={t.previousSet}
          title={t.previousSet}
          disabled={previousSet == undefined}
          onClick={() => previousSet && onSelectSet(previousSet)}
        >
          <PreviousIcon />
        </button>
      )}
      <SetStrip
        pokemonSets={mainSets}
        currentlySelectedPokemonSeries={props.selectedSeries}
        currentlySelectedPokemonSet={props.selectedSet?.name}
        setCurrentlySelectedPokemonSet={selectSet}
        isOpen={isSetDropdownOpen}
        setOpen={openSetDropdown}
        cachedSetNames={cachedSetNames}
        isMobile={isMobile}
      />
      {showsStepButtons && (
        <button
          type='button'
          className={styles.stepButton}
          aria-label={t.nextSet}
          title={t.nextSet}
          disabled={nextSet == undefined}
          onClick={() => nextSet && onSelectSet(nextSet)}
        >
          <NextIcon />
        </button>
      )}
      {props.selectedSet && <CopyButton variant='share' value={setShareLink(props.selectedSet.id)} label={t.copyLinkToSet} />}
    </div>
  )
}
