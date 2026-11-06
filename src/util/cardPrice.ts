import { PokemonCard, TcgPlayer, TcgPlayerPriceSet } from './api/pokemonTGC/model/PokemonCard'
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

const tcgPlayerVariantLabels: Record<TcgPlayerVariant, string> = {
  normal: 'Normal',
  holofoil: 'Holo',
  reverseHolofoil: 'Reverse Holo',
  unlimited: 'Unlimited',
  unlimitedHolofoil: 'Unlimited Holo',
  '1stEdition': '1st Edition',
  '1stEditionHolofoil': '1st Edition Holo'
}

const mainTcgPlayerVariant = (tcgplayer?: TcgPlayer): TcgPlayerVariant | undefined =>
  tcgPlayerVariantOrder.find((variant) => variant != 'reverseHolofoil' && tcgplayer?.prices?.[variant] != undefined)

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

export interface PriceCell {
  amount: number
  highestAmount?: number
  url?: string
}

export interface PriceTableRow {
  label: string
  isMain: boolean
  cardmarket?: PriceCell
  tcgplayer?: PriceCell
}

const tcgPlayerCell = (tcgplayer: TcgPlayer | undefined, priceSet: TcgPlayerPriceSet | undefined): PriceCell | undefined => {
  const amount = priceSet?.market ?? priceSet?.mid
  return amount == undefined ? undefined : { amount, url: tcgplayer?.url }
}

const isProductUrl = (url?: string): boolean => url != undefined && !url.includes('/Search?')

export const cardPriceRows = (card: PokemonCard): PriceTableRow[] => {
  const cardmarket = card.cardmarket
  const tcgplayer = card.tcgplayer
  const prices = cardmarket?.prices
  const mainUrl = isProductUrl(cardmarket?.url) ? cardmarket?.url : undefined
  const mainVariant = mainTcgPlayerVariant(tcgplayer)
  const rows: PriceTableRow[] = []

  const mainCell: PriceCell | undefined = prices?.trendPrice == undefined ? undefined : { amount: prices.trendPrice, url: mainUrl }
  const mainTcgPlayer = tcgPlayerCell(tcgplayer, mainVariant == undefined ? undefined : tcgplayer?.prices?.[mainVariant])
  if (mainCell != undefined || mainTcgPlayer != undefined) {
    const label =
      mainVariant != undefined ? tcgPlayerVariantLabels[mainVariant] : card.variants?.holo && !card.variants.normal ? 'Holo' : 'Normal'
    rows.push({ label, isMain: true, cardmarket: mainCell, tcgplayer: mainTcgPlayer })
  }

  const reverseCell: PriceCell | undefined =
    prices?.reverseHoloTrend == undefined ? undefined : { amount: prices.reverseHoloTrend, url: mainUrl }
  const reverseTcgPlayer = tcgPlayerCell(tcgplayer, tcgplayer?.prices?.reverseHolofoil)
  const hasReversePrint = card.variants?.reverse ?? true
  if (hasReversePrint && (reverseCell != undefined || reverseTcgPlayer != undefined)) {
    rows.push({ label: 'Reverse Holo', isMain: false, cardmarket: reverseCell, tcgplayer: reverseTcgPlayer })
  }

  for (const variant of tcgPlayerVariantOrder) {
    if (variant == mainVariant || variant == 'reverseHolofoil') {
      continue
    }
    const cell = tcgPlayerCell(tcgplayer, tcgplayer?.prices?.[variant])
    if (cell != undefined) {
      rows.push({ label: tcgPlayerVariantLabels[variant], isMain: false, tcgplayer: cell })
    }
  }

  const knownLabels = new Set(rows.map((row) => row.label))
  for (const print of card.prints ?? []) {
    const isMainProduct = print.cardmarket?.url != undefined && print.cardmarket.url == mainUrl
    if (knownLabels.has(print.label) || isMainProduct || print.cardmarket?.trendPrice == undefined) {
      continue
    }
    rows.push({
      label: print.label,
      isMain: false,
      cardmarket: {
        amount: print.cardmarket.lowestTrendPrice ?? print.cardmarket.trendPrice,
        highestAmount: print.cardmarket.highestTrendPrice,
        url: print.cardmarket.url
      },
      tcgplayer: print.tcgplayer?.marketPrice == undefined ? undefined : { amount: print.tcgplayer.marketPrice, url: print.tcgplayer.url }
    })
    knownLabels.add(print.label)
  }

  return rows
}

export const printDisplayPrice = (card: PokemonCard, print?: string): DisplayPrice | undefined => {
  if (print == undefined) {
    return cardDisplayPrice(card)
  }
  const row = cardPriceRows(card).find((candidate) => candidate.label == print)
  if (row?.cardmarket != undefined) {
    return { amount: row.cardmarket.amount, currency: 'EUR', source: 'cardmarket', url: row.cardmarket.url }
  }
  if (row?.tcgplayer != undefined) {
    return { amount: row.tcgplayer.amount, currency: 'USD', source: 'tcgplayer', url: row.tcgplayer.url }
  }
  return undefined
}
