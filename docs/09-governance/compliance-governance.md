# Compliance Governance

## EnviroPulse — Anti-Greenwashing & Data Integrity Policy

**Version:** 1.0  
**Date:** 2026-05-15  

---

## 1. Purpose

This document defines the governance framework ensuring that EnviroPulse produces legally defensible, accurate environmental compliance data and that the platform itself cannot be used to facilitate environmental misrepresentation.

---

## 2. Data Integrity Principles

### 2.1 Sensor Data Provenance
- All sensor readings are fetched from independent third-party sources (Open-Meteo, AQICN/waqi.info)
- The platform does not allow manual override of live sensor readings
- Malaysian baseline fallbacks are used only when APIs are unavailable — this state is logged and flagged

### 2.2 Audit Chain Immutability
- Audit chain entries are append-only — no modification or deletion is permitted post-write
- Each entry is cryptographically linked to the previous entry via FNV-1a chained hashing
- The platform auto-flags any hash chain discontinuity as a tamper event

### 2.3 Compliance Submission Verification
- Reported PM2.5 and AQI values from corporate submissions are compared against the independent sensor baseline — they are never taken at face value
- Variance thresholds tighten automatically from 20% to 10% after 3 consecutive discrepancies from the same node, increasing scrutiny of repeat offenders
- All verification results are timestamped and logged

---

## 3. AI Advisory Governance

### 3.1 Regulatory Citation Mandate
Every AI-generated compliance verdict must:
- Cite at least one specific Malaysian or international regulation
- Include explicit arithmetic (e.g., "PM2.5 at X µg/m³ ÷ WHO limit 15 = Y× exceedance")
- Reference the specific DOSH heat category applicable to current conditions

### 3.2 Fallback Consistency
The dynamic mathematical fallback (`generateDynamicFallback`) must:
- Produce structurally identical output to live AI responses
- Use the same regulatory citations
- Apply the same arithmetic formulas

This ensures governance consistency whether the AI API is online or offline.

### 3.3 Determinism
AI compliance verdicts use temperature 0.1 (near-deterministic). This minimises variance in regulatory guidance across repeated queries for the same conditions.

---

## 4. Role-Based Advisory Scope

Each role receives advisory content scoped to its regulatory obligations and operational context:

| Role | Regulatory Obligations Covered |
|---|---|
| Construction Operator | OSH Act 2024 §15(2), DOSH thermal guidelines, PPE requirements |
| Government Officer | EQA 1974 §22, NCAAP 2025–2040, multi-agency coordination |
| MSME | Bursa PN9/E1, WHO PM2.5 limits, plain-language compliance |
| ESG Firm | IFRS S1/S2, GRI 305-7, TCFD physical risk, investor materiality |
| DOE Auditor | EQA enforcement, audit chain integrity, discrepancy escalation |

Roles are self-selected by users. Phase 4 will enforce role verification via authentication.

---

## 5. Escalation Governance

### 5.1 Current (v1 — Stub)
- Escalation is logged internally when triggered via `/api/compliance/escalate`
- The submission is flagged with an `escalationTag` in the audit chain
- No live DOE system integration in v1

### 5.2 Planned (Phase 4)
- Live API integration with DOE's regulatory portal
- Escalation acknowledgement and case number returned to the auditor
- Escalated cases locked from further modification

---

## 6. Data Retention Policy

| Data Type | Retention | Rationale |
|---|---|---|
| Sensor readings (cached) | 2 minutes in cache | Ephemeral — refreshed continuously |
| Audit chain entries (in-memory) | Until server restart (v1) | Phase 4: indefinite DB persistence |
| Breach counts (scrutiny.json) | Indefinite | Required for adaptive variance threshold |
| Compliance submission records | Indefinite (Phase 4) | Regulatory audit requirement |
| AI advisory responses | 60 minutes in cache | Ephemeral — context-specific |

---

## 7. Review & Update Schedule

| Document | Review Frequency | Trigger for Immediate Review |
|---|---|---|
| Regulatory Framework | Annually | New Malaysian environmental legislation |
| Threshold Reference Table | Annually or on WHO/DOE update | Standard revision by WHO/DOSH/DOE |
| Compliance Governance (this doc) | Annually | Audit finding or regulatory inquiry |
| Security Review | Every 6 months | Security incident or major dependency update |
