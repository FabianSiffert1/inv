export const formatPrice = (price?: number): string | undefined =>
  price == undefined ? undefined : price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })
