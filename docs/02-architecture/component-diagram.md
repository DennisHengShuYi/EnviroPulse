# Component Diagram

## EnviroPulse — System Architecture

**Version:** 1.0  
**Date:** 2026-05-15  

---

## 1. Tier Overview

The system is a **two-tier web application**:
- **Frontend:** React SPA (port 5173, Vite dev server)
- **Backend:** Node.js/Express API (port 3001)
- Vite proxies all `/api/*` calls to the backend during development

---

## 2. Frontend Layer

```
App.jsx (root shell)
│  Global state: selected district, active page, 2D/3D toggle
│
├── Header
│   ├── District Selector Dropdown (50 districts)
│   ├── Live Status Indicators
│   └── AlertBanner (real-time threshold breach strip)
│
├── Sidebar
│   └── Navigation links → Dashboard | Analytics | Sensors |
│                          Compliance | Reports | Alerts
│
└── Main Content Router
    │
    ├── Dashboard (default)
    │   ├── HeroMetrics          — KPI cards: AQI, Heat Index, PM2.5, Wind
    │   ├── MapHero              — Leaflet 2D map, district markers, polygons
    │   ├── City3DView           — MapLibre GL 3D twin, wind particles, plume
    │   ├── PollutantGrid        — PM2.5, PM10, NO2, SO2, CO, O3 with limit bars
    │   ├── TrendChart           — Recharts 24h area chart
    │   ├── AIAdvisory           — 5-role tab panel, POST /api/advisor
    │   ├── WorkerGrid           — Construction heat-risk assessment table
    │   └── AlertBanner          — Inline threshold breach alerts
    │
    ├── AnalyticsPage
    │   ├── Historical sub-panel      — 7-day aggregate trends
    │   ├── Comparison sub-panel      — Cross-district ranking
    │   ├── Anomaly Detection panel   — WARNING/CRITICAL classification
    │   ├── Prediction sub-panel      — 48h hourly risk bands
    │   └── ESG Stats sub-panel       — pm25Compliance, doeCompliance, heatSafeDays
    │
    ├── SensorsPage
    │   └── ImmutableAuditLog         — Hash-verified entry chain per node
    │
    ├── CompliancePage
    │   ├── Submission form           — company/zone/nodeId/date/PM2.5/AQI
    │   └── Verdict card              — PASS / FAIL / DISCREPANCY + score
    │
    ├── ReportsPage
    │   ├── BursaReportModal          — IFRS S1/S2 narrative
    │   └── PDF export                — html2canvas + jsPDF
    │
    └── AlertsPage
        └── Alert list                — severity, timestamp, district context
```

---

## 3. Backend Layer (`server/index.js`)

```
Express App (port 3001)
│
├── Data Ingestion Layer
│   ├── fetchWeatherData(district)       → Open-Meteo REST API
│   ├── fetchAQICNData(lat, lng)         → waqi.info AQICN REST API
│   └── calculateIDW(stations, lat, lng) → IDW interpolation (in-process)
│
├── Computation Layer
│   ├── calculateHeatIndex(tempF, rh)    → Rothfusz Regression
│   ├── fnv1a32(data)                   → FNV-1a 32-bit hash
│   └── adaptiveVarianceCheck(...)      → Compliance threshold logic
│
├── Caching Layer (node-cache)
│   ├── Sensor readings      TTL: 2 min
│   ├── Historical data      TTL: 15 min
│   └── AI predictions       TTL: 60 min
│
├── AI Inference Layer
│   ├── callAIModel(prompt)             → ilmu.ai (ilmu-glm-5.1) or Anthropic Claude
│   ├── generateDynamicFallback(role)   → local mathematical fallback
│   ├── POST /api/advisor               → 5-role compliance verdicts
│   ├── POST /api/predict               → 48h predictive outlook
│   └── POST /api/analytics/esg         → IFRS S1/S2 narrative
│
├── Sensor & District API
│   ├── GET /api/districts              → 50 district list
│   ├── GET /api/sensors                → live sensor readings
│   ├── GET /api/trends                 → 24h trend data
│   └── GET /api/alerts                 → active threshold breaches
│
├── Analytics API
│   ├── GET /api/analytics/historical   → 7-day aggregates
│   ├── GET /api/analytics/comparison   → cross-district ranking
│   ├── GET /api/analytics/anomalies    → anomaly detection
│   ├── GET /api/analytics/thresholds   → WHO/DOE limit comparisons
│   └── GET /api/analytics/esg-stats    → ESG compliance metrics
│
├── Compliance Verification API
│   ├── POST /api/compliance/verify     → submission vs sensor discrepancy check
│   └── POST /api/compliance/escalate   → DOE escalation stub
│
├── Audit API
│   └── GET /api/audit/log/:nodeId      → immutable chained audit entries
│
└── Configuration API
    └── GET/POST /api/config/thresholds → runtime threshold management
```

---

## 4. External Services

| Service | Protocol | Purpose |
|---|---|---|
| Open-Meteo | HTTPS REST | Temperature, humidity, UV, wind |
| Open-Meteo Air Quality | HTTPS REST | PM2.5, PM10, AQI |
| AQICN / waqi.info | HTTPS REST | Live station AQI feeds |
| Anthropic Claude API | HTTPS REST | AI advisory fallback model |
| ilmu.ai (ilmu-glm-5.1) | HTTPS REST (OpenAI-compat) | Primary AI model (Malaysian GLM) |
| MapLibre / OpenStreetMap | HTTPS Tiles | Geospatial tile rendering |

---

## 5. Cross-Cutting Concerns

| Concern | Implementation |
|---|---|
| Caching | node-cache in-memory; TTL per endpoint type |
| API Fallback | Every external call has try/catch → Malaysian baseline defaults |
| AI Fallback | Every AI call falls back to `generateDynamicFallback()` |
| CORS | `cors()` middleware on Express; Vite proxy for `/api` |
| Audit Persistence | Append-only array in-memory + `./.data/scrutiny.json` on disk |
| PDF Export | html2canvas DOM capture → jsPDF encode → browser download |
