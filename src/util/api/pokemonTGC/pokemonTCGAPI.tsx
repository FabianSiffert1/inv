import { PokemonCard } from './model/PokemonCard'
import { PokemonSet } from './model/PokemonSet'
import configuration from './configuration'
import queryBuilder from './queryBuilder'

const configure = ({ apiKey }: { apiKey?: string }) => {
  configuration.apiKey = apiKey
}

export default {
  configure,
  card: queryBuilder<PokemonCard>('cards'),
  set: queryBuilder<PokemonSet>('sets')
}
