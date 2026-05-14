# Infrastructure Overview

## EnviroPulse

**Version:** 1.0  
**Date:** 2026-05-15  

---

## Current (Development)

```
Developer Machine
├── Vite Dev Server     (port 5173)  — React SPA with HMR
├── Express API         (port 3001)  — Node.js backend
├── .data/scrutiny.json              — Audit chain persistence
└── node-cache (in-memory)           — TTL cache
```

---

## Target Production Architecture

```
Internet
    │
    ▼
[HTTPS / TLS]
    │
    ▼
[Nginx Reverse Proxy]
    ├── / → serves /dist (React SPA static files)
    └── /api/* → proxy_pass → Express API (port 3001)
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            [Open-Meteo]      [AQICN API]    [ilmu.ai / Claude]
            (weather data)   (AQI feeds)     (AI advisory)
                                    │
                                    ▼
                            [.data/ volume]
                            (scrutiny.json)
```

---

## Compute Requirements

**Minimum (single VPS):**

| Resource | Minimum | Recommended |
|---|---|---|
| CPU | 1 vCPU | 2 vCPU |
| RAM | 512 MB | 1 GB |
| Disk | 5 GB | 20 GB |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| Node.js | 18 LTS | 20 LTS |

---

## External Service Dependencies

| Service | Availability Requirement | Fallback |
|---|---|---|
| Open-Meteo | Best-effort (free tier) | Malaysian baseline defaults |
| AQICN | Best-effort (free tier with token) | Malaysian baseline defaults |
| ilmu.ai / Claude | Best-effort (paid API) | `generateDynamicFallback()` |
| OpenStreetMap tiles | Best-effort (CDN) | Map tiles not rendered |

---

## Data Persistence

| Data | Storage | Backup Strategy |
|---|---|---|
| Audit chain breach counts | `.data/scrutiny.json` | Daily backup of `.data/` directory |
| In-memory sensor cache | RAM (node-cache) | No backup needed — refetched on restart |
| In-memory audit chain entries | RAM | Rebuilt from scratch on restart (v1 limitation) |

---

## Monitoring (Planned — Phase 4)

- **Uptime:** UptimeRobot or Pingdom pinging `/api/districts` every 5 minutes
- **Error tracking:** Sentry for both frontend (JS errors) and backend (Express errors)
- **Performance:** Response time monitoring on AI endpoints (target < 15s live, < 3s cached)
- **Logs:** Structured JSON logs → centralised logging (e.g., Datadog, Logtail, or self-hosted Loki)
