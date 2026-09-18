import { PokemonCard } from './model/PokemonCard'
import { PokemonSet, PokemonSetName } from './model/PokemonSet'
import pokemonTCGAPI from './pokemonTCGAPI'

export const fetchAllSets = async (): Promise<PokemonSet[]> => pokemonTCGAPI.set.all({ orderBy: 'releaseDate' })

export const trendPriceOf = (card: PokemonCard): number => card.cardmarket?.prices?.trendPrice ?? 0

export const fetchAllCardsOfASet = async (setName: PokemonSetName): Promise<PokemonCard[]> => {
  const cards: PokemonCard[] = await pokemonTCGAPI.card.all({
    q: `!set.name:"${setName}"`,
    orderBy: '-cardmarket.prices.trendPrice'
  })
  return [...cards].sort((a, b) => trendPriceOf(b) - trendPriceOf(a))
}
