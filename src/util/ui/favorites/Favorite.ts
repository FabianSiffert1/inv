export type Urgency = 'urgent' | 'normal' | 'later'

export const urgencies: Urgency[] = ['urgent', 'normal', 'later']

export const isUrgency = (value: unknown): value is Urgency => urgencies.some((urgency) => urgency == value)

export interface Favorite {
  cardId: string
  setId: string
  addedAt: number
  print?: string
  urgency?: Urgency
}

export const favoriteKey = (favorite: Pick<Favorite, 'cardId' | 'print'>): string =>
  favorite.print == undefined ? favorite.cardId : `${favorite.cardId}#${favorite.print}`

export const sortByAddedAt = (favorites: Favorite[]): Favorite[] => [...favorites].sort((a, b) => a.addedAt - b.addedAt)
