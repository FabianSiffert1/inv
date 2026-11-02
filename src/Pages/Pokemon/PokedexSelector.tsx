import { KeyboardEvent, useContext, useMemo, useState } from 'react'
import { CopyButton } from '../../Components/CopyButton/CopyButton'
import { Pokemon, spriteUrl } from '../../util/api/pokemonTGC/model/Pokemon'
import { pokemonShareLink } from '../../util/shareLinks'
import { LanguageContext, localizedName } from '../../util/ui/language/LanguageProvider'
import { useIsMobile } from '../../util/ui/useIsMobile'
import Dropdown from '../Market/Selector/Dropdown'
import MobileSheet from '../Market/Selector/MobileSheet'
import { OptionGridItem } from '../Market/Selector/OptionGrid'
import selectorStyles from '../Market/Selector/Selector.module.scss'
import { Generation, generationByNumber, generationLabel, generations, isInGeneration } from './generations'
import { matchingPokemon } from './pokemonSearch'
import styles from './PokedexSelector.module.scss'

interface PokedexSelectorProps {
  pokemon?: Pokemon[]
  selectedGeneration?: Generation
  selectedNumber?: number
  onSelectGeneration: (generation: Generation) => void
  onSelectPokemon: (pokedexNumber: number) => void
}

export default function PokedexSelector(props: PokedexSelectorProps) {
  const { germanNames } = useContext(LanguageContext)
  const isMobile = useIsMobile()
  const [isGenerationOpen, setGenerationOpen] = useState(props.selectedGeneration == undefined)
  const [isPokemonOpen, setPokemonOpen] = useState(false)
  const [filter, setFilter] = useState('')

  const generationOptions: OptionGridItem[] = generations.map((generation) => ({
    id: generation.number.toString(),
    label: generationLabel(generation, germanNames)
  }))

  const pokemonOfGeneration = useMemo(
    () =>
      (props.pokemon ?? []).filter(
        (entry) => props.selectedGeneration != undefined && isInGeneration(entry.number, props.selectedGeneration)
      ),
    [props.pokemon, props.selectedGeneration]
  )

  const pokemonOptions: OptionGridItem[] = useMemo(
    () =>
      matchingPokemon(pokemonOfGeneration, filter, germanNames).map((entry) => ({
        id: entry.number.toString(),
        label: localizedName(entry, germanNames),
        imageUrl: spriteUrl(entry.number)
      })),
    [pokemonOfGeneration, filter, germanNames]
  )

  const openGeneration = (open: boolean) => {
    setGenerationOpen(open)
    if (open) {
      setPokemonOpen(false)
    }
  }

  const openPokemon = (open: boolean) => {
    setPokemonOpen(open)
    if (open) {
      setGenerationOpen(false)
    } else {
      setFilter('')
    }
  }

  const selectGeneration = (id: string) => {
    const generation = generationByNumber(Number(id))
    if (generation != undefined) {
      props.onSelectGeneration(generation)
    }
    openGeneration(false)
  }

  const selectPokemon = (id: string) => {
    props.onSelectPokemon(Number(id))
    openPokemon(false)
  }

  const handleFilterKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key == 'Enter' && pokemonOptions.length > 0) {
      selectPokemon(pokemonOptions[0].id)
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
      onKeyDown={handleFilterKeyDown}
      autoFocus
    />
  )

  const selectedPokemonId = props.selectedNumber?.toString()
  const selectedPokemon = pokemonOfGeneration.find((entry) => entry.number == props.selectedNumber)
  const pokemonTriggerOptions =
    selectedPokemon == undefined || pokemonOptions.some((option) => option.id == selectedPokemonId)
      ? pokemonOptions
      : [
          {
            id: selectedPokemon.number.toString(),
            label: localizedName(selectedPokemon, germanNames),
            imageUrl: spriteUrl(selectedPokemon.number)
          },
          ...pokemonOptions
        ]

  return (
    <div className={`${selectorStyles.selector} ${styles.picker}`}>
      <Dropdown
        variant='era'
        ariaLabel='Generation'
        placeholder='Select generation'
        options={generationOptions}
        isOpen={isGenerationOpen && !isMobile}
        setOpen={openGeneration}
        selectedId={props.selectedGeneration?.number.toString()}
        onSelect={selectGeneration}
      />
      {isMobile && isGenerationOpen && (
        <MobileSheet
          title='Generation'
          options={generationOptions}
          selectedId={props.selectedGeneration?.number.toString()}
          onClose={() => openGeneration(false)}
          onSelect={selectGeneration}
        />
      )}
      {props.selectedGeneration != undefined && (
        <Dropdown
          variant='set'
          ariaLabel='Pokémon'
          placeholder='Select Pokémon'
          options={pokemonTriggerOptions}
          disabled={pokemonOfGeneration.length == 0}
          isOpen={isPokemonOpen && !isMobile}
          setOpen={openPokemon}
          selectedId={selectedPokemonId}
          onSelect={selectPokemon}
          panelHeader={filterField}
        />
      )}
      {isMobile && isPokemonOpen && (
        <MobileSheet
          title='Pokémon'
          options={pokemonOptions}
          selectedId={selectedPokemonId}
          onClose={() => openPokemon(false)}
          onSelect={selectPokemon}
          sheetHeader={filterField}
        />
      )}
      {props.selectedNumber != undefined && (
        <CopyButton variant='share' value={pokemonShareLink(props.selectedNumber)} label='Copy link to this Pokémon' />
      )}
    </div>
  )
}
