import { KeyboardEvent, useContext, useMemo, useState } from 'react'
import { PokemonSet, PokemonSetName, PokemonTCGSeries } from '../../../util/api/pokemonTGC/model/PokemonSet'
import { LanguageContext, localizedName, useStrings } from '../../../util/ui/language/LanguageProvider'
import { formatSetReleaseDate } from '../../../util/format/date'
import { Strings } from '../../../util/ui/language/strings'
import Dropdown from './Dropdown'
import MobileSheet from './MobileSheet'
import { nameTint } from './nameTint'
import { OptionGridItem } from './OptionGrid'
import styles from './Selector.module.scss'
import { matchingSets } from './setSearch'

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

const setOption = (pokemonSet: PokemonSet, germanNames: boolean, t: Strings): OptionGridItem => ({
  id: pokemonSet.name,
  label: localizedName(pokemonSet, germanNames),
  detail: [pokemonSet.ptcgoCode, formatSetReleaseDate(pokemonSet.releaseDate, t)].filter((part) => part != undefined).join(' · '),
  tint: nameTint(pokemonSet.name)
})

export const setOptionsOfSeries = (
  pokemonSets: PokemonSet[] | undefined,
  series: PokemonTCGSeries | undefined,
  germanNames: boolean,
  t: Strings
): OptionGridItem[] =>
  (pokemonSets ?? [])
    .filter((pokemonSet) => series == undefined || pokemonSet.series == series)
    .sort((a, b) => b.releaseDate.localeCompare(a.releaseDate))
    .map((pokemonSet) => setOption(pokemonSet, germanNames, t))

export default function SetStrip(props: SetStripProps) {
  const { germanNames } = useContext(LanguageContext)
  const t = useStrings()
  const [filter, setFilter] = useState('')
  const isFiltering = filter.trim() != ''
  const options = useMemo(
    () =>
      isFiltering
        ? matchingSets(props.pokemonSets ?? [], filter).map((pokemonSet) => setOption(pokemonSet, germanNames, t))
        : setOptionsOfSeries(props.pokemonSets, props.currentlySelectedPokemonSeries, germanNames, t),
    [isFiltering, props.pokemonSets, filter, props.currentlySelectedPokemonSeries, germanNames, t]
  )
  const selectedSet = props.pokemonSets?.find((pokemonSet) => pokemonSet.name == props.currentlySelectedPokemonSet)
  const triggerOptions =
    selectedSet == undefined || options.some((option) => option.id == selectedSet.name)
      ? options
      : [setOption(selectedSet, germanNames, t), ...options]
  const hasSets = (props.pokemonSets?.length ?? 0) > 0

  const setOpen = (isOpen: boolean) => {
    props.setOpen(isOpen)
    if (!isOpen) {
      setFilter('')
    }
  }

  const select = (setName: PokemonSetName) => {
    props.setCurrentlySelectedPokemonSet(setName)
    setOpen(false)
  }

  const handleFilterKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key == 'Enter' && options.length > 0) {
      select(options[0].id)
    }
  }

  const filterField = (
    <input
      className={props.isMobile ? `${styles.filter} ${styles.sheetFilter}` : styles.filter}
      type='search'
      placeholder={t.nameOrCode}
      aria-label={t.filterSets}
      value={filter}
      onChange={(event) => setFilter(event.target.value)}
      onKeyDown={handleFilterKeyDown}
      autoFocus
    />
  )

  return (
    <>
      <Dropdown
        variant='set'
        ariaLabel={t.set}
        placeholder={t.selectSet}
        options={triggerOptions}
        cachedIds={props.cachedSetNames}
        disabled={!hasSets}
        isOpen={props.isOpen && !props.isMobile}
        setOpen={setOpen}
        selectedId={props.currentlySelectedPokemonSet}
        onSelect={select}
        panelHeader={filterField}
      />
      {props.isMobile && props.isOpen && hasSets && (
        <MobileSheet
          title={t.set}
          options={options}
          cachedIds={props.cachedSetNames}
          selectedId={props.currentlySelectedPokemonSet}
          onClose={() => setOpen(false)}
          onSelect={select}
          sheetHeader={filterField}
        />
      )}
    </>
  )
}
