# Architecture

## Architectural Style

- Style: static, browser-only application organized by file responsibility.
- Evidence: the HTML loads one stylesheet and one non-module JavaScript file; no server or framework manifest is present (`index.html`, scan output).
- Constraints: the browser owns UI state; the external PokéAPI is the data source; the HTML IDs/classes are an implicit contract with `script.js`.

## System Flow

```text
index.html -> script.js event handlers -> PokéAPI -> render functions -> DOM
```

1. `index.html` creates the search form, status states, Pokémon card, tabs, and sprite controls.
2. `script.js` binds submit and quick-search events and requests `https://pokeapi.co/api/v2/pokemon/{name-or-id}`.
3. The returned Pokémon record supplies a species URL; `fetchSpecies` requests that record, with species failure tolerated.
4. `renderPokemon` updates the header, basic information, stats, moves, and sprite controls.
5. Move details are requested in groups of ten; tab and sprite buttons update visible DOM state.

Evidence: `index.html`, `script.js` (`searchPokemon`, `fetchPokemon`, `fetchSpecies`, `renderPokemon`, `loadMoreMoves`, `showTab`).

## Responsibilities and Patterns

| Area | Owns | Evidence |
|---|---|---|
| DOM composition | Accessible controls, content regions, and stable IDs | `index.html` |
| Rendering and state | Current Pokémon/species, move paging, sprite selections, status | `script.js` |
| External data adapter | Direct `fetch` calls to PokéAPI and move URLs | `script.js` |
| Styling | Type-dependent specimen tint, tab panels, breakpoints, reduced motion | `style.css` |

Repeated patterns include DOM-based rendering via `createElement` and `textContent`, and event listeners attached to form/buttons (`script.js`). There is no dependency-injection or persistence layer.

## Known Architectural Risks

- Markup IDs and JavaScript selectors form an untyped contract; renaming a target can break rendering (`index.html`, `script.js`).
- Concurrent searches are not sequenced or aborted, so an earlier slow response can render after a later search (`script.js`, `searchPokemon`).
- The app depends on PokéAPI availability and has no cache, retry, or explicit timeout (`script.js`).

## Evidence

- `index.html`
- `script.js`
- `style.css`
- Repository tracked-file listing (terminal output)
