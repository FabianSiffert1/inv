import { useContext } from 'react'
import { PokemonCard } from '../../util/api/pokemonTGC/model/PokemonCard'
import { FavoritesContext } from '../../util/ui/favorites/FavoritesProvider'
import styles from './FavoriteButton.module.scss'

interface FavoriteButtonProps {
  card: PokemonCard
}

export function FavoriteButton({ card }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useContext(FavoritesContext)
  const isFavorited = isFavorite(card.id)
  const label = isFavorited ? 'Remove from favorites' : 'Add to favorites'

  return (
    <button
      type='button'
      className={`${styles.favoriteButton} ${isFavorited ? styles.favorited : ''}`}
      aria-label={label}
      aria-pressed={isFavorited}
      title={label}
      onClick={(event) => {
        event.stopPropagation()
        toggleFavorite(card)
      }}
    >
      <StarIcon filled={isFavorited} />
    </button>
  )
}

const starRows: [y: number, x: number, width: number][] = [
  [1, 7, 2],
  [2, 7, 2],
  [3, 6, 4],
  [4, 6, 4],
  [5, 1, 14],
  [6, 2, 12],
  [7, 3, 10],
  [8, 4, 8],
  [9, 4, 8],
  [10, 3, 10],
  [11, 3, 4],
  [11, 9, 4],
  [12, 2, 4],
  [12, 10, 4],
  [13, 2, 3],
  [13, 11, 3]
]

export function StarIcon({ filled = true }: { filled?: boolean }) {
  return (
    <svg viewBox='0 0 16 16' shapeRendering='crispEdges' aria-hidden='true' focusable='false'>
      {starRows.map(([y, x, width]) => (
        <rect key={`${y}-${x}`} x={x} y={y} width={width} height='1' fill={filled ? '#F5C518' : 'currentColor'} />
      ))}
    </svg>
  )
}
