import { Artist } from './model/Artist'
import { Pokemon } from './model/Pokemon'
import { PokemonCard } from './model/PokemonCard'
import { PokemonSet } from './model/PokemonSet'
import { SearchIndexEntry } from './model/SearchIndex'

export interface SetsSnapshot {
  generatedAt: string
  sets: PokemonSet[]
}

export class HttpError extends Error {
  readonly status: number

  constructor(status: number, url: string) {
    super(`${status} for ${url}`)
    this.name = 'HttpError'
    this.status = status
  }
}

export const isNotFoundError = (error: unknown): boolean => error instanceof HttpError && error.status == 404

export const isNetworkError = (error: unknown): boolean => error instanceof TypeError

const getJson = async <T,>(url: string, signal?: AbortSignal): Promise<T> => {
  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new HttpError(response.status, url)
  }
  return (await response.json()) as T
}

export const fetchSetsSnapshot = (signal?: AbortSignal) => getJson<SetsSnapshot>('/data/sets.json', signal)

export const fetchAllCardsOfASet = (setId: string, signal?: AbortSignal) =>
  getJson<PokemonCard[]>(`/data/cards/${encodeURIComponent(setId)}.json`, signal)

export const fetchPokemonIndex = (signal?: AbortSignal) => getJson<Pokemon[]>('/data/pokemon.json', signal)

export const fetchCardsOfPokemon = (pokedexNumber: number, signal?: AbortSignal) =>
  getJson<PokemonCard[]>(`/data/pokemon/${pokedexNumber}.json`, signal)

export const fetchArtistIndex = (signal?: AbortSignal) => getJson<Artist[]>('/data/artists.json', signal)

export const fetchCardsOfArtist = (slug: string, signal?: AbortSignal) =>
  getJson<PokemonCard[]>(`/data/artists/${encodeURIComponent(slug)}.json`, signal)

export const fetchSearchIndex = (signal?: AbortSignal) => getJson<SearchIndexEntry[]>('/data/search.json', signal)
