# Functional Requirements

## EnviroPulse — FR List

**Version:** 1.0  
**Date:** 2026-05-15  

---

**FR-01** The system shall fetch real-time temperature, humidity, UV index, and wind data from the Open-Meteo API for each selected district.

**FR-02** The system shall fetch real-time AQI, PM2.5, and PM10 readings from the AQICN (waqi.info) API.

**FR-03** The system shall apply Inverse Distance Weighting (IDW) interpolation to estimate AQI values at unmonitored locations across the district map.

**FR-04** The system shall calculate Heat Index using the Rothfusz Regression formula and classify it against DOSH categories (Safe / Category 1 / Category 2 / STOP WORK).

**FR-05** The system shall display a 2D Leaflet map with district markers, impact polygons, and sensor pin visualisations.

**FR-06** The system shall display a 3D digital twin via MapLibre GL with building extrusions, wind particle simulation, and Gaussian pollution plume animation.

**FR-07** The system shall render Hero Metrics cards showing current AQI, Heat Index, PM2.5, and wind speed with colour-coded risk status.

**FR-08** The system shall display a 24-hour pollutant trend chart for the selected district.

**FR-09** The system shall display a pollutant breakdown grid (PM2.5, PM10, NO2, SO2, CO, O3) with WHO/DOE limit percentage indicators.

**FR-10** The system shall generate AI compliance verdicts for five roles (Construction Operator, Government Officer, MSME, ESG Firm, DOE Auditor) via the `/api/advisor` endpoint.

**FR-11** The AI advisory engine shall include mandatory regulatory citations (OSH Act, EQA, DOSH, Bursa E1, NCAAP) and arithmetic calculations in every verdict.

**FR-12** The system shall generate a dynamic mathematical fallback advisory (no AI call) when the AI API is unavailable or `SIMULATE_LIVE_INFERENCE` is set.

**FR-13** The system shall maintain an append-only, in-memory audit chain per sensor node using FNV-1a 32-bit chained hashing.

**FR-14** The system shall persist the audit chain breach counts to `./.data/scrutiny.json` on disk.

**FR-15** The system shall expose the immutable audit log via `/api/audit/log/:nodeId`, returning entries in reverse-chronological order.

**FR-16** The system shall accept corporate compliance submissions (company, zone, nodeId, date, reportedPM2.5, reportedAQI) via `/api/compliance/verify`.

**FR-17** The system shall compare submitted values against the live sensor baseline with a 20% variance threshold (tightening to 10% after 3 consecutive breaches) and return a discrepancy verdict.

**FR-18** The system shall provide a DOE escalation stub via `/api/compliance/escalate` for flagged discrepancies.

**FR-19** The system shall generate 7-day historical aggregate analytics per district via `/api/analytics/historical`.

**FR-20** The system shall provide cross-district comparison rankings via `/api/analytics/comparison`.

**FR-21** The system shall detect and classify anomalies (AQI > 100, PM2.5 > 35, NO2 > 25, Heat Index > 40) with severity levels (WARNING / CRITICAL).

**FR-22** The system shall generate a 48-hour predictive outlook via `/api/predict`, including hourly risk bands and chain-of-thought arithmetic.

**FR-23** The system shall generate IFRS S1/S2-aligned ESG compliance narratives via `POST /api/analytics/esg`.

**FR-24** The system shall export ESG/Bursa reports as PDF using html2canvas + jsPDF.

**FR-25** The system shall export audit logs as downloadable text files.

**FR-26** The system shall cache sensor and AI responses in-memory (node-cache) with a 2-minute default TTL and a 15-minute TTL for historical shape data.

**FR-27** The system shall support district selection from 50 predefined Malaysian districts across six regions (CENTRAL, NORTHERN, SOUTHERN, EAST COAST, SARAWAK, SABAH).

**FR-28** The system shall display real-time alert banners when sensor readings exceed configured thresholds.

**FR-29** The system shall allow threshold configuration via `/api/config/thresholds` (GET/POST).

**FR-30** The system shall display a WorkerGrid with occupational risk assessment per construction workforce category.
