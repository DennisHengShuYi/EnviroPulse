# Developer Setup Guide

## EnviroPulse

**Version:** 1.0  
**Date:** 2026-05-15  

---

## Prerequisites

| Tool | Minimum Version |
|---|---|
| Node.js | 18 LTS |
| npm | 9+ |
| Git | 2.40+ |

---

## 1. Clone the Repository

```bash
git clone <repo-url>
cd UMDT-fix
```

---

## 2. Install Dependencies

```bash
npm install
```

This installs both frontend (React/Vite) and backend (Express) dependencies from the root `package.json`.

---

## 3. Configure Environment Variables

Copy the example env file:

```bash
cp .env.example .env
```

Edit `.env` and fill in:

```env
# Required — AQICN live station feeds
AQICN_TOKEN=your_token_here

# Required — AI inference (choose one)
ANTHROPIC_API_KEY=your_key_here
ILMU_API_KEY=your_ilmu_key_here

# Optional — override default model
ANTHROPIC_MODEL=ilmu-glm-5.1

# Optional — skip AI calls and use dynamic fallback (dev/offline mode)
SIMULATE_LIVE_INFERENCE=true
```

---

## 4. Start Development Servers

The project uses two concurrent processes:

```bash
# Terminal 1 — Backend API (port 3001)
npm run server

# Terminal 2 — Frontend dev server (port 5173)
npm run dev
```

Or if a `dev:all` / `concurrently` script is configured:

```bash
npm run dev:all
```

Open `http://localhost:5173` in a browser.

All `/api/*` requests are proxied by Vite to `http://localhost:3001`.

---

## 5. Working Offline / Without API Keys

Set `SIMULATE_LIVE_INFERENCE=true` in `.env`.

The backend will:
- Use Malaysian baseline defaults for weather (31°C, AQI 45, PM2.5 12) if Open-Meteo / AQICN are unavailable
- Generate mathematical fallback advisory responses instead of calling the AI API

---

## 6. Useful Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start Vite frontend dev server |
| `npm run server` | Start Express backend with nodemon |
| `npm run build` | Build frontend to `/dist` |
| `npm run preview` | Preview production build locally |

---

## 7. Project Structure

```
UMDT-fix/
├── .env                   Environment variables
├── .env.example           Template
├── package.json           Dependencies & scripts
├── vite.config.js         Vite config + /api proxy
├── index.html             HTML entry point
├── server/
│   └── index.js           Express backend (all routes)
├── src/
│   ├── main.jsx           React entry
│   ├── App.jsx            Root component & routing
│   ├── components/        Reusable UI components (16 total)
│   └── pages/             Page-level components (5 pages)
├── docs/                  Project documentation
└── .data/
    └── scrutiny.json      Audit chain persistence
```

---

## 8. Key Development Notes

- The backend is a single monolithic `server/index.js` — all routes, fetchers, and AI logic live there.
- Cache TTLs are defined at the top of `server/index.js` via `node-cache` config.
- The 3D map (`City3DView.jsx`) requires WebGL support. Chrome/Edge recommended.
- Audit chain genesis entries are auto-created on first access per node — no manual seeding needed.
- `ANTHROPIC_MODEL` defaults to `ilmu-glm-5.1` — this connects to the ilmu.ai endpoint, not Anthropic directly, unless overridden.
