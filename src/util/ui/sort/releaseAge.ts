import { ReleaseAge } from '../language/strings'
import { RarityTier } from './rarity'

export interface ReleaseAgeBucket {
  age: ReleaseAge
  maxMonths: number
  tier: RarityTier
}

export const releaseAgeBuckets: ReleaseAgeBucket[] = [
  { age: 'under6Months', maxMonths: 6, tier: 'top' },
  { age: 'sixTo12Months', maxMonths: 12, tier: 'top' },
  { age: 'oneTo2Years', maxMonths: 24, tier: 'high' },
  { age: 'twoTo5Years', maxMonths: 60, tier: 'high' },
  { age: 'fiveTo10Years', maxMonths: 120, tier: 'regular' },
  { age: 'tenYearsAndOlder', maxMonths: Infinity, tier: 'regular' }
]

const millisecondsPerMonth = (1000 * 60 * 60 * 24 * 365.25) / 12

export const releaseAgeBucketOf = (releaseDate: string, now: Date = new Date()): ReleaseAgeBucket => {
  const months = (now.getTime() - new Date(releaseDate).getTime()) / millisecondsPerMonth
  return releaseAgeBuckets.find((bucket) => months < bucket.maxMonths) ?? releaseAgeBuckets[releaseAgeBuckets.length - 1]
}
