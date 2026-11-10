export type AuthError = 'offline' | 'popupBlocked' | 'signInFailed' | 'loadFailed' | 'signOutFailed'

export type FavoritesError = 'loadFailed' | 'mergeFailed' | 'saveFailed'

export type ReleaseAge = 'under6Months' | 'sixTo12Months' | 'oneTo2Years' | 'twoTo5Years' | 'fiveTo10Years' | 'tenYearsAndOlder'

export type SortModeLabel = 'price' | 'number' | 'name' | 'rarity' | 'release' | 'urgency'

export type UrgencyLabel = 'urgent' | 'normal' | 'later'

const en = {
  locale: 'en-US',

  loading: 'Loading',
  close: 'Close',
  closeZoom: 'Close zoom',
  zoomInto: (name: string) => `Zoom into ${name}`,
  storedOffline: 'Stored offline',
  copied: 'Copied',
  unknown: 'Unknown',
  range: (from: string, to: string) => `${from} to ${to}`,

  cardCount: (count: number) => (count == 1 ? '1 card' : `${count} cards`),
  setCount: (count: number) => (count == 1 ? '1 set' : `${count} sets`),
  artistCount: (count: number) => (count == 1 ? '1 artist' : `${count} artists`),
  pokemonCount: (count: number) => `${count} Pokémon`,
  favoriteNoun: (count: number): string => (count == 1 ? 'favorite' : 'favorites'),

  errorHeadline: 'Well, that didn’t work.',
  unknownError: 'Unknown error',
  returnToBase: 'Return to base',

  sort: 'Sort',
  sortModes: {
    price: 'Price',
    number: 'Card number',
    name: 'Name',
    rarity: 'Rarity',
    release: 'Release date',
    urgency: 'Priority'
  } as Record<SortModeLabel, string>,
  sortOrders: {
    price: ['Most expensive first', 'Cheapest first'],
    number: ['Lowest number first', 'Highest number first'],
    name: ['A to Z', 'Z to A'],
    rarity: ['Rarest first', 'Most common first'],
    release: ['Newest first', 'Oldest first'],
    urgency: ['Most urgent first', 'Least urgent first']
  } as Record<SortModeLabel, [string, string]>,
  sortDirectionLabel: (current: string, next: string) => `${current}, switch to “${next}”`,

  releaseAges: {
    under6Months: 'Under 6 months',
    sixTo12Months: '6 to 12 months',
    oneTo2Years: '1 to 2 years',
    twoTo5Years: '2 to 5 years',
    fiveTo10Years: '5 to 10 years',
    tenYearsAndOlder: '10 years and older'
  } as Record<ReleaseAge, string>,

  allCardsOf: (count: number, name: string) => `All ${count} ${name} cards`,
  pricedOf: (priced: number, total: number) => `${priced} of ${total} cards priced`,
  germanListings: 'German listings on Cardmarket',

  favorites: 'Favorites',
  addToFavorites: (print?: string) => (print == undefined ? 'Add to favorites' : `Add ${print} to favorites`),
  removeFromFavorites: (print?: string) => (print == undefined ? 'Remove from favorites' : `Remove ${print} from favorites`),
  purchaseUrgency: 'Purchase priority',
  urgencies: {
    urgent: 'High',
    normal: 'Medium',
    later: 'Low'
  } as Record<UrgencyLabel, string>,

  closeSearch: 'Close search',
  searchCards: 'Search cards',
  searchPlaceholder: 'Name, type, rarity, holo, #',

  mergeTitle: 'Move your favorites online?',
  mergeBody: (count: number, noun: string) =>
    `You have ${count} ${noun} saved on this device. Moving them to your account keeps them on every device you sign in on.`,
  mergeAddsOnly:
    'Favorites already on your account stay as they are. This only adds. The copy on this device stays until the move has gone through.',
  mergeWarning: 'Heads up: this is new and comes without guarantees.',
  notNow: 'Not now',
  mergeConfirm: (count: number, noun: string) => `Move ${count} ${noun}`,

  set: 'Set',
  selectSet: 'Select set',
  era: 'Era',
  selectEra: 'Select era',
  artist: 'Artist',
  selectArtist: 'Select artist',
  filterArtists: 'Filter artists',
  filterSets: 'Filter sets',
  nameOrCode: 'Name or code',
  name: 'Name',
  generation: 'Generation',
  selectGeneration: 'Select generation',
  pokemon: 'Pokémon',
  selectPokemon: 'Select Pokémon',
  filterPokemon: 'Filter Pokémon',
  nameOrNumber: 'Name or #',
  copyLinkToSet: 'Copy link to this set',
  previousSet: 'Previous set',
  nextSet: 'Next set',
  copyLinkToArtist: 'Copy link to this artist',
  copyLinkToPokemon: 'Copy link to this Pokémon',
  copyLinkToCard: 'Copy link to this card',

  loadErrorNotFound: 'No card data is available for this yet. Try again later.',
  loadErrorServer: 'The server is currently unavailable. Try again later.',
  loadErrorNetwork: 'Could not reach the server. Check your connection.',
  loadErrorGeneric: 'Could not load cards. Reload the page to try again.',
  cardsNotLoaded: 'Cards could not be loaded',
  nowPickSet: 'Now pick a set',
  welcomeTrainer: 'Welcome, trainer',
  pickSetHint: 'Choose a set from the menu above to browse its cards and current market prices.',
  pickEraHint: 'Start by choosing an era from the menu above, then pick a set to browse its cards and current market prices.',
  noCardsFound: 'No cards found',
  noCardsInSet: 'There are no cards for this set yet.',
  noMatchingCards: 'No matching cards',
  noMatchingCardsHint: 'Try a different name, type, rarity or card number.',

  suggestions: 'Suggestions',
  cardsInAllSets: (count: number) => `${count == 1 ? '1 card' : `${count} cards`} in all sets`,
  allCardsNamed: (query: string) => `All cards matching “${query}”`,
  acrossEverySet: 'across every set',
  countAcrossEverySet: (count: number) => `${count} across every set`,

  pricesFrom: 'Prices from',
  noPrices: 'No prices available.',
  priceChartingTitle: 'Graded and raw prices on PriceCharting',

  setValue: 'Set value',
  released: 'Released',
  noPrice: 'No price',

  favoritesValue: 'Favorites value',
  noFavorites: 'No favorites yet',
  noFavoritesHint: 'Open a card and tap the star next to its name to keep it here.',
  signInHint: 'Sign in to keep favorites on every device.',
  signInWithGoogle: 'Sign in with Google',
  loadingFavorites: 'Loading favorites',
  synced: 'synced',
  onThisDevice: 'on this device',

  menu: 'Menu',
  menuSignedInAs: (account: string) => `Menu, signed in as ${account}`,
  account: 'account',
  darkTheme: 'Dark mode',
  lightTheme: 'Light mode',
  toggleLanguage: 'German',
  signOut: 'Sign out',
  signingIn: 'Signing in',

  searchEveryCard: 'Search every card',
  searchHint: 'Type a card name into the search box, then pick “all cards” from the suggestions.',
  noCardsNamed: (query: string) => `No cards matching “${query}”`,
  noCardsNamedHint: 'Try a shorter name, or the English name.',
  allCards: 'All cards',
  searching: 'Searching',
  countFor: (count: string, query: string) => `${count} for “${query}”`,

  authErrors: {
    offline: 'No connection. Try again later.',
    popupBlocked: 'The sign-in popup was blocked. Allow popups for this site.',
    signInFailed: 'Sign-in failed. Try again.',
    loadFailed: 'Could not load sign-in. Try again later.',
    signOutFailed: 'Sign-out failed. Try again.'
  } as Record<AuthError, string>,

  favoritesErrors: {
    loadFailed: 'Could not load favorites.',
    mergeFailed: 'Could not move favorites online. They are still saved on this device.',
    saveFailed: 'Could not save favorite.'
  } as Record<FavoritesError, string>,

  sets: 'Sets',
  artists: 'Artists',
  search: 'Search',
  switchMode: 'Switch view',

  noMatchingArtists: 'No matching artists',
  tryDifferentName: 'Try a different name.',
  allArtists: 'All artists',

  welcomePokedex: 'Welcome to the Pokédex',
  pokedexHint: 'Choose a generation from the menu above, then pick a Pokémon to see all of its cards.',
  noMatchingPokemon: 'No matching Pokémon',
  noMatchingPokemonHint: 'Try a different name or Pokédex number.',

  previousCard: 'Previous card',
  nextCard: 'Next card',
  evolvesFrom: (name: string) => `Evolves from ${name}`,
  evolutionChain: 'Evolution chain',
  cards: 'Cards',
  series: 'Series',
  legality: 'Legality'
}

