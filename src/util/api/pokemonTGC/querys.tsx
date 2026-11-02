import axios from 'axios'
import { Pokemon } from './model/Pokemon'
import { PokemonCard } from './model/PokemonCard'
import { PokemonSet } from './model/PokemonSet'

export interface SetsSnapshot {
  generatedAt: string
  sets: PokemonSet[]
}

export const fetchSetsSnapshot = async (signal?: AbortSignal): Promise<SetsSnapshot> =>
  (await axios.get<SetsSnapshot>('/data/sets.json', { signal })).data

export const fetchAllCardsOfASet = async (setId: string, signal?: AbortSignal): Promise<PokemonCard[]> =>
  (await axios.get<PokemonCard[]>(`/data/cards/${encodeURIComponent(setId)}.json`, { signal })).data

export const fetchPokemonIndex = async (signal?: AbortSignal): Promise<Pokemon[]> =>
  (await axios.get<Pokemon[]>('/data/pokemon.json', { signal })).data

export const fetchCardsOfPokemon = async (pokedexNumber: number, signal?: AbortSignal): Promise<PokemonCard[]> =>
  (await axios.get<PokemonCard[]>(`/data/pokemon/${pokedexNumber}.json`, { signal })).data
