import { useContext } from 'react'
import { Link, useParams } from 'react-router-dom'
import { usePokemonIndex } from '../../util/api/pokemonTGC/hooks'
import { pokemonPath } from '../../util/api/pokemonTGC/model/Pokemon'
import { LanguageContext, localizedName } from '../../util/ui/language/LanguageProvider'
import styles from './AllCardsOfPokemonLink.module.scss'

interface AllCardsOfPokemonLinkProps {
  pokedexNumber: number
}

export default function AllCardsOfPokemonLink(props: AllCardsOfPokemonLinkProps) {
  const { germanNames } = useContext(LanguageContext)
  const { data: pokemonIndex } = usePokemonIndex()
  const params = useParams()
  const pokemon = pokemonIndex?.find((entry) => entry.number == props.pokedexNumber)

  if (pokemon == undefined || pokemon.cardCount < 2 || Number(params.pokedexNumber) == pokemon.number) {
    return null
  }

  return (
    <Link className={styles.link} to={pokemonPath(pokemon.number)} onClick={() => window.scrollTo(0, 0)}>
      All {pokemon.cardCount} {localizedName(pokemon, germanNames)} cards
      <span className={styles.arrow} aria-hidden='true'>
        →
      </span>
    </Link>
  )
}
