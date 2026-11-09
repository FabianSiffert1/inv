import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { Pokemon, pokemonPath, spriteUrl } from '../../util/api/pokemonTGC/model/Pokemon'
import { LanguageContext, localizedName, useStrings } from '../../util/ui/language/LanguageProvider'
import { tintClassNameOfType } from '../Market/CardList/Components/Card/Card'
import cardListStyles from '../Market/CardList/CardList.module.scss'
import cardStyles from '../Market/CardList/Components/Card/Card.module.scss'
import styles from './PokemonGrid.module.scss'

interface PokemonGridProps {
  pokemon: Pokemon[]
}

export default function PokemonGrid(props: PokemonGridProps) {
  const { germanNames } = useContext(LanguageContext)
  const t = useStrings()

  return (
    <div className={cardListStyles.cardList}>
      {props.pokemon.map((entry) => (
        <Link
          key={entry.number}
          className={`${cardStyles.cardWrapper} ${tintClassNameOfType(entry.type)} ${styles.tile}`}
          to={pokemonPath(entry.number)}
          onClick={() => window.scrollTo(0, 0)}
        >
          <span className={styles.spriteFrame}>
            <img
              className={styles.sprite}
              src={spriteUrl(entry.number)}
              alt=''
              loading='lazy'
              onError={(event) => (event.currentTarget.hidden = true)}
            />
            <span className={styles.number}>#{entry.number.toString().padStart(4, '0')}</span>
          </span>
          <span className={cardStyles.cardInformationWrapper}>
            <span className={cardStyles.cardName}>{localizedName(entry, germanNames)}</span>
            <span className={cardStyles.cardPrice}>{t.cardCount(entry.cardCount)}</span>
          </span>
        </Link>
      ))}
    </div>
  )
}
