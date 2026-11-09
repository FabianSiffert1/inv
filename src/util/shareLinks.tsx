import { PokemonCard } from './api/pokemonTGC/model/PokemonCard'

const marketLink = (params: Record<string, string>) =>
  `${window.location.origin}${import.meta.env.BASE_URL}market?${new URLSearchParams(params)}`

export const setShareLink = (setId: string) => marketLink({ set: setId })

export const cardShareLink = (card: PokemonCard) => marketLink({ set: card.set.id, card: card.id })

export const pokemonShareLink = (pokedexNumber: number) => `${window.location.origin}${import.meta.env.BASE_URL}pokemon/${pokedexNumber}`

export const artistShareLink = (slug: string) => `${window.location.origin}${import.meta.env.BASE_URL}artists/${slug}`

export const cardmarketSearchLink = (card: PokemonCard) =>
  `https://www.cardmarket.com/en/Pokemon/Products/Search?searchString=${encodeURIComponent(`${card.name} ${card.number}`)}`

export const tcgplayerSearchLink = (card: PokemonCard) =>
  `https://www.tcgplayer.com/search/pokemon/product?productLineName=pokemon&q=${encodeURIComponent(`${card.name} ${card.number}`)}`

export const priceChartingSearchLink = (card: PokemonCard) =>
  `https://www.pricecharting.com/search-products?type=prices&q=${encodeURIComponent(`pokemon ${card.set.name} ${card.name} ${card.number}`)}`
