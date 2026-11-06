type PixelRow = [y: number, x: number, width: number, fill: string]

const outline = '#1A1A1C'
const white = '#F4F4F4'
const shade = '#D6D6D6'

const ballShell = (top: string, highlight: string): PixelRow[] => [
  [1, 5, 6, outline],
  [2, 3, 1, outline],
  [2, 4, 8, top],
  [2, 12, 1, outline],
  [3, 2, 1, outline],
  [3, 3, 1, top],
  [3, 4, 2, highlight],
  [3, 6, 7, top],
  [3, 13, 1, outline],
  [4, 1, 1, outline],
  [4, 2, 1, top],
  [4, 3, 1, highlight],
  [4, 4, 10, top],
  [4, 14, 1, outline],
  [5, 1, 1, outline],
  [5, 2, 12, top],
  [5, 14, 1, outline],
  [6, 0, 1, outline],
  [6, 1, 5, top],
  [6, 6, 4, outline],
  [6, 10, 5, top],
  [6, 15, 1, outline],
  [7, 0, 7, outline],
  [7, 7, 2, white],
  [7, 9, 7, outline],
  [8, 0, 7, outline],
  [8, 7, 2, white],
  [8, 9, 7, outline],
  [9, 0, 1, outline],
  [9, 1, 5, white],
  [9, 6, 4, outline],
  [9, 10, 5, white],
  [9, 15, 1, outline],
  [10, 1, 1, outline],
  [10, 2, 12, white],
  [10, 14, 1, outline],
  [11, 1, 1, outline],
  [11, 2, 12, white],
  [11, 14, 1, outline],
  [12, 2, 1, outline],
  [12, 3, 10, white],
  [12, 13, 1, outline],
  [13, 3, 1, outline],
  [13, 4, 8, shade],
  [13, 12, 1, outline],
  [14, 5, 6, outline]
]

const pokeBallRows: PixelRow[] = ballShell('#E3350D', '#F27C5C')

const masterPurple = '#7B3FA0'
const masterPink = '#E85DA8'

const masterBallRows: PixelRow[] = [
  ...ballShell(masterPurple, '#9D63C2'),
  [4, 2, 2, masterPink],
  [5, 2, 2, masterPink],
  [4, 12, 2, masterPink],
  [5, 12, 2, masterPink],
  [2, 6, 1, white],
  [2, 10, 1, white],
  [3, 6, 2, white],
  [3, 9, 2, white],
  [4, 6, 1, white],
  [4, 8, 1, white],
  [4, 10, 1, white],
  [5, 6, 1, white],
  [5, 10, 1, white]
]

function PixelIcon({ rows }: { rows: PixelRow[] }) {
  return (
    <svg viewBox='0 0 16 16' shapeRendering='crispEdges' aria-hidden='true' focusable='false'>
      {rows.map(([y, x, width, fill], index) => (
        <rect key={index} x={x} y={y} width={width} height='1' fill={fill} />
      ))}
    </svg>
  )
}

export function PokeBallIcon() {
  return <PixelIcon rows={pokeBallRows} />
}

export function MasterBallIcon() {
  return <PixelIcon rows={masterBallRows} />
}

const signOutRows: [y: number, x: number, width: number][] = [
  [1, 2, 7],
  [2, 2, 2],
  [2, 7, 2],
  [3, 2, 2],
  [3, 7, 2],
  [4, 2, 2],
  [5, 2, 2],
  [5, 11, 2],
  [6, 2, 2],
  [6, 12, 2],
  [7, 2, 2],
  [7, 6, 8],
  [8, 2, 2],
  [8, 6, 8],
  [9, 2, 2],
  [9, 12, 2],
  [10, 2, 2],
  [10, 11, 2],
  [11, 2, 2],
  [12, 2, 2],
  [12, 7, 2],
  [13, 2, 2],
  [13, 7, 2],
  [14, 2, 7]
]

export function SignOutIcon() {
  return (
    <svg viewBox='0 0 16 16' shapeRendering='crispEdges' aria-hidden='true' focusable='false'>
      {signOutRows.map(([y, x, width]) => (
        <rect key={`${y}-${x}`} x={x} y={y} width={width} height='1' fill='currentColor' />
      ))}
    </svg>
  )
}
