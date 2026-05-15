# 🏭 EnviroPulse Terminal — Industrial Compliance Command Center
VHack 2026 — Case Study: Anti-Greenwashing Statutory Intelligence

EnviroPulse is an IoT-anchored environmental compliance platform that prevents greenwashing by generating ESG reports directly from tamper-evident physical sensors installed at company facilities — making falsification structurally impossible.

🔗 **Important Links**
- 📄 **EnviroPulse Documentation** — [View Documentation](https://www.notion.so/EnviroPulse-Anti-Greenwashing-Platform-System-Design-361f0ca19eb1812c9fd4c082092ff442)
- 🧠 **Agent Architecture Deep-Dive** — [Statutory AI Intelligence](#)
- 🔍 **Compliance Strategy Deep-Dive** — [How EnviroPulse Detects Greenwashing](#)
- 🎤 **Pitch Deck** — [View Slides](#)

👥 **Team Members**
- 👨‍💻 **Dennis** — 3rd Year @ UM
- 👨‍💻 **Shao Xian** — 3rd Year @ UM
- 👨‍💻 **Zhen Yu** — 3rd Year @ UM
- 👨‍💻 **Sean Sean** — 3rd Year @ UM

📋 **Table of Contents**
- [Project Overview](#-project-overview)
- [System Architecture](#-system-architecture)
- [Features](#-features)
- [Deployment & Connectivity](#-deployment--connectivity)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Setup & Installation](#-setup--installation)

---

🌐 **Project Overview**
EnviroPulse Terminal simulates a centralized monitoring node for an industrial district. The system demonstrates:
- **Real-Time Telemetry Tracking**: Live updates of PM2.5, NO2, AQI, and Heat Index.
- **AI-Driven Advisory**: Real-time LLM inference engine that analyzes live sensor telemetry against statutory thresholds (EQA 1974, OSH Act 2024).
- **Statutory Workflow Management**: Deterministic, fast-action manual verification workflow for tracking and authorizing industrial compliance submissions.
- **Tamper-Evident Reporting**: ESG report generation with cryptographic verification (simpleHash) to ensure data integrity.

🏗️ **System Architecture**
```text
┌─────────────────────────────────────────────────────────────────────┐
│                         React Frontend                              │
│         (Vite + Recharts Dashboard — Vercel/Local)                  │
│   Polls GET ${API_BASE}/api/sensors every 8000ms                    │
└────────────────────────┬────────────────────────────────────────────┘
                         │ REST API (HTTP)
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│          Backend: Express (Railway/Local)                           │
│  ┌────────────────────────┐   ┌────────────────────────────────┐    │
│  │  Simulation Loop       │   │       REST Endpoints           │    │
│  │  (runs periodically)   │   │  /api/sensors  /api/trends     │    │
│  │  - Sensor data gen     │   │  /api/alerts   /api/districts  │    │
│  │  - Plume math          │   │  /api/advisor  /api/analytics  │    │
│  └────────────────────────┘   └────────────────────────────────┘    │
└────────────────────────┬────────────────────────────────────────────┘
                         │ AI Request (Groq/OpenAI)
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  LLM Inference Engine                               │
│              (Statutory Intelligence Layer)                         │
└─────────────────────────────────────────────────────────────────────┘
```

✨ **Features**

🎛️ **High-Density Command Center**
- **Streamlined 3-Column Grid**: Optimized for operator focus, displaying live conditions, risk assessments, and compliance trends.
- **Statutory Compliance Workflow**: Deterministic verification workflow for tracking and authorizing compliance submissions.
- **Tiered Access Control**: Demonstration of feature-flagging between Basic and Premium operator tiers.

🧠 **Live AI Compliance Advisory**
- **Statutory LLM Inference**: Analyzes live sensor telemetry against EQA 1974 & OSH Act 2024.
- **Actionable Directives**: Generates site-safety and emission-mitigation recommendations in real-time.

🚀 **Deployment & Connectivity**

The system is designed for distributed deployment:
- **Backend (Railway)**: Optimized for Node.js 20 with nixpacks builder.
- **Frontend (Vercel)**: Configured for Vite build with client-side routing support.
- **Centralized API Base**: All frontend requests are routed through a configurable `VITE_API_BASE_URL` in `src/config/api.js`.

📁 **Project Structure**
```text
EnviroPulse/
├── server/
│   ├── index.js               # Express REST server + LLM Gateway
├── src/
│   ├── config/
│   │   └── api.js             # Centralized API_BASE configuration
│   ├── App.jsx                # Dashboard: polling, layout, tier state
│   ├── components/
│   │   ├── AIAdvisory.jsx     # Statutory AI Intelligence widget
│   │   ├── PollutantGrid.jsx  # Live telemetry matrix
│   ├── pages/
│   │   ├── CompliancePage.jsx # Statutory workflow
│   │   ├── AnalyticsPage.jsx  # Predictive analytics
│   │   ├── ReportsPage.jsx    # ESG report generation
├── railway.json               # Railway deployment config
├── vercel.json                # Vercel deployment config
├── package.json               # Start/Build scripts
└── README.md
```

🛠️ **Tech Stack**
- **Frontend**: React 19, Vite 8, Recharts, Lucide React
- **Backend**: Node.js, Express 5
- **AI**: Groq API (Llama 3.3), OpenAI SDK
- **Data Integrity**: Cryptographic simpleHash (FNV-1a variant)

⚙️ **Setup & Installation**

**Step 1 — Clone & Install**
```bash
git clone https://github.com/DennisHengShuYi/EnviroPulse.git
cd EnviroPulse
npm install
```

**Step 2 — Configuration**
Create a `.env` in the root:
```env
GROQ_API_KEY=gsk_...
# Optional:
VITE_API_BASE_URL=http://localhost:3001
```

**Step 3 — Run Locally**
Terminal 1: `npm run server` (Backend)
Terminal 2: `npm run dev` (Frontend)

**Step 4 — Production Build**
```bash
npm run build
```
This will generate the `dist` folder for deployment to Vercel/Netlify.
