# Coding Standards

## EnviroPulse

**Version:** 1.0  
**Date:** 2026-05-15  

---

## General Principles

- Write self-documenting code — well-named variables and functions eliminate the need for most comments
- Comments only when the WHY is non-obvious: a regulatory constraint, a specific formula, a known API quirk
- No commented-out code left in PRs
- Prefer editing existing files over creating new ones
- No abstractions added beyond what the current task requires

---

## JavaScript / React

### Naming
- Components: `PascalCase` (e.g., `AIAdvisory`, `HeroMetrics`)
- Functions and variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE` for environment-level constants
- Files: `PascalCase.jsx` for components, `camelCase.js` for utilities

### Components
- One component per file
- Keep components focused — if a component grows beyond ~200 lines, consider splitting
- Avoid prop drilling beyond 2 levels — lift state to `App.jsx` or use context
- Use functional components with hooks only — no class components

### State Management
- District selection and active page live in `App.jsx` — passed as props
- Local UI state stays in the component (e.g., modal open/close, tab selection)
- API data fetched in the component that owns it, not in a centralised store

### API Calls
- All API calls go through the `/api/*` proxy — never call external APIs directly from the frontend
- Wrap `fetch` calls in try/catch and display appropriate error states, not blank screens
- Show loading states during data fetches

---

## Node.js / Express

### Route Handlers
- Keep route handler functions focused — delegate computation to named helper functions
- Always return JSON — never send unformatted text responses
- Validate required body fields at the top of POST handlers and return 400 with a message if missing

### Error Handling
- All external API calls (Open-Meteo, AQICN, AI) must have try/catch with fallback
- Log errors to console with context (route name, district, error message)
- Never let an unhandled exception crash the Express server

### Caching
- Cache key format: `<endpoint>-<districtId>` or `<endpoint>-<nodeId>-<role>`
- Always check cache before making an external API call
- Invalidate cache explicitly on threshold config changes

---

## AI Prompt Engineering

- System prompts must enforce: mandatory regulatory citations, explicit arithmetic, role-specific output schema
- Use temperature 0.1 for compliance-critical responses (deterministic)
- All AI response fields must be validated before returning to the frontend — use fallback values for missing fields
- `generateDynamicFallback()` must always produce structurally identical output to the live AI response

---

## Regulatory / Domain Rules

- Threshold values must reference their source (WHO, DOE, DOSH) in code comments where defined
- Heat Index must always use the Rothfusz Regression formula — no approximations
- Variance thresholds for compliance verification: 20% standard, 10% after 3 consecutive breaches — do not change without regulatory review
- FNV-1a hash input format: `nodeId|timestamp|pm25|aqi|heat|prevHash|escalationTag` — this order is part of the audit contract and must not change
