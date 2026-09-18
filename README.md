# inv

A Pokémon TCG card browser. Pick an era, pick a set, get the cards with current market prices
from [pokemontcg.io](https://pokemontcg.io).

## About this project

This is an old weekend project. It started as an attempt at a mobile-first website and turned into a
card list somewhere along the way. It is not actively maintained and I do not care for it much — I
had an AI rework it so it is not quite as bad as it was. Expect rough edges.

## Running it

```
npm install
npm run dev
```

Copy `.env-example` to `.env` and put a [Pokémon TCG API](https://dev.pokemontcg.io) key in it:

```
VITE_POKEMON_TCG_API_KEY='your-key'
```

The API also works without a key, at a lower rate limit.

**The key is not a secret.** Vite inlines every `VITE_*` variable into the client bundle at build
time, so anyone using the deployed site can read it. There is no server in this project to hide it
behind. Only use a free key here, and rotate it if it gets abused.

## Scripts

```
npm run dev      # dev server on :3030
npm run build    # production build, served under /inv/
npm run preview  # preview the production build
npm run lint     # eslint
npm run format   # prettier
```

A pre-commit hook runs the formatter and linter.

## How it works

- **React + Vite + TypeScript**, SCSS modules for styling.
- **react-query** fetches sets and cards, and persists them to `localStorage` so a revisit is
  instant. Only the eight most recently viewed sets are persisted, to stay inside the storage quota.
- **Theming** is a `data-theme` attribute on `<html>`. The choice is stored in `localStorage` and
  falls back to the OS preference. An inline script in `index.html` applies it before first paint so
  the page does not flash the wrong theme.
- **Card images** load lazily via the native `loading="lazy"` attribute, with the aspect ratio
  reserved up front so the grid does not shift as they arrive.
- A dot next to a set name means that set is already stored offline.

## Known gaps

- The inventory page is a placeholder and does nothing.
- There is no test suite.
- Prices are whatever the API reports and are not validated.
