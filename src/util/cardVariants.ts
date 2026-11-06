import { PokemonCard } from './api/pokemonTGC/model/PokemonCard'

const capitalize = (word: string) => word.charAt(0).toUpperCase() + word.slice(1)

export const foilLabel = (foil: string): string => `${foil.split('-').map(capitalize).join(' ')} Holo`

export const variantLabels = (card: PokemonCard): string[] => {
  const labels: string[] = []
  const foils = card.foils ?? []
  if (foils.length > 0) {
    labels.push(...foils.map(foilLabel))
  } else if (card.variants?.holo) {
    labels.push('Holo')
  }
  if (card.variants?.reverse) {
    labels.push('Reverse Holo')
  }
  if (card.variants?.firstEdition) {
    labels.push('1st Edition')
  }
  return labels
}
