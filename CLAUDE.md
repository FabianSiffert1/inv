# Working on inv

Rules and knowledge for agents working in this repository. The README explains the product; this
file explains how to change it without breaking it. Personal rules in `~/.claude/CLAUDE.md` still
apply and win on conflict.

## Verifying changes

- Verification is `npm run typecheck`, `npm run lint`, and for touched stylesheets
  `npx sass --load-path=src/util/ui --no-source-map <file> > /dev/null`. Never pass two files to
  the sass CLI: the second argument is an output path and overwrites it.
- Do not run `npm run build` or start a dev server. One usually runs on `:3030`; check that a module
  transforms with `curl -s -o /dev/null -w '%{http_code}' http://localhost:3030/src/<path>` and that
  data is served under `http://localhost:3030/data/<path>`.
- Prettier runs through lint-staged on commit. Before reporting done, run
  `npx prettier --write <files> --config ./.prettierrc` on touched files.
- `tsconfig.node.json` covers `vite.config.ts`; `npm run typecheck` runs both projects.

## Data

- `data/` is gitignored and comes from `npm run fetch-data`, which takes a long time. The local
  snapshot may be weeks old; compare `generatedAt` in `data/sets.json` with the live site before
  reasoning about prices.
- Indexes (`pokemon.json`, `artists.json`, `search.json`, per-entry card files) can be rebuilt
  locally without network from the card files; fields that come from TCGdex per card (variants,
  foils, prints) only exist after a real fetch or a per-set live patch.
- Every card is stored three times: under its set, its Pokémon and its artist. A change to the card
  shape must be applied to all three, which `fetch-data` does.
- When the shape of `sets.json` or the card files changes: bump `buster` in `src/main.tsx`, update
  the model in `src/util/api/pokemonTGC/model/`, and extend the Snapshot section of the README.
- Firestore rules live in `firestore.rules` and are deployed by hand:
  `npx firebase-tools deploy --only firestore:rules`. Favorites are keyed by card id, or `cardId#print`
  for one printing.

## Code conventions

- Pages put their header middle slot in place with `setHeaderItem` from `HeaderContext`, and their
  loading state with `setBusy`.
- Card lists take `CardEntry[]` (card plus optional print). Navigation between open cards comes from
  `useCardNavigation`, sorting and search filtering from `useVisibleEntries` / `sortEntries`.
- Prices on tiles, in sorting and in totals go through `cardDisplayPrice` / `printDisplayPrice`,
  which handle the Cardmarket-then-TCGplayer fallback and currencies.
- Styling: chips and buttons are `@include surfaceInteractive($surfaceRadiusSmall)` plus
  `@include pastel(var(--element…), N%)`. Labels use `typoFieldLabel`, values `typoFieldValue`.
  Shared page frame classes are in `src/Pages/Page.module.scss`. Colours are never hard-coded in
  components; use `--element*` variables, which the dark theme remaps in `_colors.scss`.
- Pixel icons are 16×16 rect lists in the style of `ModeIcons.tsx` and `HeaderMenuIcons.tsx`.
- No comments in code unless agreed first.

## Editing pitfalls

- JSX and template literals break `perl -pi -e 's{...}{...}'` and `sed` replacements in surprising
  ways. For anything containing `${`, `{`, or backticks, use the Edit tool after reading the file.
- The sass CLI with two positional arguments writes the first file over the second.
