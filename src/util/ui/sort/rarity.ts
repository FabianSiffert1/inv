import { PokemonCard } from '../../api/pokemonTGC/model/PokemonCard'

export type RarityTier = 'top' | 'high' | 'regular'

const rarityGroups: string[][] = [
  ['Mega Hyper Rare', 'Hyper rare', 'Black White Rare'],
  ['Special illustration rare', 'Secret Rare', 'Shiny Ultra Rare'],
  ['Illustration rare', 'Mega Attack Rare', 'Ultra Rare'],
  ['Shiny rare VMAX', 'Shiny rare V', 'Shiny rare'],
  ['ACE SPEC Rare', 'Radiant Rare', 'Amazing Rare', 'Full Art Trainer'],
  ['Rare PRIME', 'LEGEND', 'Rare Holo LV.X'],
  ['Holo Rare VSTAR', 'Holo Rare VMAX', 'Holo Rare V', 'Double rare'],
  ['Pikachu Rare', 'RGB Rare', 'Futuristic Rare', 'Classic Collection'],
  ['Holo Rare', 'Rare Holo', 'Rare'],
  ['Uncommon', 'Common'],
  ['Promo']
]

export const noRarity = 'None'

const rarityRanks = new Map(rarityGroups.flat().map((rarity, index) => [rarity, index]))
const unknownRarityRank = rarityRanks.size
const noRarityRank = unknownRarityRank + 1

const topTierGroupCount = 2
const highTierGroupCount = 5

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
