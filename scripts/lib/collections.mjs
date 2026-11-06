export const mapConcurrently = async (items, concurrency, mapper) => {
  const results = new Array(items.length)
  let nextIndex = 0
  const worker = async () => {
    while (nextIndex < items.length) {
      const index = nextIndex++
      results[index] = await mapper(items[index])
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker))
  return results
}

export const groupBy = (items, keysOf) => {
  const groups = new Map()
  items.forEach((item) =>
    keysOf(item).forEach((key) => {
      if (!groups.has(key)) {
        groups.set(key, [])
      }
      groups.get(key).push(item)
    })
  )
  return groups
}

export const mostCommon = (values) => {
  const counts = new Map()
  values.filter((value) => value != undefined).forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1))
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].length - b[0].length)[0]?.[0]
}
