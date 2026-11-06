const keyRows: [y: number, x: number, width: number][] = [
  [2, 2, 4],
  [3, 1, 1],
  [3, 6, 1],
  [4, 1, 1],
  [4, 3, 2],
  [4, 6, 1],
  [5, 1, 1],
  [5, 6, 1],
  [6, 2, 4],
  [7, 3, 2],
  [8, 3, 2],
  [9, 3, 2],
  [10, 3, 4],
  [11, 3, 2],
  [12, 3, 4],
  [13, 3, 2]
]

export function KeyIcon() {
  return (
    <svg viewBox='0 0 16 16' shapeRendering='crispEdges' aria-hidden='true' focusable='false'>
      {keyRows.map(([y, x, width]) => (
        <rect key={`${y}-${x}`} x={x} y={y} width={width} height='1' fill='currentColor' />
      ))}
    </svg>
  )
}
