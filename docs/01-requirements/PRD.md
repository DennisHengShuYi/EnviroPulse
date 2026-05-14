# Product Requirements Document (PRD)

## EnviroPulse — Real-Time Environmental Compliance Monitoring Platform

**Version:** 1.0  
**Branch:** UMDT-fix  
**Date:** 2026-05-15  
**Owner:** den51  

---

## 1. Overview

### 1.1 Problem Statement
Malaysian industrial operators, MSMEs, government agencies, and ESG firms lack a unified platform to:
- Monitor real-time air quality and heat stress against regulatory thresholds
- Verify that corporate environmental self-reports are not fabricated or selectively reported — a rising concern under Bursa Malaysia ESG disclosure mandates

### 1.2 Product Vision
A tamper-evident, AI-augmented monitoring dashboard that provides role-specific compliance verdicts derived from live sensor data, enabling every stakeholder class to act on legally defensible, mathematically grounded environmental intelligence.

### 1.3 Geography & Scope
- **Geography:** Malaysia — 50 districts across 6 regions
- **Regions:** CENTRAL, NORTHERN, SOUTHERN, EAST COAST, SARAWAK, SABAH

---

## 2. Target Users

| Persona | Role | Primary Need |
|---|---|---|
| Construction Operator | Site manager / safety officer | Heat stress work-rest cycle guidance |
| Government Officer | DOE / DOSH / NCAAP officer | District escalation decisions, multi-agency coordination |
| MSME Owner | Small-medium enterprise operator | Plain-language compliance verdicts, Bursa submission readiness |
| ESG Analyst | ESG firm / sustainability consultant | IFRS S1/S2 disclosure gap analysis, GRI 305-7 reporting |
| DOE Auditor | Regulatory auditor | Cryptographic verification of corporate submissions |

---

## 3. Regulatory Scope

| Standard | Relevance |
|---|---|
| OSH Amendment Act 2024 §15(2) | Duty of care; mandatory work-rest cycles above 33°C heat index |
| DOSH Thermal Comfort Guidelines | Heat stress categories (Cat 1: 33–38°C, Cat 2: >38°C, STOP WORK: >40°C) |
| Environmental Quality Act 1974 §22 | DOE notification threshold (AQI > 50) |
| WHO Air Quality Guidelines 2021 | PM2.5 annual limit: 15 µg/m³ |
| Malaysia NCAAP 2025–2040 | National air quality targets, exceedance day tracking |
| Bursa Malaysia PN9 / E1 Indicator | Mandatory ESG air emissions disclosure (PM2.5 > WHO limit) |
| IFRS S1 & S2 | Global sustainability disclosure (governance, strategy, risk management) |
| GRI 305-7 | Air quality emissions reporting |

---

## 4. Goals

- Real-time AQI, heat stress, and PM2.5 monitoring across 50 Malaysian districts
- AI-driven 5-role compliance verdicts with mandatory regulatory citations
- Tamper-evident, cryptographically chained audit logs per sensor node
- Corporate submission discrepancy detection (anti-greenwashing)
- 48-hour forward predictive compliance risk assessment
- PDF and ESG report export for Bursa Malaysia and IFRS disclosure

## 5. Non-Goals (v1)

- Direct sensor hardware management or firmware updates
- Live enforcement actions (escalation is a stub only)
- Full PKI-grade cryptographic signing (FNV-1a used for audit — not collision-resistant)
- User authentication and role-based access control
- Mobile native application

---

## 6. Success Metrics

| Metric | Target |
|---|---|
| AI verdict response time (cached) | < 3 seconds |
| AI verdict response time (live) | < 15 seconds |
| Audit chain hash verification accuracy | 100% |
| Compliance discrepancy detection recall | ≥ 90% vs manual spot-checks |
| Dashboard data freshness | ≤ 2 minutes |
| PDF export success rate | ≥ 99% |

---

## 7. Constraints & Assumptions

- External APIs (Open-Meteo, AQICN) are rate-limited and may be unavailable — fallback to Malaysian baselines required
- AI API (ilmu.ai / Anthropic Claude) may be unavailable — dynamic mathematical fallback must be maintained
- No persistent database in v1 — data is in-memory with disk persistence for audit chains only
- Frontend runs on port 5173; backend on port 3001; Vite proxies `/api/*`
