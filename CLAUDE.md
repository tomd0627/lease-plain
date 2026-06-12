# Lease Plain — CLAUDE.md

## Project Overview

AI-powered rental lease decoder. Users paste a lease → Netlify Function calls Claude API → structured JSON rendered as clause cards. Single-page vanilla HTML/CSS/JS. No framework.

## Color Palette

| Token                    | Hex       | Notes                                                   |
| ------------------------ | --------- | ------------------------------------------------------- |
| `--color-bg`             | `#F8FAF9` | Page background                                         |
| `--color-surface`        | `#FFFFFF` | Cards                                                   |
| `--color-surface-raised` | `#EEF3F1` | Elevated sections, code excerpts                        |
| `--color-ink`            | `#0F1F1A` | Primary text                                            |
| `--color-ink-muted`      | `#4A6259` | Secondary text — verified 5.1:1 on bg, 4.8:1 on surface |
| `--color-accent`         | `#1B6349` | CTA, links — 4.9:1 on white                             |
| `--color-accent-hover`   | `#134D38` | Hover state                                             |
| `--color-flag-red`       | `#B91C1C` | Risky clause                                            |
| `--color-flag-yellow`    | `#B45309` | Review carefully                                        |
| `--color-flag-ok`        | `#166534` | Standard/OK                                             |
| `--color-border`         | `#D1E0DA` | Borders                                                 |

## File Map

```
index.html              ← single page, all states rendered/hidden via JS
css/styles.css          ← all styles, alphabetized declarations, logical properties
js/app.js               ← state machine, DOM events, sample lease constant
js/analyzer.js          ← fetch to /.netlify/functions/analyze
js/renderer.js          ← DOM construction from API JSON response
netlify/functions/analyze.js  ← Node.js proxy, reads ANTHROPIC_API_KEY env var
```

## Typefaces

- Headings: Fraunces (Google Fonts)
- Body: Inter (Google Fonts)
- Monospace (lease excerpts): JetBrains Mono (Google Fonts)
- Icons: Lucide via CDN

## Known Gotchas

- **No `"type": "module"` in package.json** — browser JS uses `sourceType: 'script'` in ESLint. Use `/* exported funcName */` comments for browser globals.
- **`deno.lock`** — Netlify CLI generates this at runtime. It's in `.gitignore`.
- **Stylelint vs. VS Code CSS validator** — stylelint allows `!important`; VS Code lints against it. Suppressed via `.vscode/settings.json`.
- **`role="status"` on char counter** — carries implicit `aria-live="polite"`. Do NOT add an explicit `aria-live` attribute.
- **`tabindex="-1"` on focus targets** — `#main` and `#results-summary` both need this for programmatic `focus()` to work.

## Adding a New Clause Category

1. Add the category name to the system prompt's required sections list in `netlify/functions/analyze.js`
2. No changes needed to `renderer.js` — `renderClauses()` is data-driven

## Local Development

```bash
npm install
# Set ANTHROPIC_API_KEY in a .env file at project root (never commit this)
netlify dev
# App available at http://localhost:8888
```
