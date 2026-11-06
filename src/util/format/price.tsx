export type Currency = 'EUR' | 'USD'

const priceFormats: Record<Currency, Intl.NumberFormat> = {
  EUR: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }),
  USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
}

export const formatPrice = (price?: number, currency: Currency = 'EUR'): string | undefined =>
  price == undefined ? undefined : priceFormats[currency].format(price)

export const formatPriceParts = (price?: number, currency: Currency = 'EUR'): { amount: string; currency: string } | undefined => {
  if (price == undefined) {
    return undefined
  }
  const parts = priceFormats[currency].formatToParts(price)
  return {
    amount: parts
      .filter((part) => part.type != 'currency')
      .map((part) => part.value)
      .join('')
      .trim(),
    currency: parts.find((part) => part.type == 'currency')?.value ?? ''
  }
}