export type Strings = typeof en

const de: Strings = {
  locale: 'de-DE',

  loading: 'Lädt',
  close: 'Schließen',
  closeZoom: 'Zoom schließen',
  zoomInto: (name: string) => `${name} vergrößern`,
  storedOffline: 'Offline gespeichert',
  copied: 'Kopiert',
  unknown: 'Unbekannt',
  range: (from: string, to: string) => `${from} bis ${to}`,

  cardCount: (count: number) => (count == 1 ? '1 Karte' : `${count} Karten`),
  setCount: (count: number) => (count == 1 ? '1 Set' : `${count} Sets`),
  artistCount: (count: number) => `${count} Künstler`,
  pokemonCount: (count: number) => `${count} Pokémon`,
  favoriteNoun: (count: number) => (count == 1 ? 'Favorit' : 'Favoriten'),

  errorHeadline: 'Tja, das hat nicht geklappt.',
  unknownError: 'Unbekannter Fehler',
  returnToBase: 'Zurück zur Basis',

  sort: 'Sortieren',
  sortModes: {
    price: 'Preis',
    number: 'Kartennummer',
    name: 'Name',
    rarity: 'Seltenheit',
    release: 'Erscheinungsdatum',
    urgency: 'Priorität'
  },
  sortOrders: {
    price: ['Teuerste zuerst', 'Günstigste zuerst'],
    number: ['Niedrigste Nummer zuerst', 'Höchste Nummer zuerst'],
    name: ['A bis Z', 'Z bis A'],
    rarity: ['Seltenste zuerst', 'Häufigste zuerst'],
    release: ['Neueste zuerst', 'Älteste zuerst'],
    urgency: ['Dringendste zuerst', 'Unwichtigste zuerst']
  },
  sortDirectionLabel: (current: string, next: string) => `${current}, zu „${next}“ wechseln`,

  releaseAges: {
    under6Months: 'Unter 6 Monaten',
    sixTo12Months: '6 bis 12 Monate',
    oneTo2Years: '1 bis 2 Jahre',
    twoTo5Years: '2 bis 5 Jahre',
    fiveTo10Years: '5 bis 10 Jahre',
    tenYearsAndOlder: '10 Jahre und älter'
  },

  allCardsOf: (count: number, name: string) => `Alle ${count} ${name}-Karten`,
  pricedOf: (priced: number, total: number) => `${priced} von ${total} Karten mit Preis`,
  germanListings: 'Deutsche Angebote auf Cardmarket',

  favorites: 'Favoriten',
  addToFavorites: (print?: string) => (print == undefined ? 'Zu Favoriten hinzufügen' : `${print} zu Favoriten hinzufügen`),
  removeFromFavorites: (print?: string) => (print == undefined ? 'Aus Favoriten entfernen' : `${print} aus Favoriten entfernen`),
  purchaseUrgency: 'Kaufpriorität',
  urgencies: {
    urgent: 'Hoch',
    normal: 'Mittel',
    later: 'Niedrig'
  },

  closeSearch: 'Suche schließen',
  searchCards: 'Karten suchen',
  searchPlaceholder: 'Name, Typ, Seltenheit, Holo, #',

  mergeTitle: 'Favoriten online speichern?',
  mergeBody: (count: number, noun: string) =>
    `Du hast ${count} ${noun} auf diesem Gerät gespeichert. In deinem Konto hast du sie auf jedem Gerät, auf dem du angemeldet bist.`,
  mergeAddsOnly:
    'Favoriten, die schon in deinem Konto sind, bleiben unverändert. Es wird nur ergänzt. Die Kopie auf diesem Gerät bleibt, bis das Verschieben abgeschlossen ist.',
  mergeWarning: 'Hinweis: Das ist neu und ohne Gewähr.',
  notNow: 'Nicht jetzt',
  mergeConfirm: (count: number, noun: string) => `${count} ${noun} verschieben`,

  set: 'Set',
  selectSet: 'Set wählen',
  era: 'Ära',
  selectEra: 'Ära wählen',
  artist: 'Künstler',
  selectArtist: 'Künstler wählen',
  filterArtists: 'Künstler filtern',
  filterSets: 'Sets filtern',
  nameOrCode: 'Name oder Kürzel',
  name: 'Name',
  generation: 'Generation',
  selectGeneration: 'Generation wählen',
  pokemon: 'Pokémon',
  selectPokemon: 'Pokémon wählen',
  filterPokemon: 'Pokémon filtern',
  nameOrNumber: 'Name oder #',
  copyLinkToSet: 'Link zu diesem Set kopieren',
  previousSet: 'Vorheriges Set',
  nextSet: 'Nächstes Set',
  copyLinkToArtist: 'Link zu diesem Künstler kopieren',
  copyLinkToPokemon: 'Link zu diesem Pokémon kopieren',
  copyLinkToCard: 'Link zu dieser Karte kopieren',

  loadErrorNotFound: 'Dafür gibt es noch keine Kartendaten. Versuch es später noch einmal.',
  loadErrorServer: 'Der Server ist gerade nicht erreichbar. Versuch es später noch einmal.',
  loadErrorNetwork: 'Der Server ist nicht erreichbar. Prüf deine Verbindung.',
  loadErrorGeneric: 'Die Karten konnten nicht geladen werden. Lade die Seite neu, um es noch einmal zu versuchen.',
  cardsNotLoaded: 'Karten konnten nicht geladen werden',
  nowPickSet: 'Jetzt ein Set wählen',
  welcomeTrainer: 'Willkommen, Trainer',
  pickSetHint: 'Wähle oben im Menü ein Set, um seine Karten und aktuellen Marktpreise zu sehen.',
  pickEraHint: 'Wähle zuerst oben im Menü eine Ära und dann ein Set, um seine Karten und aktuellen Marktpreise zu sehen.',
  noCardsFound: 'Keine Karten gefunden',
  noCardsInSet: 'Für dieses Set gibt es noch keine Karten.',
  noMatchingCards: 'Keine passenden Karten',
  noMatchingCardsHint: 'Versuch einen anderen Namen, Typ, eine andere Seltenheit oder Kartennummer.',

  suggestions: 'Vorschläge',
  cardsInAllSets: (count: number) => `${count == 1 ? '1 Karte' : `${count} Karten`} in allen Sets`,
  allCardsNamed: (query: string) => `Alle Karten zu „${query}“`,
  acrossEverySet: 'in allen Sets',
  countAcrossEverySet: (count: number) => `${count} in allen Sets`,

  pricesFrom: 'Preisstand',
  noPrices: 'Keine Preise verfügbar.',
  priceChartingTitle: 'Preise gegradeter und ungegradeter Karten auf PriceCharting',

  setValue: 'Set-Wert',
  released: 'Erschienen',
  noPrice: 'Kein Preis',

  favoritesValue: 'Wert der Favoriten',
  noFavorites: 'Noch keine Favoriten',
  noFavoritesHint: 'Öffne eine Karte und tippe auf den Stern neben ihrem Namen, um sie hier zu sammeln.',
  signInHint: 'Melde dich an, um deine Favoriten auf jedem Gerät zu haben.',
  signInWithGoogle: 'Mit Google anmelden',
  loadingFavorites: 'Favoriten werden geladen',
  synced: 'synchronisiert',
  onThisDevice: 'auf diesem Gerät',

  menu: 'Menü',
  menuSignedInAs: (account: string) => `Menü, angemeldet als ${account}`,
  account: 'Konto',
  darkTheme: 'Dunkler Modus',
  lightTheme: 'Heller Modus',
  toggleLanguage: 'Englisch',
  signOut: 'Abmelden',
  signingIn: 'Anmeldung läuft',

  searchEveryCard: 'Alle Karten durchsuchen',
  searchHint: 'Gib einen Kartennamen ins Suchfeld ein und wähle dann „Alle Karten“ in den Vorschlägen.',
  noCardsNamed: (query: string) => `Keine Karten zu „${query}“`,
  noCardsNamedHint: 'Versuch einen kürzeren oder den englischen Namen.',
  allCards: 'Alle Karten',
  searching: 'Suche läuft',
  countFor: (count: string, query: string) => `${count} für „${query}“`,

  authErrors: {
    offline: 'Keine Verbindung. Versuch es später noch einmal.',
    popupBlocked: 'Das Anmeldefenster wurde blockiert. Erlaube Pop-ups für diese Seite.',
    signInFailed: 'Anmeldung fehlgeschlagen. Versuch es noch einmal.',
    loadFailed: 'Die Anmeldung konnte nicht geladen werden. Versuch es später noch einmal.',
    signOutFailed: 'Abmelden fehlgeschlagen. Versuch es noch einmal.'
  },

  favoritesErrors: {
    loadFailed: 'Favoriten konnten nicht geladen werden.',
    mergeFailed: 'Favoriten konnten nicht online gespeichert werden. Sie sind weiterhin auf diesem Gerät gespeichert.',
    saveFailed: 'Favorit konnte nicht gespeichert werden.'
  },

  sets: 'Sets',
  artists: 'Künstler',
  search: 'Suche',
  switchMode: 'Ansicht wechseln',

  noMatchingArtists: 'Keine passenden Künstler',
  tryDifferentName: 'Versuch einen anderen Namen.',
  allArtists: 'Alle Künstler',

  welcomePokedex: 'Willkommen im Pokédex',
  pokedexHint: 'Wähle oben im Menü eine Generation und dann ein Pokémon, um alle seine Karten zu sehen.',
  noMatchingPokemon: 'Keine passenden Pokémon',
  noMatchingPokemonHint: 'Versuch einen anderen Namen oder eine andere Pokédex-Nummer.',

  previousCard: 'Vorherige Karte',
  nextCard: 'Nächste Karte',
  evolvesFrom: (name: string) => `Entwickelt sich aus ${name}`,
  evolutionChain: 'Entwicklungsreihe',
  cards: 'Karten',
  series: 'Serie',
  legality: 'Legalität'
}

export const stringsOf = (germanNames: boolean): Strings => (germanNames ? de : en)
