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
