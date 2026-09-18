import { PokemonSet, PokemonTCGSeries } from '../../../util/api/pokemonTGC/model/PokemonSet'
import Dropdown from './Dropdown'
import MobileSheet from './MobileSheet'
import { OptionGridItem } from './OptionGrid'

interface EraStripProps {
  pokemonSets?: PokemonSet[]
  currentlySelectedPokemonSeries?: PokemonTCGSeries
  setCurrentlySelectedPokemonSeries: (series: PokemonTCGSeries) => void
  isOpen: boolean
  setOpen: (isOpen: boolean) => void
  isMobile: boolean
}

export const eraOptions = (pokemonSets?: PokemonSet[]): OptionGridItem[] => {
  const earliestReleaseDateOfSeries = new Map<string, string>()
  pokemonSets?.forEach((pokemonSet) => {
    const currentEarliest = earliestReleaseDateOfSeries.get(pokemonSet.series)
    if (currentEarliest == undefined || pokemonSet.releaseDate < currentEarliest) {
      earliestReleaseDateOfSeries.set(pokemonSet.series, pokemonSet.releaseDate)
    }
  })

  return Array.from(earliestReleaseDateOfSeries.entries())
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map(([series]) => ({ id: series, label: series }))
}

export default function EraStrip(props: EraStripProps) {
  const options = eraOptions(props.pokemonSets)

  return (
    <>
      <Dropdown
        variant='era'
        ariaLabel='Era'
        placeholder='Select era'
        options={options}
        disabled={options.length == 0}
        isOpen={props.isOpen && !props.isMobile}
        setOpen={props.setOpen}
        selectedId={props.currentlySelectedPokemonSeries}
        onSelect={props.setCurrentlySelectedPokemonSeries}
      />
      {props.isMobile && props.isOpen && options.length > 0 && (
        <MobileSheet
          title='Era'
          options={options}
          selectedId={props.currentlySelectedPokemonSeries}
          onClose={() => props.setOpen(false)}
          onSelect={(series) => {
            props.setCurrentlySelectedPokemonSeries(series)
            props.setOpen(false)
          }}
        />
      )}
    </>
  )
}
