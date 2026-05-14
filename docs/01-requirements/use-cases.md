# Use Case Table

## EnviroPulse — System Use Cases

**Version:** 1.0  
**Date:** 2026-05-15  

---

| UC# | Use Case | Actor | Trigger | Main Flow Summary | Alternate / Exception |
|---|---|---|---|---|---|
| UC-01 | View Real-Time District Metrics | All Roles | Select district from header dropdown | System fetches Open-Meteo + AQICN data → IDW interpolation → render HeroMetrics, PollutantGrid, TrendChart | API unavailable → serve Malaysian baseline defaults (31°C, AQI 45, PM2.5 12) |
| UC-02 | View 2D District Map | All Roles | Click "2D Map" toggle | Leaflet renders markers at lat/lng → AQI impact polygons overlaid → user clicks markers to inspect node detail | Sensor coordinates missing → marker omitted |
| UC-03 | View 3D Urban Digital Twin | All Roles | Click "3D View" toggle | MapLibre GL loads building extrusions → wind particles animated → pollution plume drifts → optional heatmap overlay | WebGL not supported → fallback to 2D map |
| UC-04 | Get AI Compliance Advisory | Any Role User | Select role tab in AIAdvisory panel | POST `/api/advisor` with role + sensor data → AI generates verdict with regulatory citations → display in role card | AI API timeout → display dynamic mathematical fallback verdict |
| UC-05 | Get 48-Hour Predictive Outlook | All Roles | Navigate to Analytics → Prediction tab | POST `/api/predict` with role + district data → AI returns hourly risk bands + chain-of-thought → display timeline chart | Cache hit → serve cached prediction (TTL 1h) |
| UC-06 | Submit Corporate Compliance Report | MSME / ESG Firm | Fill compliance form on Compliance page | Input company/zone/nodeId/date/reportedPM2.5/reportedAQI → POST `/api/compliance/verify` → compute variance → return PASS/FAIL/DISCREPANCY | 3+ consecutive breaches → threshold auto-tightens to 10% |
| UC-07 | Review Audit Chain | DOE Auditor | Select node on Sensors page | GET `/api/audit/log/:nodeId` → display entries with FNV-1a hashes → user verifies hash chain integrity | Genesis entry missing → auto-create baseline |
| UC-08 | Escalate Discrepancy to DOE | DOE Auditor | Click "Escalate" on a failed submission | POST `/api/compliance/escalate` with submission ID → stub registers escalation → confirm message displayed | Stub only — no live DOE integration in v1 |
| UC-09 | View 7-Day Historical Analytics | All Roles | Navigate to Analytics → Historical tab | GET `/api/analytics/historical` → render aggregate stats + trend lines per pollutant | No data for district → display "Insufficient data" |
| UC-10 | Compare Districts | Government Officer | Navigate to Analytics → Comparison tab | GET `/api/analytics/comparison` → render cross-district ranking table sorted by AQI/PM2.5 | Only 1 district available → disable comparison |
| UC-11 | Detect Anomalies | Government / DOE Auditor | Navigate to Analytics → Anomalies tab | GET `/api/analytics/anomalies` → threshold breach detection → display classified anomaly list (WARNING/CRITICAL) | No breaches → display "All nominal" |
| UC-12 | Generate ESG / Bursa Report | ESG Firm / MSME | Click "Generate Report" on Reports page | POST `/api/analytics/esg` with district context → AI returns IFRS S1/S2 narrative → render in BursaReportModal | AI unavailable → display fallback ESG template |
| UC-13 | Export Report as PDF | ESG Firm / MSME | Click "Export PDF" in report modal | html2canvas captures modal DOM → jsPDF encodes → browser downloads PDF | Canvas render error → alert user |
| UC-14 | Export Audit Log | DOE Auditor | Click "Download Log" on Sensors page | Audit entries serialised to text → browser download triggered | No entries → export empty file with header |
| UC-15 | Receive Alert Notification | All Roles | Sensor reading crosses threshold | AlertBanner rendered in Dashboard header → optional WhatsApp notification (stub) | WhatsApp API not configured → banner only |
| UC-16 | Configure Thresholds | System Admin | POST `/api/config/thresholds` | New AQI/PM2.5/heat thresholds saved → all downstream comparisons use updated values | Invalid values → return 400 validation error |
| UC-17 | View WorkerGrid Risk Assessment | Construction Operator | View Dashboard, WorkerGrid section | Worker categories rendered with heat-index risk level per category → work-rest cycle displayed | No heat data → display "Data unavailable" |
| UC-18 | Toggle Ghost Mode on 3D Map | All Roles | Click "Ghost Mode" button in 3DView | Building opacity reduced → internal structure visible → heatmap overlay toggles | — |
| UC-19 | Switch District Region | All Roles | Select region filter in header | District list filtered by CENTRAL/NORTHERN/etc. → map re-centres → data refresh triggered | — |
| UC-20 | View ESG Compliance Stats | ESG Firm / Bursa Compliance | Navigate to Analytics → ESG Stats tab | GET `/api/analytics/esg-stats` → render pm25Compliance %, doeCompliance %, heatSafeDays | — |
