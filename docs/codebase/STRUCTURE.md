# Codebase Structure

## Top-Level Map

| Path | Purpose | Evidence |
|---|---|---|
| `index.html` | Semantic page structure and stable DOM targets for the UI | `index.html` |
| `style.css` | Global design system, responsive layout, and component styling | `style.css` |
| `script.js` | API access, UI state, rendering, and interaction handlers | `script.js` |
| `favicon.svg` | Browser tab icon | `index.html`, `favicon.svg` |
| `README.md` | Project description and feature inventory | `README.md` |
| `docs/codebase/` | Evidence-backed project reference documents | `docs/codebase/*.md` |

## Entry Points

- Main runtime entry: `index.html`; it loads `style.css` in the head and `script.js` at the end of the body.
- Secondary entry points: none found.
- The HTML document directly selects the browser runtime; no build or start configuration exists.

## Module Boundaries

| Boundary | Responsibility | Evidence |
|---|---|---|
| Markup | Accessible page structure and the IDs/classes consumed by JavaScript | `index.html`, `script.js` DOM declarations |
| Presentation | Layout, responsive behavior, and visual states | `style.css` |
| Browser application logic | Search, API requests, rendering, tab state, and sprite controls | `script.js` |

These are file boundaries rather than enforced modules; JavaScript is a single global script.

## Naming and Organization

- Files use lowercase names (`index.html`, `style.css`, `script.js`).
- JavaScript uses camelCase identifiers; CSS uses kebab-case classes; IDs use camelCase (`script.js`, `index.html`).
- Imports, path aliases, and exports: none found.

## Evidence

- `index.html`
- `style.css`
- `script.js`
- `README.md`
