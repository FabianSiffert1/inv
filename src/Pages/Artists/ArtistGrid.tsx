import { Link } from 'react-router-dom'
import { Artist, artistPath } from '../../util/api/pokemonTGC/model/Artist'
import { useStrings } from '../../util/ui/language/LanguageProvider'
import { tintClassNameOfType } from '../Market/CardList/Components/Card/Card'
import { CardImage } from '../Market/CardList/Components/CardImage/CardImage'
import cardListStyles from '../Market/CardList/CardList.module.scss'
import cardStyles from '../Market/CardList/Components/Card/Card.module.scss'
import styles from './ArtistGrid.module.scss'

interface ArtistGridProps {
  artists: Artist[]
}

export default function ArtistGrid(props: ArtistGridProps) {
  const t = useStrings()

  return (
    <div className={cardListStyles.cardList}>
      {props.artists.map((artist) => (
        <Link
          key={artist.slug}
          className={`${cardStyles.cardWrapper} ${tintClassNameOfType(artist.topCardType)} ${styles.tile}`}
          to={artistPath(artist.slug)}
          onClick={() => window.scrollTo(0, 0)}
        >
          <span className={`${cardStyles.card} ${styles.cardFrame}`}>
            <CardImage className={cardStyles.cardImage} sources={[artist.topCardImage]} alt='' pokedexNumber={artist.pokemonNumber} lazy />
          </span>
          <span className={cardStyles.cardInformationWrapper}>
            <span className={cardStyles.cardName}>{artist.name}</span>
            <span className={cardStyles.cardPrice}>{t.cardCount(artist.cardCount)}</span>
          </span>
        </Link>
      ))}
    </div>
  )
}
