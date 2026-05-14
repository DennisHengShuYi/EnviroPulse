# Test Cases

## EnviroPulse

**Version:** 1.0  
**Date:** 2026-05-15  

---

## Backend — Utility Functions

| TC# | Function | Input | Expected Output |
|---|---|---|---|
| TC-01 | `calculateHeatIndex` | tempF=95, rh=80 | ~109°F (≈42.8°C) — STOP WORK threshold |
| TC-02 | `calculateHeatIndex` | tempF=86, rh=60 | Within Category 1 (33–38°C) |
| TC-03 | `calculateHeatIndex` | tempF=70, rh=40 | Safe — below 33°C |
| TC-04 | `fnv1a32` | "node1\|2026-01-01\|12.5\|45\|38\|00000000\|" | Deterministic 8-char hex |
| TC-05 | `fnv1a32` | Same input twice | Identical output |
| TC-06 | `calculateIDW` | 3 stations, target at known coords | Weighted result closer to nearest station |
| TC-07 | `adaptiveVarianceCheck` | reported=12, sensor=10, breachCount=0 | threshold=20% → PASS (20% within range) |
| TC-08 | `adaptiveVarianceCheck` | reported=15, sensor=10, breachCount=0 | threshold=20% → DISCREPANCY (50% over) |
| TC-09 | `adaptiveVarianceCheck` | reported=11, sensor=10, breachCount=3 | threshold=10% → DISCREPANCY (10% = boundary) |

---

## Backend — API Endpoints

| TC# | Endpoint | Method | Input | Expected Response |
|---|---|---|---|---|
| TC-10 | `/api/districts` | GET | — | Array of 50 district objects |
| TC-11 | `/api/sensors` | GET | `?district=kl` | Sensor object with metrics, pollutants |
| TC-12 | `/api/sensors` | GET | Invalid district | Fallback baseline data returned (not 500) |
| TC-13 | `/api/alerts` | GET | `?district=kl` | Array of alerts or empty array |
| TC-14 | `/api/analytics/anomalies` | GET | District with AQI=120 | Returns CRITICAL anomaly for AQI |
| TC-15 | `/api/analytics/anomalies` | GET | District with AQI=45 | Returns "All nominal" |
| TC-16 | `/api/advisor` | POST | role=construction, valid sensor data | Verdict with workRestCycle field |
| TC-17 | `/api/advisor` | POST | role=doeAuditor, valid sensor data | Verdict with cryptographic ref field |
| TC-18 | `/api/advisor` | POST | Missing role field | 400 Bad Request |
| TC-19 | `/api/predict` | POST | role=msme, valid sensor data | hourlyOutlook array with 48 entries |
| TC-20 | `/api/compliance/verify` | POST | reportedPm25=12, sensorPm25=10 | result: PASS |
| TC-21 | `/api/compliance/verify` | POST | reportedPm25=25, sensorPm25=10 | result: DISCREPANCY |
| TC-22 | `/api/compliance/verify` | POST | Missing company field | 400 Bad Request |
| TC-23 | `/api/audit/log/:nodeId` | GET | Valid nodeId | Reversed audit chain, hashes present |
| TC-24 | `/api/audit/log/:nodeId` | GET | New nodeId (no history) | Genesis entry auto-created |
| TC-25 | `/api/config/thresholds` | POST | `{ aqi: { warn: 50, crit: 100 } }` | 200 OK, updated: true |
| TC-26 | `/api/config/thresholds` | POST | `{ aqi: { warn: "bad" } }` | 400 Bad Request |

---

## Frontend — Component Rendering

| TC# | Component | Scenario | Expected Behaviour |
|---|---|---|---|
| TC-27 | HeroMetrics | AQI=155 | Card displays red/critical colour coding |
| TC-28 | HeroMetrics | AQI=45 | Card displays green/safe colour coding |
| TC-29 | AIAdvisory | API responds | Verdict card renders with all fields |
| TC-30 | AIAdvisory | API timeout | Fallback verdict shown, no blank panel |
| TC-31 | ImmutableAuditLog | 10 entries | Entries shown in reverse order, hashes visible |
| TC-32 | CompliancePage | Submit DISCREPANCY result | Verdict card shows red DISCREPANCY badge |
| TC-33 | BursaReportModal | Click Export PDF | PDF file downloaded successfully |
| TC-34 | City3DView | Toggle Ghost Mode | Building opacity changes |
| TC-35 | AlertBanner | AQI > threshold | Banner appears in header |
| TC-36 | AlertBanner | AQI returns below threshold | Banner dismisses |

---

## Audit Chain — Integrity

| TC# | Scenario | Expected |
|---|---|---|
| TC-37 | Read audit chain for node, verify first entry | prevHash = "00000000" (genesis) |
| TC-38 | Compute hash of entry N manually | Matches stored hash |
| TC-39 | Verify hash chain: entry[N].prevHash == entry[N-1].hash | True for all entries |
| TC-40 | Tamper with a stored entry value | Chain verification fails at tampered point |

---

## Regulatory Accuracy — Spot Checks

| TC# | Scenario | Expected Advisory Content |
|---|---|---|
| TC-41 | Heat Index = 41°C, role=construction | Cites OSH Act 2024 §15(2), recommends STOP WORK |
| TC-42 | PM2.5 = 45 µg/m³, role=esgFirm | Cites Bursa E1, flags WHO exceedance (45/15 = 3×) |
| TC-43 | AQI = 55, role=government | Cites EQA 1974 §22, recommends DOE notification |
| TC-44 | PM2.5 = 12 µg/m³, AQI = 40, all thresholds clear | riskLevel = LOW for all roles |
