import { useCallback, useState } from 'react'
import { CopyButton } from '../../../Components/CopyButton/CopyButton'
import { useAllSets } from '../../../util/api/pokemonTGC/hooks'
import { PokemonSet, PokemonSetName, PokemonTCGSeries } from '../../../util/api/pokemonTGC/model/PokemonSet'
import { useCachedSetNames } from '../../../util/api/pokemonTGC/useCachedSetNames'
import { setShareLink } from '../../../util/shareLinks'
import { useIsMobile } from '../../../util/ui/useIsMobile'
import EraStrip from './EraStrip'
import styles from './Selector.module.scss'
import SetStrip from './SetStrip'

interface SetSelectorProps {
  selectedSeries?: PokemonTCGSeries
  selectedSet?: PokemonSet
  onSelectEra: (series: PokemonTCGSeries) => void
  onSelectSet: (set: PokemonSet) => void
}

export default function SetSelector(props: SetSelectorProps) {
  const { data: sets } = useAllSets()
  const isMobile = useIsMobile()
  const cachedSetNames = useCachedSetNames()
  const [isEraDropdownOpen, setEraDropdownOpen] = useState(false)
  const [isSetDropdownOpen, setSetDropdownOpen] = useState(false)
  const { onSelectEra, onSelectSet } = props

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
      <SetStrip
        pokemonSets={sets}
        currentlySelectedPokemonSeries={props.selectedSeries}
        currentlySelectedPokemonSet={props.selectedSet?.name}
        setCurrentlySelectedPokemonSet={selectSet}
        isOpen={isSetDropdownOpen}
        setOpen={openSetDropdown}
        cachedSetNames={cachedSetNames}
        isMobile={isMobile}
      />
      {props.selectedSet && <CopyButton variant='share' value={setShareLink(props.selectedSet.id)} label='Copy link to this set' />}
    </div>
  )
}
