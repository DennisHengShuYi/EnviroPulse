# Project Plan

## EnviroPulse — Development Roadmap

**Version:** 1.0  
**Date:** 2026-05-15  
**Status:** Active Development — UMDT-fix branch  

---

## Milestones

| Milestone | Description | Status |
|---|---|---|
| M1 — Core Dashboard | Real-time metrics, 2D/3D map, pollutant grid, trend chart | Complete |
| M2 — AI Advisory | 5-role compliance verdicts with fallback engine | Complete |
| M3 — Compliance Verification | Submission form, discrepancy detection, adaptive thresholds | Complete |
| M4 — Audit Chain | Immutable FNV-1a chained audit log, disk persistence | Complete |
| M5 — Analytics | Historical, comparison, anomaly detection, ESG stats | Complete |
| M6 — Reports | ESG/Bursa modal, IFRS S1/S2 narrative, PDF export | Complete |
| M7 — Prediction Engine | 48-hour AI forecasting with hourly risk bands | Complete |
| M8 — UMDT Fix | Token input fixes, advisory & predictive prompt tuning | In Progress |
| M9 — Authentication | User auth, role-based access control | Planned |
| M10 — DOE Integration | Live escalation API, government portal integration | Planned |
| M11 — Production Deploy | Cloud hosting, CI/CD pipeline, monitoring | Planned |

---

## Phase Breakdown

### Phase 1 — MVP (Complete)
- Core dashboard with live sensor data
- 2D Leaflet map and 3D MapLibre digital twin
- AI advisory for 5 roles
- Immutable audit chain

### Phase 2 — Compliance & Reporting (Complete)
- Compliance submission and verification
- ESG / Bursa Malaysia report generation
- PDF export
- 48-hour predictions

### Phase 3 — Hardening (In Progress — UMDT-fix)
- AI token input stability
- Prompt template improvements
- Compliance accuracy tuning
- All adjustments for regulatory areas

### Phase 4 — Production Readiness (Planned)
- Authentication & authorisation (JWT / OAuth2)
- Role-based access control
- Cloud deployment (AWS / Azure / GCP)
- CI/CD pipeline
- Live DOE escalation integration
- WhatsApp notification integration
- Full PKI audit signing

---

## Team & Responsibilities

| Role | Responsibility |
|---|---|
| Lead Developer | Full-stack implementation, AI prompt engineering |
| Environmental Domain Expert | Regulatory accuracy review, threshold validation |
| UX Designer | Dashboard layout, accessibility |
| DevOps | Deployment pipeline, infrastructure |
| QA Engineer | Test planning, compliance scenario validation |
