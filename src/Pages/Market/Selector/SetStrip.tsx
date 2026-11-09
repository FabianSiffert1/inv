import { useContext } from 'react'
import { PokemonSet, PokemonSetName, PokemonTCGSeries } from '../../../util/api/pokemonTGC/model/PokemonSet'
import { LanguageContext, localizedName, useStrings } from '../../../util/ui/language/LanguageProvider'
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

export const setOptionsOfSeries = (pokemonSets?: PokemonSet[], series?: PokemonTCGSeries, germanNames = false): OptionGridItem[] =>
  (pokemonSets ?? [])
    .filter((pokemonSet) => pokemonSet.series == series)
    .sort((a, b) => b.releaseDate.localeCompare(a.releaseDate))
    .map((pokemonSet) => ({
      id: pokemonSet.name,
      label: localizedName(pokemonSet, germanNames)
    }))

export default function SetStrip(props: SetStripProps) {
  const { germanNames } = useContext(LanguageContext)
  const t = useStrings()
  const options = setOptionsOfSeries(props.pokemonSets, props.currentlySelectedPokemonSeries, germanNames)

  return (
    <>
      <Dropdown
        variant='set'
        ariaLabel={t.set}
        placeholder={t.selectSet}
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
          title={t.set}
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
