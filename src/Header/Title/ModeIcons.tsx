import { spriteUrl } from '../../util/api/pokemonTGC/model/Pokemon'
import styles from './Title.module.scss'

const cardBackPixels = [
  '.NNNNNNNN.',
  'NBBBBBBBBN',
  'NBLBBBBBBN',
  'NBBBBBBBBN',
  'NBBRRRRBBN',
  'NBRRRRRRBN',
  'NBKKWWKKBN',
  'NBWWWWWWBN',
  'NBBWWWWBBN',
  'NBBBBBBBBN',
  'NBBBBBBBBN',
  'NBBBBBBLBN',
  'NBBBBBBBBN',
  '.NNNNNNNN.'
]

const pixelColors: Record<string, string> = {
  N: '#1d2f6f',
  B: '#3b6fd6',
  L: '#9cc0ff',
  R: '#e83e35',
  W: '#ffffff',
  K: '#1f1f1f'
}

export function CardBackIcon() {
  return (
    <svg
      className={styles.cardBack}
      viewBox={`0 0 ${cardBackPixels[0].length} ${cardBackPixels.length}`}
      shapeRendering='crispEdges'
      aria-hidden='true'
      focusable='false'
    >
      {cardBackPixels.flatMap((row, y) =>
        [...row].map((pixel, x) =>
          pixelColors[pixel] ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={pixelColors[pixel]} /> : null
        )
      )}
    </svg>
  )
}

const pikachuPokedexNumber = 25

export function PikachuIcon() {
  return <img className={styles.sprite} src={spriteUrl(pikachuPokedexNumber)} alt='' />
}

const smearglePokedexNumber = 235

export function SmeargleIcon() {
  return <img className={styles.sprite} src={spriteUrl(smearglePokedexNumber)} alt='' />
}
