import { KeyboardEvent, useMemo, useState } from 'react'
import { CopyButton } from '../../Components/CopyButton/CopyButton'
import { Artist } from '../../util/api/pokemonTGC/model/Artist'
import { spriteUrl } from '../../util/api/pokemonTGC/model/Pokemon'
import { artistShareLink } from '../../util/shareLinks'
import { useIsMobile } from '../../util/ui/useIsMobile'
import Dropdown from '../Market/Selector/Dropdown'
import MobileSheet from '../Market/Selector/MobileSheet'
import { OptionGridItem } from '../Market/Selector/OptionGrid'
import selectorStyles from '../Market/Selector/Selector.module.scss'
import pickerStyles from '../Pokemon/PokedexSelector.module.scss'
import { matchingArtists } from './artistSearch'

interface ArtistSelectorProps {
  artists?: Artist[]
  selectedSlug?: string
  onSelectArtist: (slug: string) => void
}

const toOption = (artist: Artist): OptionGridItem => ({
  id: artist.slug,
  label: artist.name,
  imageUrl: artist.pokemonNumber == undefined ? undefined : spriteUrl(artist.pokemonNumber)
})

export default function ArtistSelector(props: ArtistSelectorProps) {
  const isMobile = useIsMobile()
  const [isOpen, setOpen] = useState(false)
  const [filter, setFilter] = useState('')
  const artists = useMemo(() => props.artists ?? [], [props.artists])

  const options = useMemo(() => matchingArtists(artists, filter).map(toOption), [artists, filter])

  const selectedArtist = artists.find((artist) => artist.slug == props.selectedSlug)
  const triggerOptions =
    selectedArtist == undefined || options.some((option) => option.id == props.selectedSlug)
      ? options
      : [toOption(selectedArtist), ...options]

  const open = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setFilter('')
    }
  }

  const select = (slug: string) => {
    props.onSelectArtist(slug)
    open(false)
  }

  const handleFilterKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key == 'Enter' && options.length > 0) {
      select(options[0].id)
    }
  }

  const filterField = (
    <input
      className={isMobile ? `${pickerStyles.filter} ${pickerStyles.sheetFilter}` : pickerStyles.filter}
      type='search'
      placeholder='Name'
      aria-label='Filter artists'
      value={filter}
      onChange={(event) => setFilter(event.target.value)}
      onKeyDown={handleFilterKeyDown}
      autoFocus
    />
  )

  return (
    <div className={`${selectorStyles.selector} ${pickerStyles.picker}`}>
      <Dropdown
        variant='set'
        ariaLabel='Artist'
        placeholder='Select artist'
        options={triggerOptions}
        disabled={artists.length == 0}
        isOpen={isOpen && !isMobile}
        setOpen={open}
        selectedId={props.selectedSlug}
        onSelect={select}
        panelHeader={filterField}
      />
      {isMobile && isOpen && (
        <MobileSheet
          title='Artist'
          options={options}
          selectedId={props.selectedSlug}
          onClose={() => open(false)}
          onSelect={select}
          sheetHeader={filterField}
        />
      )}
      {props.selectedSlug != undefined && (
        <CopyButton variant='share' value={artistShareLink(props.selectedSlug)} label='Copy link to this artist' />
      )}
    </div>
  )
}
