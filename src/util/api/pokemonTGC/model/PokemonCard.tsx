export interface PokemonCardProp {
  card: PokemonCard
}

export interface TcgPlayerPriceSet {
  low?: number
  mid?: number
  high?: number
  market?: number
  directLow?: number
}

export interface TcgPlayer {
  url?: string
  updatedAt?: string
  prices?: {
    normal?: TcgPlayerPriceSet
    holofoil?: TcgPlayerPriceSet
    reverseHolofoil?: TcgPlayerPriceSet
    '1stEdition'?: TcgPlayerPriceSet
    '1stEditionHolofoil'?: TcgPlayerPriceSet
    unlimited?: TcgPlayerPriceSet
    unlimitedHolofoil?: TcgPlayerPriceSet
  }
}

export interface CardMarketPriceSet {
  averageSellPrice?: number
  lowPrice?: number
  trendPrice?: number
  germanProLow?: number
  suggestedPrice?: number
  reverseHoloSell?: number
  reverseHoloLow?: number
  reverseHoloTrend?: number
  lowPriceExPlus?: number
  avg1?: number
  avg7?: number
  avg30?: number
  reverseHoloAvg1?: number
  reverseHoloAvg7?: number
  reverseHoloAvg30?: number
}

export interface CardMarket {
  url?: string
  updatedAt?: string
  prices?: CardMarketPriceSet
}

export interface PokemonCardSet {
  id: string
  name: string
  series: string
  printedTotal: number
  total: number
  legalities?: {
    unlimited?: string
  }
  ptcgoCode?: string
  releaseDate: string
  updatedAt?: string
  images: {
    symbol: string
    logo: string
  }
}

export interface PokemonCard {
  id: string
  name: string
  supertype?: string
  subtypes?: string[]
  level?: string
  hp?: string
  types?: string[]
  evolvesFrom?: string
  evolvesTo?: string[]
  retreatCost?: string[]
  convertedRetreatCost?: number
  set: PokemonCardSet
  number: string
  artist?: string
  rarity?: string
  flavorText?: string
  nationalPokedexNumbers?: number[]
  legalities?: {
    unlimited?: string
  }
  images: {
    small?: string
    large?: string
  }
  tcgplayer?: TcgPlayer
  cardmarket?: CardMarket
}
