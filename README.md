# 🏭 EnviroPulse Terminal — Industrial Compliance Command Center

EnviroPulse is an IoT-anchored environmental compliance platform that prevents greenwashing by generating ESG reports directly from tamper-evident physical sensors installed at company facilities — making falsification structurally impossible.

🔗 **Important Links**
📄 EnviroPulse Documentation — [View Documentation](https://www.notion.so/EnviroPulse-Anti-Greenwashing-Platform-System-Design-361f0ca19eb1812c9fd4c082092ff442?source=copy_link)
- 🎤 [Pitch Deck](#) — View Slides

👥 **Team Members**
- 👨‍💻 Dennis — 3rd Year @ UM
- 👨‍💻 Joey — 3rd Year @ UM
- 👨‍💻 Shareen— 3rd Year @ UM
- 👨‍💻 Andrew — 3rd Year @ UM
- 👨‍💻 Yi Xing — 3rd Year @ UM

📋 **Table of Contents**
- [Project Overview](#-project-overview)
- [System Architecture](#-system-architecture)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Setup & Installation](#-setup--installation)
- [How to Run](#-how-to-run)
- [Troubleshooting](#-troubleshooting)

---

🌐 **Project Overview**
EnviroPulse Terminal simulates a centralized monitoring node for an industrial district. The system demonstrates:
- **Real-Time Telemetry Tracking**: Live updates of PM2.5, NO2, AQI, and Heat Index.
- **AI-Driven Advisory**: Real-time LLM inference engine that analyzes live sensor telemetry against statutory thresholds (EQA 1974, OSH Act 2024).
- **Statutory Workflow Management**: Deterministic, fast-action manual verification workflow for tracking and authorizing industrial compliance submissions.
- **Tiered Access Control**: A Basic/Premium toggle demonstrating feature-flagging.
- The entire system runs locally — no physical hardware is needed.

🏗️ **System Architecture**
```text
┌─────────────────────────────────────────────────────────────────────┐
│                         React Frontend                              │
│         (Vite + Recharts Dashboard — localhost:5173)                │
│   Polls GET /api/sensors every 8000ms                               │
└────────────────────────┬────────────────────────────────────────────┘
                         │ REST API (HTTP)
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│          Backend: Express (port 3001)                               │
│  ┌────────────────────────┐   ┌────────────────────────────────┐    │
│  │  Simulation Loop       │   │       REST Endpoints           │    │
│  │  (runs periodically)   │   │  /api/sensors  /api/trends     │    │
│  │  - Sensor data gen     │   │  /api/alerts   /api/districts  │    │
│  │  - Plume math          │   │  /api/advisor                  │    │
│  └────────────────────────┘   └────────────────────────────────┘    │
└────────────────────────┬────────────────────────────────────────────┘
                         │ API Request
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  LLM Inference Engine                               │
│              (OpenAI / Anthropic SDK)                               │
└─────────────────────────────────────────────────────────────────────┘
```

✨ **Features**

🎛️ **High-Density Command Center**
| Feature | Description |
|---|---|
| **Streamlined 3-Column Grid** | Optimized for operator focus, displaying live conditions, risk assessments, and compliance trends without visual bloat. |
| **Tiered Access Control** | **Basic**: Core telemetry. **Premium**: AI Intelligence column and full navigation suite (Analytics, Reports, etc.). |
| **Statutory Compliance Workflow** | Deterministic, fast-action manual verification workflow for tracking and authorizing compliance submissions. |

🧠 **Live AI Compliance Advisory**
| Feature | Description |
|---|---|
| **Statutory LLM Inference** | Analyzes live sensor telemetry against EQA 1974 & OSH Act 2024. |
| **Actionable Directives** | Generates site-safety and emission-mitigation recommendations. |

📁 **Project Structure**
```text
EnviroPulse/
├── server/
│   ├── index.js               # Express REST server + LLM Gateway
├── src/
│   ├── App.jsx                # Dashboard: polling, layout, tier state
│   ├── main.jsx
│   ├── index.css              # Vanilla CSS (High-density industrial aesthetic)
│   ├── components/
│   │   ├── AIAdvisory.jsx     # Premium AI Intelligence widget
│   │   ├── Header.jsx         # Basic/Premium toggle & District Selector
│   │   ├── PollutantGrid.jsx  # Live telemetry matrix
│   │   ├── Sidebar.jsx        # Navigation controls
│   ├── pages/
│   │   ├── CompliancePage.jsx # Statutory workflow
│   │   ├── AnalyticsPage.jsx  # Data comparison
├── .env                       # API keys (not committed)
├── package.json
└── README.md
```

🛠️ **Tech Stack**
| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19 + Vite 8 |
| **Styling** | Vanilla CSS |
| **Data Visualization** | Recharts |
| **Icons** | Lucide React |
| **Backend Framework** | Node.js + Express 5 |
| **AI Inference** | OpenAI SDK / Anthropic SDK |

⚙️ **Setup & Installation**

**Prerequisites**
| Requirement | Notes |
|---|---|
| Node.js | v18 or higher recommended |
| npm | For installing dependencies |
| OpenAI / Anthropic Key | Required for Live AI Advisory |

**Step 1 — Clone the Repository**
```bash
git clone https://github.com/DennisHengShuYi/EnviroPulse.git
cd EnviroPulse
```

**Step 2 — Create the .env File**
Create a `.env` in the project root:
```env
# Depending on your configured AI provider in the backend:
ANTHROPIC_API_KEY=sk-...
OPENAI_API_KEY=sk-...
```

**Step 3 — Install Dependencies**
```bash
npm install
```

🚀 **How to Run**
You need two terminals running simultaneously.

**Terminal 1 — Start the Backend Engine**
```bash
npm run server
```

**Terminal 2 — Start the Frontend Dashboard**
```bash
npm run dev
```
Open your browser at: `http://localhost:5173`

🔧 **Troubleshooting**
| Problem | Fix |
|---|---|
| **Frontend blank / 504 error** | Run `npm install`, ensure backend is running on port 3001. |
| **No AI Advisory Data** | Ensure `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` is set in `.env` and tier is set to PREMIUM. |
| **Port 3001 already in use** | Kill the process using the port and restart `npm run server`. |
