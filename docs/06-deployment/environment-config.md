# Environment Configuration

## EnviroPulse

**Version:** 1.0  
**Date:** 2026-05-15  

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `AQICN_TOKEN` | Yes (live) | — | API key for waqi.info live station feeds |
| `ANTHROPIC_API_KEY` | Yes (live) | — | API key for ilmu.ai or Anthropic Claude |
| `ILMU_API_KEY` | Alt to above | — | Alternative key name if using ilmu.ai directly |
| `ANTHROPIC_MODEL` | No | `ilmu-glm-5.1` | Model identifier for AI inference |
| `SIMULATE_LIVE_INFERENCE` | No | unset | If set to `true`, skips all AI API calls |
| `PORT` | No | `3001` | Backend server port |
| `NODE_ENV` | No | `development` | `production` enables optimisations |

---

## Per-Environment Behaviour

### Development (local)
- `SIMULATE_LIVE_INFERENCE=true` recommended to avoid API costs during development
- Open-Meteo and AQICN calls are made live (free tier) unless rate-limited
- Fallback to Malaysian baselines (31°C, AQI 45, PM2.5 12) on any API failure

### Staging
- Use dedicated test API keys for AQICN and AI
- `SIMULATE_LIVE_INFERENCE` may be set to control cost
- Run against production-equivalent data where possible

### Production
- All API keys must be set and valid
- `SIMULATE_LIVE_INFERENCE` must NOT be set
- Use environment secrets management (AWS Secrets Manager, Azure Key Vault, or equivalent) — never commit `.env` to source control

---

## Cache TTL Configuration

These are hardcoded in `server/index.js` and can be adjusted:

| Data Type | TTL | Rationale |
|---|---|---|
| Sensor readings | 2 minutes | Balance freshness vs API rate limits |
| Historical / analytics | 15 minutes | Slower-changing data |
| AI predictions | 60 minutes | Expensive AI call, data valid for 1h |
| ESG narratives | 60 minutes | Expensive AI call |

---

## Port Configuration

| Service | Port | Notes |
|---|---|---|
| Vite dev server | 5173 | Proxies `/api/*` → 3001 |
| Express backend | 3001 | Configurable via `PORT` env var |

Vite proxy config is in `vite.config.js`:

```js
proxy: {
  '/api': 'http://localhost:3001'
}
```
