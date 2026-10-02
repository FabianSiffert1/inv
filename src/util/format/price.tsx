const priceFormat = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' })

export const formatPrice = (price?: number): string | undefined => (price == undefined ? undefined : priceFormat.format(price))

export const formatPriceParts = (price?: number): { amount: string; currency: string } | undefined => {
  if (price == undefined) {
    return undefined
  }
  const parts = priceFormat.formatToParts(price)
  return {
    amount: parts
      .filter((part) => part.type != 'currency')
      .map((part) => part.value)
      .join('')
      .trim(),
    currency: parts.find((part) => part.type == 'currency')?.value ?? ''
  }
}
