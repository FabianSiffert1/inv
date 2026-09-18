import { PokemonCard } from './model/PokemonCard'
import { PokemonSet, PokemonSetName } from './model/PokemonSet'
import pokemonTCGAPI from './pokemonTCGAPI'

export const fetchAllSets = async (signal?: AbortSignal): Promise<PokemonSet[]> => pokemonTCGAPI.set.all({ orderBy: 'releaseDate' }, signal)

export const fetchAllCardsOfASet = async (setName: PokemonSetName, signal?: AbortSignal): Promise<PokemonCard[]> =>
  pokemonTCGAPI.card.all(
    {
      q: `!set.name:"${setName}"`,
      orderBy: '-cardmarket.prices.trendPrice'
    },
    signal
  )
