import { RarityTier } from './rarity'

export interface ReleaseAgeBucket {
  label: string
  maxMonths: number
  tier: RarityTier
}

export const releaseAgeBuckets: ReleaseAgeBucket[] = [
  { label: 'Under 6 months', maxMonths: 6, tier: 'top' },
  { label: '6 to 12 months', maxMonths: 12, tier: 'top' },
  { label: '1 to 2 years', maxMonths: 24, tier: 'high' },
  { label: '2 to 5 years', maxMonths: 60, tier: 'high' },
  { label: '5 to 10 years', maxMonths: 120, tier: 'regular' },
  { label: '10 years and older', maxMonths: Infinity, tier: 'regular' }
]

const millisecondsPerMonth = (1000 * 60 * 60 * 24 * 365.25) / 12

export const releaseAgeBucketOf = (releaseDate: string, now: Date = new Date()): ReleaseAgeBucket => {
  const months = (now.getTime() - new Date(releaseDate).getTime()) / millisecondsPerMonth
  return releaseAgeBuckets.find((bucket) => months < bucket.maxMonths) ?? releaseAgeBuckets[releaseAgeBuckets.length - 1]
}
