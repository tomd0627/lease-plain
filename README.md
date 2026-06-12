# Lease Plain

**Your lease, translated into English.**

Lease Plain is an AI-powered rental lease decoder. Paste the text of your lease and get a plain-English breakdown of every major clause — flagging tenant-unfriendly terms, explaining legal jargon, and surfacing hidden fees most renters miss.

## Features

- Tenant score (1–10) with color-coded indicator
- Clause-by-clause breakdown across 10 categories
- Top 3 gotchas surfaced prominently
- Hidden fees detection
- Flag levels: Standard / Review / Risky — with icon + text, never color alone
- Fully accessible (WCAG 2.1 AA), responsive, zero runtime dependencies

## Local Development

### Prerequisites

- Node.js 18+
- [Netlify CLI](https://docs.netlify.com/cli/get-started/)
- An Anthropic API key

### Setup

```bash
git clone https://github.com/tomd0627/lease-plain.git
cd lease-plain
npm install
```

Create a `.env` file at the project root:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Start the local dev server (Netlify CLI runs the serverless function locally):

```bash
netlify dev
```

App is available at `http://localhost:8888`.

### Linting

```bash
npm run lint:css    # Stylelint
npm run lint:js     # ESLint
npm run lint:html   # html-validate
npm run format      # Prettier
```

Pre-commit hooks run automatically on staged files via Husky + lint-staged.

## Deploy

1. Connect the repo to Netlify
2. Set `ANTHROPIC_API_KEY` in the Netlify dashboard (Site settings → Environment variables)
3. Deploy — no build command needed, publish directory is `.`

## Tech Stack

- Vanilla HTML / CSS / JS — no framework
- [Anthropic Claude API](https://docs.anthropic.com) via Netlify Function proxy
- Icons inlined as SVG (Lucide)
- Google Fonts: Fraunces, Inter, JetBrains Mono

## Disclaimer

Lease Plain uses AI to summarize lease language. This is not legal advice. Consult a licensed attorney for guidance specific to your situation.
