const germanLanguageId = '3'

export const germanListingsUrl = (cardmarketUrl: string): string => {
  const url = new URL(cardmarketUrl)
  url.searchParams.set('language', germanLanguageId)
  return url.toString()
}
