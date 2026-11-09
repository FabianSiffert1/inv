import { Strings } from '../ui/language/strings'

export const formatSetReleaseDate = (releaseDate: string | undefined, t: Strings): string => {
  if (releaseDate == undefined) {
    return t.unknown
  }
  const parsed = new Date(releaseDate)
  if (Number.isNaN(parsed.getTime())) {
    return t.unknown
  }
  return parsed.toLocaleDateString(t.locale, { month: 'long', year: 'numeric' })
}

export const formatPriceDate = (updatedAt: string | undefined, locale: string): string | undefined => {
  if (updatedAt == undefined) {
    return undefined
  }
  const parsed = new Date(updatedAt)
  if (Number.isNaN(parsed.getTime())) {
    return undefined
  }
  return parsed.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
}
