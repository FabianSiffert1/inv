import { Artist } from '../../util/api/pokemonTGC/model/Artist'

export const matchingArtists = (artists: Artist[], query: string): Artist[] => {
  const normalizedQuery = query.trim().toLowerCase()
  if (normalizedQuery == '') {
    return artists
  }
  const rank = (artist: Artist): number => {
    const name = artist.name.toLowerCase()
    if (name.startsWith(normalizedQuery)) {
      return 0
    }
    return name.includes(normalizedQuery) ? 1 : -1
  }
  return artists
    .map((artist) => ({ artist, rank: rank(artist) }))
    .filter(({ rank }) => rank >= 0)
    .sort((a, b) => a.rank - b.rank)
    .map(({ artist }) => artist)
}
