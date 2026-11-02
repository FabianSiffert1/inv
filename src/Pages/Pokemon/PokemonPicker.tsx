import { KeyboardEvent, useContext, useMemo, useState } from 'react'
import { Pokemon, spriteUrl } from '../../util/api/pokemonTGC/model/Pokemon'
import { LanguageContext, localizedName } from '../../util/ui/language/LanguageProvider'
import { useIsMobile } from '../../util/ui/useIsMobile'
import Dropdown from '../Market/Selector/Dropdown'
import MobileSheet from '../Market/Selector/MobileSheet'
import { OptionGridItem } from '../Market/Selector/OptionGrid'
import { matchingPokemon } from './pokemonSearch'
import styles from './PokemonPicker.module.scss'

interface PokemonPickerProps {
  pokemon?: Pokemon[]
  selectedNumber?: number
  onSelect: (pokedexNumber: number) => void
}

export default function PokemonPicker(props: PokemonPickerProps) {
  const { germanNames } = useContext(LanguageContext)
  const isMobile = useIsMobile()
  const [isOpen, setOpen] = useState(false)
  const [filter, setFilter] = useState('')

  const options: OptionGridItem[] = useMemo(
    () =>
      matchingPokemon(props.pokemon ?? [], filter, germanNames).map((entry) => ({
        id: entry.number.toString(),
        label: localizedName(entry, germanNames),
        imageUrl: spriteUrl(entry.number)
      })),
    [props.pokemon, filter, germanNames]
  )

  const changeOpen = (open: boolean) => {
    setOpen(open)
    if (!open) {
      setFilter('')
    }
  }

  const select = (id: string) => {
    props.onSelect(Number(id))
    changeOpen(false)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key == 'Enter' && options.length > 0) {
      select(options[0].id)
    }
  }

  const filterField = (
    <input
      className={isMobile ? `${styles.filter} ${styles.sheetFilter}` : styles.filter}
      type='search'
      placeholder='Name or #'
      aria-label='Filter Pokémon'
      value={filter}
      onChange={(event) => setFilter(event.target.value)}
      onKeyDown={handleKeyDown}
      autoFocus
    />
  )

  const selectedId = props.selectedNumber?.toString()
  const selected = props.pokemon?.find((entry) => entry.number == props.selectedNumber)
  const triggerOptions =
    selected == undefined || options.some((option) => option.id == selectedId)
      ? options
      : [{ id: selected.number.toString(), label: localizedName(selected, germanNames), imageUrl: spriteUrl(selected.number) }, ...options]

  return (
    <div className={styles.picker}>
      <Dropdown
        variant='set'
        ariaLabel='Pokémon'
        placeholder='Select Pokémon'
        options={triggerOptions}
        disabled={props.pokemon == undefined}
        isOpen={isOpen && !isMobile}
        setOpen={changeOpen}
        selectedId={selectedId}
        onSelect={select}
        panelHeader={filterField}
      />
      {isMobile && isOpen && (
        <MobileSheet
          title='Pokémon'
          options={options}
          selectedId={selectedId}
          onClose={() => changeOpen(false)}
          onSelect={select}
          sheetHeader={filterField}
        />
      )}
    </div>
  )
}
