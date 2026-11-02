import { PokemonCard } from '../../api/pokemonTGC/model/PokemonCard'

export type RarityTier = 'top' | 'high' | 'regular'

const rarityGroups: string[][] = [
  ['RGB Rare', 'Black White Rare', 'Mega Hyper Rare'],
  ['Hyper rare', 'Secret Rare', 'Futuristic Rare', 'Special illustration rare'],
  ['Rare Holo LV.X', 'Holo Rare VMAX', 'Shiny rare VMAX', 'Holo Rare VSTAR', 'Mega Attack Rare', 'Radiant Rare'],
  ['ACE SPEC Rare', 'Illustration rare', 'Ultra Rare', 'Shiny Ultra Rare', 'Shiny rare V', 'Amazing Rare', 'LEGEND'],
  ['Holo Rare V', 'Full Art Trainer', 'Rare PRIME', 'Double rare'],
  ['Shiny rare', 'Holo Rare', 'Rare Holo', 'Classic Collection'],
  ['Pikachu Rare', 'Rare'],
  ['Uncommon', 'Common'],
  ['Promo']
]

export const noRarity = 'None'

const rarityRanks = new Map(rarityGroups.flat().map((rarity, index) => [rarity, index]))
const unknownRarityRank = rarityRanks.size
const noRarityRank = unknownRarityRank + 1

const topTierGroupCount = 2
const highTierGroupCount = 4

export const rarityOf = (card: PokemonCard): string => card.rarity ?? noRarity

export const rarityRank = (rarity: string): number => (rarity == noRarity ? noRarityRank : (rarityRanks.get(rarity) ?? unknownRarityRank))

export const rarityTier = (rarity: string): RarityTier => {
  const groupIndex = rarityGroups.findIndex((group) => group.includes(rarity))
  if (groupIndex < 0) {
    return 'regular'
  }
  if (groupIndex < topTierGroupCount) {
    return 'top'
  }
  return groupIndex < highTierGroupCount ? 'high' : 'regular'
}
