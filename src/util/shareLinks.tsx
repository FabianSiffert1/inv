import { PokemonCard } from './api/pokemonTGC/model/PokemonCard'

const marketLink = (params: Record<string, string>) =>
  `${window.location.origin}${import.meta.env.BASE_URL}market?${new URLSearchParams(params)}`

export const setShareLink = (setId: string) => marketLink({ set: setId })

export const cardShareLink = (card: PokemonCard) => marketLink({ set: card.set.id, card: card.id })
