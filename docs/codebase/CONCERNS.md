# Codebase Concerns

## Top Risks

| Severity | Concern | Evidence | Impact | Suggested action |
|---|---|---|---|---|
| Medium | Overlapping searches can complete out of order | `script.js`, `searchPokemon` | The card may show a result different from the latest submitted query | Consider request sequencing or aborting stale searches if behavior is later in scope |
| Medium | Live data depends on PokéAPI without retry/timeout | `script.js`, `fetchPokemon`, `fetchSpecies`, `fetchMove` | Network/API issues prevent or partially populate entries | Define desired offline/failure behavior |
| Low | No automated checks are configured | Scan output; no test files in tracked tree | UI changes rely on manual review | Define a lightweight verification process if needed |

## Technical Debt

| Item | Where | Risk | Suggested fix |
|---|---|---|---|
| Single global script combines network, state, and DOM rendering | `script.js` | Cross-cutting edits can accidentally affect unrelated UI behavior | Split only if growth makes the current file difficult to maintain |
| HTML and JavaScript rely on matching string IDs | `index.html`, `script.js` | A markup edit can silently break a lookup | Keep selectors stable or add automated smoke checks |

## Security

| Risk | Evidence | Current mitigation | Gap |
|---|---|---|---|
| Third-party API and artwork requests expose normal client request metadata to providers | `script.js` | No application secrets are sent | Provider/privacy policy is not documented; `[TODO]` assess if required by deployment context |

## Performance and Scaling

| Concern | Evidence | Symptom/risk | Improvement |
|---|---|---|---|
| Move details are fetched in groups of ten | `script.js`, `movesPerPage`, `loadMoreMoves` | Batching limits request fan-out; large catalogs still require many external calls | Current progressive loading is deliberate; measure before changing |
| Display fonts vary across devices | `style.css` | Device fonts render when available; CSS includes common fallbacks | Check the fallback stack when targeting browsers with different font inventories |

## Fragile Areas and Churn

| Area | Why fragile | Churn evidence | Safe change strategy |
|---|---|---|---|
| `style.css`, `index.html` | Presentational selectors and JavaScript DOM hooks must stay aligned | Recent Git history: `style.css` 2 commits, `index.html` 2 commits | Preserve IDs/classes used in `script.js`; verify narrow and wide layouts |
| `script.js` | Owns API lifecycle and all interactive state | Recent Git history: 1 commit | Keep design changes out of data/state logic unless required |

## [ASK USER] Questions

None identified for the current visual redesign. `[TODO]` browser support expectations are unknown, but this does not block the delivered CSS.

## Evidence

- `script.js`
- `index.html`
- `style.css`
- `README.md`
- Repository tracked-file listing and recent Git history (terminal output)
