export const formatSetReleaseDate = (releaseDate?: string): string => {
  if (releaseDate == undefined) {
    return 'Unknown'
  }
  const parsed = new Date(releaseDate)
  if (Number.isNaN(parsed.getTime())) {
    return 'Unknown'
  }
  return parsed.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

export const formatPriceDate = (updatedAt?: string): string | undefined => {
  if (updatedAt == undefined) {
    return undefined
  }
  const parsed = new Date(updatedAt)
  if (Number.isNaN(parsed.getTime())) {
    return undefined
  }
  return parsed.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}
