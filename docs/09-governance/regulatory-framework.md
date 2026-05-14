# Regulatory Framework

## EnviroPulse — Malaysian & International Standards

**Version:** 1.0  
**Date:** 2026-05-15  

---

## Applicable Standards

### 1. OSH Amendment Act 2024 — Section 15(2)
**Jurisdiction:** Malaysia  
**Governing Body:** DOSH (Department of Occupational Safety and Health)  
**Relevance:** Duty of care for worker heat stress.  
**Platform Implementation:**
- Heat Index calculated per Rothfusz Regression
- DOSH categories enforced: Safe (<33°C), Category 1 (33–38°C), Category 2 (>38°C), STOP WORK (>40°C)
- Construction Operator advisory includes mandatory work-rest cycle recommendations per category
- WorkerGrid displays per-workforce-category risk levels

---

### 2. DOSH Thermal Comfort Guidelines
**Jurisdiction:** Malaysia  
**Governing Body:** DOSH  
**Relevance:** Technical thresholds for occupational heat stress.  
**Platform Implementation:**
- Heat Index threshold for AI advisory actions
- Alert generation when Heat Index > 40°C (STOP WORK)

---

### 3. Environmental Quality Act 1974 (EQA) — Section 22
**Jurisdiction:** Malaysia  
**Governing Body:** DOE (Department of Environment)  
**Relevance:** Mandatory DOE notification when AQI exceeds 50.  
**Platform Implementation:**
- AQI > 50 triggers alert classification
- Government Officer and DOE Auditor advisories cite EQA §22 explicitly
- `/api/compliance/escalate` stub supports future live DOE integration

---

### 4. WHO Air Quality Guidelines 2021 (AQG 2021)
**Jurisdiction:** International  
**Governing Body:** World Health Organization  
**Relevance:** PM2.5 annual mean limit of 15 µg/m³.  
**Platform Implementation:**
- All PM2.5 readings compared against 15 µg/m³ baseline
- Exceedance percentage shown in PollutantGrid and AI advisories
- Bursa E1 status linked to WHO exceedance flag

---

### 5. Malaysia NCAAP 2025–2040
**Jurisdiction:** Malaysia  
**Governing Body:** DOE / KeTSA (Ministry of Natural Resources)  
**Relevance:** National Clean Air Action Plan — PM2.5 exceedance day tracking.  
**Platform Implementation:**
- Exceedance days tracked in ESG stats
- Government Officer advisory references NCAAP targets
- Historical analytics includes exceedance day counts

---

### 6. Bursa Malaysia Practice Note 9 (PN9) / E1 Indicator
**Jurisdiction:** Malaysia  
**Governing Body:** Bursa Malaysia  
**Relevance:** Mandatory ESG air emissions disclosure for listed companies. E1 indicator triggered when PM2.5 exceeds WHO limit.  
**Platform Implementation:**
- `bursaE1Status` field in every AI advisory response
- BursaReportModal generates E1 disclosure narrative
- MSME and ESG Firm advisories include Bursa submission readiness assessment

---

### 7. IFRS S1 & S2
**Jurisdiction:** International  
**Governing Body:** IFRS Foundation / ISSB  
**Relevance:** Global sustainability disclosure standards — governance, strategy, risk management, metrics & targets.  
**Platform Implementation:**
- ReportsPage generates IFRS S1/S2 aligned narrative via `POST /api/analytics/esg`
- Report covers governance (board oversight of emissions), strategy (climate risk), risk management (mitigation measures), and metrics (PM2.5 data)

---

### 8. GRI 305-7
**Jurisdiction:** International  
**Governing Body:** Global Reporting Initiative  
**Relevance:** Air quality emissions reporting standard.  
**Platform Implementation:**
- ESG narrative includes GRI 305-7 citation
- PM2.5, NO2, SO2 data mapped to GRI disclosure format

---

## Threshold Reference Table

| Parameter | Threshold | Standard | Action |
|---|---|---|---|
| PM2.5 | 15 µg/m³ annual | WHO AQG 2021 | Flag exceedance, trigger Bursa E1 |
| PM2.5 | 35 µg/m³ | System CRITICAL | CRITICAL anomaly alert |
| AQI | 50 | EQA 1974 §22 | DOE notification required |
| AQI | 100 | System CRITICAL | CRITICAL anomaly alert |
| NO2 | 25 µg/m³ | System WARNING | WARNING anomaly alert |
| Heat Index | 33°C | DOSH Cat 1 | Work-rest cycle required |
| Heat Index | 38°C | DOSH Cat 2 | Enhanced rest cycle required |
| Heat Index | 40°C | DOSH STOP WORK | Mandatory work cessation |
