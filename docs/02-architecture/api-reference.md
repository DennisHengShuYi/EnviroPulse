# API Reference

## EnviroPulse — Backend Endpoints

**Version:** 1.0  
**Base URL:** `http://localhost:3001`  
**Date:** 2026-05-15  

---

## District & Sensor

### GET /api/districts
Returns all 50 predefined Malaysian monitoring districts.

**Response:** Array of `{ id, name, lat, lng, type, region }`

---

### GET /api/sensors
Returns current sensor readings for the selected district.

**Query params:** `?district=<id>`  
**Response:** `{ id, name, type, lat, lng, metrics: { heatIndex, aqi, temp, pm25 }, pollutants, systemStatus }`

---

### GET /api/trends
Returns 24-hour historical trend data for a district.

**Query params:** `?district=<id>`  
**Response:** Array of `{ ts, aqi, pm25, temp, heatIndex }`

---

### GET /api/alerts
Returns active threshold breaches.

**Query params:** `?district=<id>`  
**Response:** Array of `{ parameter, value, severity, nodeId, triggeredAt }`

---

## Analytics

### GET /api/analytics/historical
7-day aggregate stats per district.

**Query params:** `?district=<id>`

---

### GET /api/analytics/comparison
Cross-district ranking sorted by AQI/PM2.5.

---

### GET /api/analytics/anomalies
Threshold breach detection with severity classification.

**Query params:** `?district=<id>`  
**Thresholds:** AQI > 100, PM2.5 > 35, NO2 > 25, Heat Index > 40

---

### GET /api/analytics/thresholds
Current WHO/DOE limit comparisons for the district.

---

### GET /api/analytics/esg-stats
ESG compliance metrics.

**Response:** `{ pm25Compliance: %, doeCompliance: %, heatSafeDays: N }`

---

### POST /api/analytics/esg
Generate IFRS S1/S2-aligned ESG compliance narrative.

**Body:** `{ district, sensorData }`  
**Response:** Full ESG narrative text with GRI 305-7 and Bursa E1 references.

---

## AI Inference

### POST /api/advisor
Generate AI compliance verdict for a specific role.

**Body:**
```json
{
  "role": "construction | government | msme | esgFirm | doeAuditor",
  "district": "district-id",
  "sensorData": { "aqi": 0, "pm25": 0, "heatIndex": 0, "temp": 0 }
}
```

**Response:** Role-specific verdict object including `riskLevel`, `complianceVerdict`, `specificAction`, `regulatoryCitation`, `chainOfThought[]`, `healthRiskBreakdown`, `bursaE1Status`.

---

### POST /api/predict
Generate 48-hour predictive compliance outlook.

**Body:** Same as `/api/advisor`  
**Response:** `{ predictedEvents[], hourlyOutlook[], chainOfThought[] }`

---

## Compliance Verification

### POST /api/compliance/verify
Compare a corporate submission against live sensor baseline.

**Body:**
```json
{
  "company": "string",
  "zone": "string",
  "nodeId": "string",
  "date": "YYYY-MM-DD",
  "reportedPm25": 0.0,
  "reportedAqi": 0.0
}
```

**Response:** `{ result: "PASS|FAIL|DISCREPANCY", pm25Variance, aqiVariance, threshold, breachCount }`

---

### POST /api/compliance/escalate
Escalate a discrepancy to DOE (stub in v1).

**Body:** `{ submissionId }`  
**Response:** `{ status: "registered", message }`

---

## Audit

### GET /api/audit/log/:nodeId
Returns the immutable FNV-1a chained audit log for a sensor node in reverse-chronological order.

**Response:** Array of `{ ts, pm25, aqi, heat, hash, prevHash, escalationTag, seqIndex }`

---

## Configuration

### GET /api/config/thresholds
Retrieve current system thresholds.

---

### POST /api/config/thresholds
Update system thresholds.

**Body:** `{ aqi: { warn, crit }, pm25: { warn, crit }, heatIndex: { warn, crit } }`  
**Response:** `{ updated: true }` or `400` on invalid values.
