# Technology Stack

## EnviroPulse — Stack Reference

**Version:** 1.0  
**Date:** 2026-05-15  

---

## Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 19.2.5 | UI component framework |
| Vite | 8.0.10 | Build system & dev server (port 5173) |
| MapLibre GL | 5.24.0 | 3D geospatial mapping, building extrusions |
| Leaflet | 1.9.4 | 2D district map, markers, polygons |
| Three.js | 0.184.0 | 3D graphics primitives |
| @react-three/fiber | 9.6.1 | React renderer for Three.js |
| @react-three/drei | 10.7.7 | Three.js helper components |
| Recharts | 3.8.1 | Charts and data visualisations |
| Lucide-react | 1.14.0 | Icon library |
| html2canvas | 1.4.1 | DOM-to-canvas capture for PDF export |
| jsPDF | 4.2.1 | PDF generation from canvas |

## Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js | LTS | Runtime |
| Express | 5.2.1 | HTTP server (port 3001) |
| Nodemon | 3.1.14 | Dev auto-reload |
| CORS | 2.8.6 | Cross-origin header middleware |
| dotenv | 17.4.2 | Environment variable loading |
| node-cache | 5.1.2 | In-memory TTL cache |

## AI / Inference

| Technology | Version | Purpose |
|---|---|---|
| @anthropic-ai/sdk | 0.95.1 | Anthropic Claude API client |
| openai (SDK) | 6.37.0 | ilmu.ai OpenAI-compatible client |

## External APIs

| Service | Type | Purpose |
|---|---|---|
| Open-Meteo | REST (free) | Weather: temperature, humidity, UV, wind |
| Open-Meteo Air Quality | REST (free) | PM2.5, PM10, AQI |
| AQICN / waqi.info | REST (token) | Live station AQI feeds |
| ilmu.ai (ilmu-glm-5.1) | REST (key) | Primary AI model — Malaysian GLM |
| Anthropic Claude | REST (key) | AI advisory fallback model |
| MapLibre / OpenStreetMap | HTTPS tiles | Geospatial map tiles |

## Environment Variables

| Variable | Purpose |
|---|---|
| `AQICN_TOKEN` | API key for waqi.info |
| `ANTHROPIC_API_KEY` | Claude API key (or ilmu.ai key) |
| `ANTHROPIC_MODEL` | Model identifier (default: ilmu-glm-5.1) |
| `ILMU_API_KEY` | Alternative to ANTHROPIC_API_KEY |
| `SIMULATE_LIVE_INFERENCE` | Skip AI calls, use dynamic fallback (dev mode) |

## Ports & Proxy

| Service | Port | Notes |
|---|---|---|
| Vite dev server | 5173 | Proxies `/api/*` → localhost:3001 |
| Express API | 3001 | All backend routes |

## Data Persistence

| Store | Location | Purpose |
|---|---|---|
| In-memory (node-cache) | Runtime | Sensor & AI response caching |
| scrutiny.json | `./.data/scrutiny.json` | Audit chain breach count persistence |
