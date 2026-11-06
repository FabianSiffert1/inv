import { groupBy } from './collections.mjs'

const price = (value) => (typeof value == 'number' && value > 0 ? value : undefined)

const camelCase = (key) => key.replace(/-([a-z0-9])/g, (_, character) => character.toUpperCase())

export const toSet = (set, germanName, germanSeries) => ({
  id: set.id,
  name: set.name,
  germanName,
  series: set.serie.name,
  germanSeries,
  printedTotal: set.cardCount.official,
  total: set.cardCount.total,
  ptcgoCode: set.tcgOnline,
  releaseDate: set.releaseDate,
  images: {
    symbol: set.symbol ? `${set.symbol.replace('/univ/', '/en/')}.png` : undefined,
    logo: set.logo ? `${set.logo}.png` : undefined
  }
})

const cardmarketProductUrl = (idProduct) => `https://www.cardmarket.com/en/Pokemon/Products?idProduct=${idProduct}&language=1`

const toCardmarket = (cardmarket) =>
  cardmarket
    ? {
        url: cardmarket.idProduct != undefined ? cardmarketProductUrl(cardmarket.idProduct) : undefined,
        updatedAt: cardmarket.updated,
        prices: {
          averageSellPrice: price(cardmarket.avg),
          lowPrice: price(cardmarket.low),
          trendPrice: price(cardmarket.trend),
          avg1: price(cardmarket.avg1),
          avg7: price(cardmarket.avg7),
          avg30: price(cardmarket.avg30),
          reverseHoloSell: price(cardmarket['avg-holo']),
          reverseHoloLow: price(cardmarket['low-holo']),
          reverseHoloTrend: price(cardmarket['trend-holo']),
          reverseHoloAvg1: price(cardmarket['avg1-holo']),
          reverseHoloAvg7: price(cardmarket['avg7-holo']),
          reverseHoloAvg30: price(cardmarket['avg30-holo'])
        }
      }
    : undefined

const toTcgplayer = (tcgplayer) => {
  if (!tcgplayer) {
    return undefined
  }
  const { unit, updated, ...variants } = tcgplayer
  const entries = Object.entries(variants).filter(([, variant]) => variant && typeof variant == 'object')
  const productId = entries.map(([, variant]) => variant.productId).find((id) => id != undefined)
  return {
    url: productId != undefined ? `https://www.tcgplayer.com/product/${productId}` : undefined,
    updatedAt: updated,
    prices: Object.fromEntries(
      entries.map(([key, variant]) => [
        camelCase(key),
        {
          low: price(variant.lowPrice),
          mid: price(variant.midPrice),
          high: price(variant.highPrice),
          market: price(variant.marketPrice),
          directLow: price(variant.directLowPrice)
        }
      ])
    )
  }
}

export const foilsOf = (card) => [
  ...new Set((card.variants_detailed ?? []).map((variant) => variant.foil).filter((foil) => foil != undefined))
]

const titleCase = (value) =>
  value
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const printLabel = (variant) => {
  const parts = [
    variant.foil
      ? `${titleCase(variant.foil)} Holo`
      : variant.type == 'reverse'
        ? 'Reverse Holo'
        : variant.type == 'holo'
          ? 'Holo'
          : 'Normal'
  ]
  if (variant.subtype != undefined && variant.subtype != 'unlimited') {
    parts.push(titleCase(variant.subtype))
  }
  if (variant.size != undefined && variant.size != 'standard') {
    parts.push(titleCase(variant.size))
  }
  parts.push(...(variant.stamp ?? []).map(titleCase))
  return parts.join(' · ')
}

const tcgPlayerVariantOfType = { normal: 'normal', holo: 'holofoil', reverse: 'reverseHolofoil' }

const marketPriceFor = (prices, type) => {
  const preferred = prices?.[tcgPlayerVariantOfType[type]]?.market
  return preferred ?? Object.values(prices ?? {}).map((priceSet) => priceSet.market)[0]
}

export const printsOf = (card) => {
  const printsByLabel = new Map()
  for (const variant of card.variants_detailed ?? []) {
    const label = printLabel(variant)
    const print = printsByLabel.get(label) ?? { label }
    const cardmarket = variant.pricing?.cardmarket
    const trendPrice = price(variant.type == 'reverse' ? cardmarket?.['trend-holo'] : cardmarket?.trend)
    if (cardmarket?.idProduct != undefined && print.cardmarket == undefined) {
      print.cardmarket = { url: cardmarketProductUrl(cardmarket.idProduct), trendPrice }
    } else if (trendPrice != undefined && print.cardmarket != undefined) {
      print.cardmarket.lowestTrendPrice = Math.min(
        print.cardmarket.lowestTrendPrice ?? print.cardmarket.trendPrice ?? trendPrice,
        trendPrice
      )
      print.cardmarket.highestTrendPrice = Math.max(
        print.cardmarket.highestTrendPrice ?? print.cardmarket.trendPrice ?? trendPrice,
        trendPrice
      )
    }
    const tcgplayer = toTcgplayer(variant.pricing?.tcgplayer)
    if (tcgplayer?.url != undefined && print.tcgplayer == undefined) {
      print.tcgplayer = { url: tcgplayer.url, marketPrice: marketPriceFor(tcgplayer.prices, variant.type) }
    }
    printsByLabel.set(label, print)
  }
  const prints = [...printsByLabel.values()]
  return prints.length > 1 ? prints : undefined
}

export const toCard = (card, set, germanNames) => ({
  id: card.id,
  name: card.name,
  germanName: germanNames.get(card.id),
  supertype: card.category,
  hp: card.hp?.toString(),
  types: card.types,
  evolvesFrom: card.evolveFrom,
  set,
  number: card.localId,
  artist: card.illustrator,
  rarity: card.rarity,
  flavorText: card.description,
  nationalPokedexNumbers: card.dexId,
  variants: card.variants,
  foils: foilsOf(card),
  prints: printsOf(card),
  images: card.image ? { small: `${card.image}/low.webp`, large: `${card.image}/high.webp` } : {},
  tcgplayer: toTcgplayer(card.pricing?.tcgplayer),
  cardmarket: toCardmarket(card.pricing?.cardmarket)
})

const cardNumberCollator = new Intl.Collator('en', { numeric: true })

const cardmarketSearchUrl = (card, set) => {
  const searchString = [card.name, set.ptcgoCode, card.number].filter((part) => part != undefined).join(' ')
  return `https://www.cardmarket.com/en/Pokemon/Products/Search?searchString=${encodeURIComponent(searchString)}`
}

export const withoutSharedCardmarketProducts = (cards, set) => {
  const cardsOfProduct = groupBy(cards, (card) => (card.cardmarket?.url == undefined ? [] : [card.cardmarket.url]))
  cardsOfProduct.forEach((sharing) => {
    if (sharing.length < 2) {
      return
    }
    const [, ...others] = [...sharing].sort((a, b) => cardNumberCollator.compare(a.number, b.number))
    others.forEach((card) => {
      card.cardmarket = { url: cardmarketSearchUrl(card, set) }
    })
  })
  return cards
}

export const byTrendPriceDescending = (a, b) => (b.cardmarket?.prices?.trendPrice ?? -1) - (a.cardmarket?.prices?.trendPrice ?? -1)

export const cardImageBaseOf = (cards) =>
  cards.find((card) => card.images.small != undefined)?.images.small.replace(/\/[^/]+\/low\.webp$/, '')
