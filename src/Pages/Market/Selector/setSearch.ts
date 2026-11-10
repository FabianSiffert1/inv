import { PokemonSet } from '../../../util/api/pokemonTGC/model/PokemonSet'

const rankOf = (pokemonSet: PokemonSet, query: string): number => {
  if (pokemonSet.ptcgoCode?.toLowerCase() == query || pokemonSet.id.toLowerCase() == query) {
    return 0
  }
  const names = [pokemonSet.name, pokemonSet.germanName].flatMap((name) => (name == undefined ? [] : [name.toLowerCase()]))
  if (names.some((name) => name.startsWith(query))) {
    return 1
  }
  if (names.some((name) => name.split(/[\s—–-]+/).some((word) => word.startsWith(query)))) {
    return 2
  }
  if (names.some((name) => name.includes(query))) {
    return 3
  }
  return -1
}

export const matchingSets = (pokemonSets: PokemonSet[], query: string): PokemonSet[] => {
  const normalizedQuery = query.trim().toLowerCase()
  if (normalizedQuery == '') {
    return pokemonSets
  }
  return pokemonSets
    .map((pokemonSet) => ({ pokemonSet, rank: rankOf(pokemonSet, normalizedQuery) }))
    .filter(({ rank }) => rank >= 0)
    .sort((a, b) => a.rank - b.rank || b.pokemonSet.releaseDate.localeCompare(a.pokemonSet.releaseDate))
    .map(({ pokemonSet }) => pokemonSet)
}
