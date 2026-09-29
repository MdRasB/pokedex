# Pokemon Explorer

A lightweight Pokédex built with plain HTML, CSS and JavaScript. Search any Pokémon by name or number and browse its info, moves, base stats and sprites, all pulled live from [PokéAPI](https://pokeapi.co/).

No frameworks, no build step, no dependencies, no API key.

---

## Features

| Area | What it does |
| --- | --- |
| **Search** | Look up a Pokémon by name or National Dex number. Input is trimmed and lowercased automatically. |
| **Quick search** | One-click chips: Pikachu, Arceus, Greninja, Charizard, Moltres. |
| **Basic Info** | Height, weight, generation, base experience, types and the shiny artwork. |
| **Moves** | Two-column compact list, 10 moves per load. Shows type, category, power, accuracy, PP, how it is learned and the effect text. |
| **Stats** | Six base stats as soft-colored bars (scale 0–255) plus the total. |
| **Sprites** | Switch gender, default/shiny variant and image source (Standard, Official Artwork, Official Shiny, Dream World). Unavailable combinations are disabled automatically. |
| **Type colors** | Every type badge and every move type uses its own color (water is blue, grass is green, and so on). |
| **Responsive** | Works from desktop down to small phones. |

On first load the app searches for **Pikachu** by default.

---

## Project structure

```
pokemon-explorer/
├── index.html    # Markup: search, status area, Pokémon card, four tabs
├── style.css     # All styling, including the type colors and stat bar palette
├── script.js     # All behavior: API calls, rendering, tabs, sprites
├── favicon.svg   # Browser tab icon (Pokéball)
└── README.md
```

---

## Quick start

### Requirements

- A modern browser (recent Chrome, Edge, Firefox or Safari)
- An internet connection (data and images come from PokéAPI)
- Optional: Python 3 or Node.js if you want a local server

### Run it

**Option 1: open the file**

Double-click `index.html`. This works because PokéAPI allows cross-origin requests.

**Option 2: local server (recommended)**

```bash
# Python 3
python3 -m http.server 8000

# or Node.js
npx serve .
```

Then open <http://localhost:8000>.

---

## Usage

1. Type a name (`pikachu`) or number (`25`) and press **Search**, or click a quick-search chip.
2. Use the tabs under the Pokémon header:
   - **Basic Info**: overview, types, shiny artwork.
   - **Moves**: click **Load More Moves** to load the next 10. The button hides itself when every move has been loaded.
   - **Stats**: base stat bars and total.
   - **Sprites**: pick Gender, Variant and Image Source. Options that don't exist for that Pokémon are greyed out.
3. Alternate forms need the exact API name, for example `mr-mime`, `charizard-mega-x` or `deoxys-attack`.

---

## How it works

### Data flow

```
Search ─► GET /pokemon/{name}  ─► header, basic info, stats, sprites
              │
              ├─► GET species URL        ─► generation (optional)
              │
              └─► GET each move URL (10 at a time) ─► type, power, accuracy, PP, effect
```

### API endpoints used

| Endpoint | Purpose | If it fails |
| --- | --- | --- |
| `https://pokeapi.co/api/v2/pokemon/{name or id}` | Core Pokémon data | Error message is shown and the card is hidden |
| Species URL from the Pokémon response | Generation | Generation shows "Unknown"; everything else still works |
| Move URL for each move | Move details | That move shows "Unknown Type" and "—" values |

Moves are loaded lazily, 10 per click, so Pokémon with 100+ moves don't fire 100+ requests at once.

### Code map (`script.js`)

| Section | Responsibility |
| --- | --- |
| DOM elements and app state | Element references, `currentPokemon`, `currentSpecies`, `moveIndex`, `spriteState` |
| `formatName` | Turns `special-attack` into `Special Attack` |
| Status helpers | `showStatus`, `showLoading`, `showError`, `hideStatus` |
| Tabs | `showTab` toggles the active tab and panel |
| `renderTypes` | Builds type badges with `data-type="<type>"` |
| Header and basic info | `renderPokemonHeader`, `renderBasicInfo` |
| Moves | `fetchMove`, `renderMove`, `loadMoreMoves`, `renderMoves` |
| Stats | `renderStats` |
| Sprites | Sprite helpers, availability checks, `renderSprites` |
| Fetch and search | `fetchPokemon`, `fetchSpecies`, `searchPokemon`, form and chip listeners |

A `moveLoadToken` counter discards move results that arrive after a newer search has started, so old results never appear under the wrong Pokémon.

### How styling connects to the script

- `script.js` sets `data-type="<type>"` on type badges (`.type-badge`) and move types (`.move-type`).
- `style.css` maps each `data-type` to two CSS variables, `--type-bg` and `--type-fg`.
- Types without a matching rule fall back to the default colors.

---

## Configuration and customization

| I want to… | Change this |
| --- | --- |
| Change the default Pokémon on load | Last line of `script.js`: `searchPokemon("pikachu");` |
| Change the quick-search chips | `data-name` and label of each `.chip-btn` in `index.html` |
| Change how many moves load per click | `movesPerPage` in `script.js` (keep it an even number so the two columns stay balanced) |
| Change a type color | The `TYPE COLORS` block in `style.css` (`--type-bg`, `--type-fg`) |
| Add a new type | Add one line to the `TYPE COLORS` block using the same pattern |
| Change stat bar colors | `.stat-row:nth-child(n) { --bar: … }` in `style.css` |
| Use one color for all stat bars | Delete the six `nth-child` lines and edit `--bar` in `.stat-row` |
| Change page width | `.page { width: min(100%, 700px); }` in `style.css` |
| Change the move layout breakpoint | `@media (max-width: 560px)` in `style.css` (below this the moves use one column) |
| Change the tab icon | Replace `favicon.svg`, or edit the `<link rel="icon">` line in `index.html` |

---

## Deployment

The project is fully static, so any static host works.

**GitHub Pages**

1. Push the files to a repository (the four project files must be in the repo root).
2. Go to **Settings → Pages**.
3. Set **Source** to *Deploy from a branch*, choose `main` and `/ (root)`, then save.
4. Your site will be available at `https://<your-username>.github.io/<repo-name>/`.

**Netlify, Vercel or Cloudflare Pages**

Connect the repository (or drag the folder into Netlify). Leave the build command empty and set the publish/output directory to the project root.

---

## Testing checklist

Run through this after any change:

- [ ] Page loads and shows Pikachu by default
- [ ] Search by name (`charizard`) and by number (`6`) both work
- [ ] Nonsense input (`zzzz`) shows the error message and hides the card
- [ ] Empty search shows "Please enter a Pokemon name or number."
- [ ] Each quick-search chip works
- [ ] Type badges and move types show the correct colors (try a dual type such as `charizard`)
- [ ] All four tabs open and only one panel is visible at a time
- [ ] Moves show in two columns, 5 rows per load; **Load More Moves** adds 10 more and hides at the end
- [ ] Stat bars render with six different colors and the total is correct
- [ ] Sprites: gender, variant and source buttons change the image; unavailable options are disabled
- [ ] Below 560px wide the moves become a single column and nothing overflows
- [ ] Favicon appears in the browser tab

---

## Troubleshooting

| Symptom | Likely cause and fix |
| --- | --- |
| "Pokemon not found" | Check spelling, or search by number. Alternate forms need the exact API name with hyphens. |
| Nothing loads or it stays on "Loading Pokemon data…" | No internet or PokéAPI is down. Open browser DevTools → Network and check the failing request. |
| Moves show "Unknown Type" or "—" | A move request failed (network hiccup or temporary rate limiting). Search the Pokémon again. |
| Colors look unchanged after an update | Browser cache. Hard refresh (`Ctrl+Shift+R` / `Cmd+Shift+R`) and make sure `style.css` was replaced. |
| Favicon doesn't show | `favicon.svg` must sit next to `index.html`. Browsers cache favicons aggressively, so hard refresh or reopen the tab. |
| A sprite option is greyed out | That gender, variant or source doesn't exist for this Pokémon in the API. This is expected. |
| Sprite area says "This image variation is not available." | The chosen combination has no image. Pick a different source or variant. |
| Layout looks broken on file open | Make sure `style.css` and `script.js` are in the same folder as `index.html`. |

---

## Known limitations

- Search is exact match only (no partial matching or autocomplete).
- Effect text is English only.
- The "Learn" line combines information across all game versions and shows the lowest level found.
- Generation labels are shown as formatted API values (for example "Generation Iv").
- Stat bar colors follow the order the API returns stats in (HP, Attack, Defense, Sp. Atk, Sp. Def, Speed).

---

## Credits

- Data and images: [PokéAPI](https://pokeapi.co/). It is free to use, so please keep request volume reasonable.
- Pokémon and Pokémon character names are trademarks of Nintendo, Game Freak and Creatures Inc. This is an unofficial educational project.
