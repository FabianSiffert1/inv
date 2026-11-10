type PixelRow = [y: number, x: number, width: number]

const leftChevronRows: PixelRow[] = [
  [3, 9, 2],
  [4, 8, 2],
  [5, 7, 2],
  [6, 6, 2],
  [7, 5, 2],
  [8, 5, 2],
  [9, 6, 2],
  [10, 7, 2],
  [11, 8, 2],
  [12, 9, 2]
]

const rightChevronRows: PixelRow[] = leftChevronRows.map(([y, x, width]) => [y, 16 - x - width, width])

function ChevronIcon({ rows }: { rows: PixelRow[] }) {
  return (
    <svg viewBox='0 0 16 16' shapeRendering='crispEdges' aria-hidden='true' focusable='false'>
      {rows.map(([y, x, width], index) => (
        <rect key={index} x={x} y={y} width={width} height='1' fill='currentColor' />
      ))}
    </svg>
  )
}

export function PreviousIcon() {
  return <ChevronIcon rows={leftChevronRows} />
}

export function NextIcon() {
  return <ChevronIcon rows={rightChevronRows} />
}
