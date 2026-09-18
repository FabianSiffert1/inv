import { PokemonSet, PokemonSetName, PokemonTCGSeries } from '../../../util/api/pokemonTGC/model/PokemonSet'
import Dropdown from './Dropdown'
import { OptionGridItem } from './OptionGrid'

interface SetStripProps {
  pokemonSets?: PokemonSet[]
  currentlySelectedPokemonSeries?: PokemonTCGSeries
  currentlySelectedPokemonSet?: PokemonSetName
  setCurrentlySelectedPokemonSet: (set: PokemonSetName) => void
  isOpen: boolean
  setOpen: (isOpen: boolean) => void
}

export const setOptionsOfSeries = (pokemonSets?: PokemonSet[], series?: PokemonTCGSeries): OptionGridItem[] =>
  (pokemonSets ?? [])
    .filter((pokemonSet) => pokemonSet.series == (series as unknown as string))
    .sort((a, b) => a.releaseDate.localeCompare(b.releaseDate))
    .map((pokemonSet) => ({
      id: pokemonSet.name,
      label: pokemonSet.name,
      imageUrl: pokemonSet.images.symbol
    }))

export default function SetStrip(props: SetStripProps) {
  const options = setOptionsOfSeries(props.pokemonSets, props.currentlySelectedPokemonSeries)

  return (
    <Dropdown
      variant="set"
      ariaLabel="Set"
      placeholder="Select set"
      options={options}
      disabled={options.length == 0}
      isOpen={props.isOpen}
      setOpen={props.setOpen}
      selectedId={props.currentlySelectedPokemonSet as unknown as string}
      onSelect={(setName) => props.setCurrentlySelectedPokemonSet(setName as unknown as PokemonSetName)}
    />
  )
}
