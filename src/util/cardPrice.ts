import { PokemonCard, TcgPlayer } from './api/pokemonTGC/model/PokemonCard'
import { Currency } from './format/price'

export type PriceSource = 'cardmarket' | 'tcgplayer'

export interface DisplayPrice {
  amount: number
  currency: Currency
  source: PriceSource
  url?: string
}

type TcgPlayerVariant = keyof NonNullable<TcgPlayer['prices']>

const tcgPlayerVariantOrder: TcgPlayerVariant[] = [
  'normal',
  'holofoil',
  'reverseHolofoil',
  'unlimited',
  'unlimitedHolofoil',
  '1stEdition',
  '1stEditionHolofoil'
]

const tcgPlayerMarketPrice = (tcgplayer?: TcgPlayer): number | undefined => {
  for (const variant of tcgPlayerVariantOrder) {
    const priceSet = tcgplayer?.prices?.[variant]
    const price = priceSet?.market ?? priceSet?.mid
    if (price != undefined) {
      return price
    }
  }
  return undefined
}

export const cardDisplayPrice = (card: PokemonCard): DisplayPrice | undefined => {
  const trendPrice = card.cardmarket?.prices?.trendPrice
  if (trendPrice != undefined) {
    return { amount: trendPrice, currency: 'EUR', source: 'cardmarket', url: card.cardmarket?.url }
  }
  const marketPrice = tcgPlayerMarketPrice(card.tcgplayer)
  if (marketPrice != undefined) {
    return { amount: marketPrice, currency: 'USD', source: 'tcgplayer', url: card.tcgplayer?.url }
  }
  return undefined
}
