const englishLanguageId = '1'
const germanLanguageId = '3'
const nearMintConditionId = '2'

export const englishNearMintUrl = (cardmarketUrl: string): string => {
  const url = new URL(cardmarketUrl)
  if (url.pathname.includes('/Products/Search')) {
    return cardmarketUrl
  }
  url.searchParams.set('language', englishLanguageId)
  url.searchParams.set('minCondition', nearMintConditionId)
  return url.toString()
}

export const germanListingsUrl = (cardmarketUrl: string): string => {
  const url = new URL(cardmarketUrl)
  url.searchParams.set('language', germanLanguageId)
  return url.toString()
}
