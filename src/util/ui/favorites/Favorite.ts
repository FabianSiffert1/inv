export interface Favorite {
  cardId: string
  setId: string
  addedAt: number
}

export const sortByAddedAt = (favorites: Favorite[]): Favorite[] => [...favorites].sort((a, b) => a.addedAt - b.addedAt)
