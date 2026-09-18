import { PokemonSet, PokemonTCGSeries } from '../../../util/api/pokemonTGC/model/PokemonSet'
import Dropdown from './Dropdown'
import { OptionGridItem } from './OptionGrid'

interface EraStripProps {
  pokemonSets?: PokemonSet[]
  currentlySelectedPokemonSeries?: PokemonTCGSeries
  setCurrentlySelectedPokemonSeries: (series: PokemonTCGSeries) => void
  isOpen: boolean
  setOpen: (isOpen: boolean) => void
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
    <Dropdown
      variant="era"
      ariaLabel="Era"
      placeholder="Select era"
      options={options}
      disabled={options.length == 0}
      isOpen={props.isOpen}
      setOpen={props.setOpen}
      selectedId={props.currentlySelectedPokemonSeries as unknown as string}
      onSelect={(series) => props.setCurrentlySelectedPokemonSeries(series as unknown as PokemonTCGSeries)}
    />
  )
}
