# External Integrations

## Integration Inventory

| System | Type | Purpose | Auth | Criticality | Evidence |
|---|---|---|---|---|---|
| PokéAPI | HTTP API | Pokémon, species, and move data; supplies artwork/sprite URLs | No API key in code | High for live data | `script.js` |

## Data Stores and Credentials

- Database/cache: none found.
- Credentials: no environment variables or secrets are read by the app (`script.js`; scan output).
- Credential rotation: not applicable to current code.

## Reliability and Failure Behavior

- PokéAPI errors for the main Pokémon request display an error message. Species lookup failure is tolerated and generation becomes unknown. Move detail failures return `null` and the UI renders fallback values (`script.js`).
- Retries, backoff, timeouts, and circuit breakers: none found.
- Data is requested directly from the browser; no proxy or backend is present (`script.js`, `README.md`).

## Observability

- No integration logging, metrics, or tracing found.
- `[TODO]` decide whether user-facing API failures need retry guidance or diagnostics.

## Evidence

- `script.js`
- `style.css`
- `README.md`
- Repository tracked-file listing (terminal output)
