# Technology Stack

## Runtime Summary

| Area | Value | Evidence |
|---|---|---|
| Primary language | Browser JavaScript (vanilla, no module imports) | `script.js` |
| Runtime and version | Web browser; minimum/version is not pinned | `index.html`; `[TODO]` browser support policy |
| Package manager | None detected | Scan found no package manifest |
| Module/build system | Static HTML/CSS/JS; no build system | `index.html`, `style.css`, `script.js` |

## Production Frameworks and Dependencies

| Dependency | Version | Role | Evidence |
|---|---|---|---|
| PokéAPI | Unpinned HTTP API | Pokémon, species, moves, and image URLs | `script.js` |
| System fonts | Device fonts with CSS fallbacks | Arial Black/Impact headings, Arial body, JetBrainsMono Nerd Font labels when installed | `style.css` |

No frontend framework or bundled JavaScript dependency is present.

## Development Toolchain and Commands

No lint, formatter, build, or test tool is configured. The project can be served as static files; the README names no required command. `[TODO]` document the preferred local server command and supported browser matrix.

## Environment and Configuration

- Config files and environment templates: none detected.
- Required environment variables: none detected.
- Deployment: the README identifies a GitHub Pages demo; files are static (`README.md`).

## Evidence

- `README.md`
- `index.html`
- `script.js`
- `style.css`
- Repository tracked-file listing (terminal output)
