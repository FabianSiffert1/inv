import { PokemonSet, PokemonSetName, PokemonTCGSeries } from '../../../util/api/pokemonTGC/model/PokemonSet'
import Dropdown from './Dropdown'
import MobileSheet from './MobileSheet'
import { OptionGridItem } from './OptionGrid'

interface SetStripProps {
  pokemonSets?: PokemonSet[]
  currentlySelectedPokemonSeries?: PokemonTCGSeries
  currentlySelectedPokemonSet?: PokemonSetName
  setCurrentlySelectedPokemonSet: (set: PokemonSetName) => void
  isOpen: boolean
  setOpen: (isOpen: boolean) => void
  cachedSetNames: string[]
  isMobile: boolean
}

export const setOptionsOfSeries = (pokemonSets?: PokemonSet[], series?: PokemonTCGSeries): OptionGridItem[] =>
  (pokemonSets ?? [])
    .filter((pokemonSet) => pokemonSet.series == series)
    .sort((a, b) => a.releaseDate.localeCompare(b.releaseDate))
    .map((pokemonSet) => ({
      id: pokemonSet.name,
      label: pokemonSet.name,
      imageUrl: pokemonSet.images.symbol
    }))

export default function SetStrip(props: SetStripProps) {
  const options = setOptionsOfSeries(props.pokemonSets, props.currentlySelectedPokemonSeries)

  return (
    <>
      <Dropdown
        variant='set'
        ariaLabel='Set'
        placeholder='Select set'
        options={options}
        cachedIds={props.cachedSetNames}
        disabled={options.length == 0}
        isOpen={props.isOpen && !props.isMobile}
        setOpen={props.setOpen}
        selectedId={props.currentlySelectedPokemonSet}
        onSelect={props.setCurrentlySelectedPokemonSet}
      />
      {props.isMobile && props.isOpen && options.length > 0 && (
        <MobileSheet
          title='Set'
          options={options}
          cachedIds={props.cachedSetNames}
          selectedId={props.currentlySelectedPokemonSet}
          onClose={() => props.setOpen(false)}
          onSelect={(setName) => {
            props.setCurrentlySelectedPokemonSet(setName)
            props.setOpen(false)
          }}
        />
      )}
    </>
  )
}
