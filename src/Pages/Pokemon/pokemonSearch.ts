import { Pokemon } from '../../util/api/pokemonTGC/model/Pokemon'
import { localizedName } from '../../util/ui/language/LanguageProvider'

export const matchingPokemon = (pokemon: Pokemon[], query: string, germanNames: boolean): Pokemon[] => {
  const normalizedQuery = query.trim().toLowerCase().replace(/^#/, '')
  if (normalizedQuery == '') {
    return pokemon
  }
  if (/^\d+$/.test(normalizedQuery)) {
    return pokemon.filter((entry) => entry.number == Number(normalizedQuery))
  }
  const rank = (entry: Pokemon): number => {
    const names = [localizedName(entry, germanNames), entry.name, entry.germanName].map((name) => name?.toLowerCase())
    if (names.some((name) => name?.startsWith(normalizedQuery))) {
      return 0
    }
    if (names.some((name) => name?.includes(normalizedQuery))) {
      return 1
    }
    return -1
  }
  return pokemon
    .map((entry) => ({ entry, rank: rank(entry) }))
    .filter(({ rank }) => rank >= 0)
    .sort((a, b) => a.rank - b.rank)
    .map(({ entry }) => entry)
}
