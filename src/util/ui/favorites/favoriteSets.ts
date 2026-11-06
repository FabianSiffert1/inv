let favoriteSetIds = new Set<string>()

export const rememberFavoriteSetIds = (setIds: string[]) => {
  favoriteSetIds = new Set(setIds)
}

export const isFavoriteSetId = (setId: string): boolean => favoriteSetIds.has(setId)
