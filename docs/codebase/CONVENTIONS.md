# Coding Conventions

## Naming Rules

| Item | Rule | Example | Evidence |
|---|---|---|---|
| Files | lowercase descriptive names | `script.js` | tracked file list |
| Functions and variables | camelCase | `renderPokemon`, `moveIndex` | `script.js` |
| DOM classes | kebab-case | `.pokemon-header`, `.search-form` | `index.html`, `style.css` |
| DOM IDs | camelCase | `pokemonInput`, `statsTotal` | `index.html`, `script.js` |
| Constants | camelCase, sometimes uppercase for global endpoint | `movesPerPage`, `PokeAPI` | `script.js` |

## Formatting and Linting

- Formatter: none configured.
- Linter: none configured.
- Existing JavaScript uses semicolons, four-space indentation, and function declarations; CSS uses four-space indentation and component section comments (`script.js`, `style.css`).
- Run commands: none configured; `[TODO]` define formatting/lint commands if the project adopts tooling.

## Modules, Errors, and Logging

- Imports/exports: no module system or alias policy is present.
- Errors: fetch helpers throw for non-OK Pokémon/species responses; search catches errors and updates visible status. Species errors are caught and treated as missing species data (`script.js`).
- Logging: no logging calls or logging policy found.
- Sensitive data: no credentials or environment variables found; no redaction policy is applicable in current code.

## Testing Conventions

- Test naming, mocking, and coverage expectations: `[TODO]` — no test files or test configuration were found.

## Evidence

- `script.js`
- `index.html`
- `style.css`
- Repository tracked-file listing (terminal output)
