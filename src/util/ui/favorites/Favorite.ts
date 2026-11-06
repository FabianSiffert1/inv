export interface Favorite {
  cardId: string
  setId: string
  addedAt: number
  print?: string
}

export const favoriteKey = (favorite: Pick<Favorite, 'cardId' | 'print'>): string =>
  favorite.print == undefined ? favorite.cardId : `${favorite.cardId}#${favorite.print}`

export const sortByAddedAt = (favorites: Favorite[]): Favorite[] => [...favorites].sort((a, b) => a.addedAt - b.addedAt)
