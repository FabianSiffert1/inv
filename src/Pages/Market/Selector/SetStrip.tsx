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
    .filter((pokemonSet) => pokemonSet.series == (series as unknown as string))
    .sort((a, b) => a.releaseDate.localeCompare(b.releaseDate))
    .map((pokemonSet) => ({
      id: pokemonSet.name,
      label: pokemonSet.name,
      imageUrl: pokemonSet.images.symbol
    }))

export default function SetStrip(props: SetStripProps) {
  const options = setOptionsOfSeries(props.pokemonSets, props.currentlySelectedPokemonSeries)

  const selectedId = props.currentlySelectedPokemonSet as unknown as string
  const onSelect = (setName: string) => props.setCurrentlySelectedPokemonSet(setName as unknown as PokemonSetName)

  return (
    <>
      <Dropdown
        variant="set"
        ariaLabel="Set"
        placeholder="Select set"
        options={options}
        cachedIds={props.cachedSetNames}
        disabled={options.length == 0}
        isOpen={props.isOpen && !props.isMobile}
        setOpen={props.setOpen}
        selectedId={selectedId}
        onSelect={onSelect}
      />
      {props.isMobile && props.isOpen && options.length > 0 && (
        <MobileSheet
          title="Set"
          options={options}
          cachedIds={props.cachedSetNames}
          selectedId={selectedId}
          onClose={() => props.setOpen(false)}
          onSelect={(setName) => {
            onSelect(setName)
            props.setOpen(false)
          }}
        />
      )}
    </>
  )
}
