import path from 'node:path'
import { byTrendPriceDescending } from './cards.mjs'
import { groupBy, mostCommon } from './collections.mjs'
import { artistsDirectory, dataDirectory, pokemonDirectory, writeJsonAtomically } from './files.mjs'
import { fetchSpeciesNames } from './tcgdex.mjs'

const byReleaseDateDescending = (a, b) => b.set.releaseDate.localeCompare(a.set.releaseDate)

const singlePokedexNumberOf = (card) => (card.nationalPokedexNumbers?.length == 1 ? card.nationalPokedexNumbers[0] : undefined)

const evolutionParents = (allCards) => {
  const singlePokemonCards = allCards.filter((card) => singlePokedexNumberOf(card) != undefined)
  const numbersByName = groupBy(singlePokemonCards, (card) => [card.name.toLowerCase()])
  const numberOfName = new Map([...numbersByName.entries()].map(([name, cards]) => [name, mostCommon(cards.map(singlePokedexNumberOf))]))
  const parentNumbers = groupBy(singlePokemonCards, (card) => {
    const parent = card.evolvesFrom == undefined ? undefined : numberOfName.get(card.evolvesFrom.toLowerCase())
    return parent == undefined || parent == singlePokedexNumberOf(card) ? [] : [singlePokedexNumberOf(card)]
  })
  return new Map(
    [...parentNumbers.entries()].map(([number, cards]) => [
      number,
      mostCommon(cards.map((card) => numberOfName.get(card.evolvesFrom.toLowerCase())))
    ])
  )
}

export const writePokemonData = async (allCards) => {
  const cardsOfPokemon = groupBy(allCards, (card) => card.nationalPokedexNumbers ?? [])
  const parents = evolutionParents(allCards)

  const speciesNames = await fetchSpeciesNames()
  if (speciesNames.size == 0) {
    console.error('Species names unavailable, falling back to card names')
  }

  const pokemon = []
  for (const [number, cards] of [...cardsOfPokemon.entries()].sort((a, b) => a[0] - b[0])) {
    await writeJsonAtomically(path.join(pokemonDirectory, `${number}.json`), cards.sort(byReleaseDateDescending))
    const species = speciesNames.get(number)
    pokemon.push({
      number,
      name: species?.name ?? mostCommon(cards.map((card) => card.name)),
      germanName: species?.germanName ?? mostCommon(cards.map((card) => card.germanName)),
      type: mostCommon(cards.map((card) => card.types?.[0])),
      cardCount: cards.length,
      evolvesFrom: cardsOfPokemon.has(parents.get(number)) ? parents.get(number) : undefined
    })
  }
  await writeJsonAtomically(path.join(dataDirectory, 'pokemon.json'), pokemon)
  console.log(`Pokémon: ${pokemon.length} with cards`)
}

const unknownArtist = 'N/A'

const artistSlug = (name) =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const artistSlugsOf = (card) => {
  const name = card.artist?.trim()
  if (!name || name == unknownArtist) {
    return []
  }
  const slug = artistSlug(name)
  return slug == '' ? [] : [slug]
}

const byCardCountDescendingThenName = (a, b) => b.cardCount - a.cardCount || a.name.localeCompare(b.name)

export const writeArtistData = async (allCards) => {
  const cardsOfArtist = groupBy(allCards, artistSlugsOf)

  const artists = []
  for (const [slug, cards] of cardsOfArtist.entries()) {
    await writeJsonAtomically(path.join(artistsDirectory, `${slug}.json`), cards.sort(byReleaseDateDescending))
    const topCard = [...cards].sort(byTrendPriceDescending)[0]
    artists.push({
      slug,
      name: mostCommon(cards.map((card) => card.artist.trim())),
      cardCount: cards.length,
      setCount: new Set(cards.map((card) => card.set.id)).size,
      pokemonNumber: mostCommon(cards.flatMap((card) => card.nationalPokedexNumbers ?? [])),
      topCardImage: topCard?.images.small,
      topCardType: topCard?.types?.[0]
    })
  }
  artists.sort(byCardCountDescendingThenName)
  await writeJsonAtomically(path.join(dataDirectory, 'artists.json'), artists)
  console.log(`Artists: ${artists.length}`)
}

const searchMarketVariantOrder = [
  'normal',
  'holofoil',
  'reverseHolofoil',
  'unlimited',
  'unlimitedHolofoil',
  '1stEdition',
  '1stEditionHolofoil'
]

const searchMarketPrice = (tcgplayer) => {
  for (const variant of searchMarketVariantOrder) {
    const priceSet = tcgplayer?.prices?.[variant]
    const marketPrice = priceSet?.market ?? priceSet?.mid
    if (marketPrice != undefined) {
      return marketPrice
    }
  }
  return undefined
}

const toSearchEntry = (card) => ({
  id: card.id,
  name: card.name,
  germanName: card.germanName,
  setId: card.set.id,
  number: card.number,
  noImage: card.images.small == undefined ? true : undefined,
  trendPrice: card.cardmarket?.prices?.trendPrice,
  marketPrice: searchMarketPrice(card.tcgplayer),
  rarity: card.rarity,
  type: card.types?.[0]
})

export const writeSearchIndex = async (allCards) => {
  await writeJsonAtomically(path.join(dataDirectory, 'search.json'), allCards.map(toSearchEntry))
  console.log(`Search index: ${allCards.length} cards`)
}

export const writeIndexes = async (allCards) => {
  await writePokemonData(allCards)
  await writeArtistData(allCards)
  await writeSearchIndex(allCards)
}
