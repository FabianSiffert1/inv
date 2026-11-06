import { useContext } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useArtistIndex } from '../../util/api/pokemonTGC/hooks'
import { artistPath } from '../../util/api/pokemonTGC/model/Artist'
import { SearchContext } from '../../util/ui/search/SearchProvider'

interface ArtistLinkProps {
  name: string
  className?: string
  fallbackClassName?: string
}

export default function ArtistLink(props: ArtistLinkProps) {
  const { data: artists } = useArtistIndex()
  const { closeSearch } = useContext(SearchContext)
  const params = useParams()
  const artist = artists?.find((entry) => entry.name == props.name.trim())
  const label = `Illus. ${props.name}`

  if (artist == undefined || params.slug == artist.slug) {
    return <span className={props.fallbackClassName}>{label}</span>
  }

  return (
    <Link
      className={props.className}
      to={artistPath(artist.slug)}
      onClick={() => {
        closeSearch()
        window.scrollTo(0, 0)
      }}
    >
      {label}
    </Link>
  )
}
