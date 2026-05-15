---
name: backend-agent
description: Express API controller logic, persistence orchestration, dynamic diurnal trend alignment, anomaly detection matrices, and cryptographic auditing.
risk: low
source: workspace
---

# Backend Agent Skill: Core Routing, Data Shaping & Verification Ledgers

This skill governs the Express server lifecycle, localized telemetry consolidation, curve adjustment algorithms, global alert limits, and tamper-evident ledger tracking. Use this skill when modifying routes, updating backend memory engines, or fine-tuning mathematical shape overlay logic.

## 1. Controller & REST Routing Architecture

The core server application exposes functional routing nodes designed to stream real-time operational models directly to web clients and LLM context providers:

### `/api/districts`
- **Output**: Static arrays mapping primary monitoring zones across Malaysia.
- **Regions Covered**: Central (Klang Valley), Northern, Southern, East Coast, Sarawak, and Sabah hubs.

### `/api/sensors`
- **Output**: Returns real-time environment objects with nested metrics arrays including continuous numeric parameters (`temp`, `rh`, `pm25`, `heatIndex`, `aqi`) alongside overall operational state strings.

### `/api/alerts` & `/api/analytics/anomalies`
- **Logic**: Sweeps continuous incoming state blocks against pre-configured global threshold bounds:
  - `AQI_CRITICAL`: Values exceeding $100$.
  - `HEAT_INDEX_MAX`: Values exceeding $40.0^\circ\text{C}$.
  - `PM2_5_EXCEEDANCE`: Ambient baseline exceeding $35.0\,\mu\text{g/m}^3$.
  - `NO2_PEAK_LIMIT`: Gas baseline crossing $25.0\,\mu\text{g/m}^3$.
- **Output**: Structured active alerts collections returned immediately to drive critical UI notification blocks.

---

## 2. Dynamic Trend Alignment: Proportional Scaling Overlay

To prevent visible curve discontinuities when users switch monitoring stations in the front-end, the backend decouples high-frequency un-cached real-time station metrics from low-frequency cached historical trend shapes.

```
[Cached Hourly Shape Data (Low Frequency)] ──┐
                                             ├──► Compute Proportional Scalars & Offsets ──► [Continuous Smooth UI Chart Array]
[Real-Time Local Station Telemetry] ─────────┘
```

### Proportional Temperature Shifts
Calculates absolute delta values between live local sensor inputs and historical reference anchors:

$$\Delta T = T_{\text{live}} - T_{\text{shape\_anchor}}$$

Applies the derived offset uniformly across the hourly historical curve arrays to dynamically translate the visualization line while preserving diurnally correct thermodynamic profiles:

$$T_{\text{output}}(t) = T_{\text{shape}}(t) + \Delta T$$

### Scalar Particulate Curves
Computes a direct multiplicative scalar to proportionally scale baseline PM2.5 waveforms:

$$S_{\text{pm25}} = \frac{PM_{2.5,\text{live}}}{PM_{2.5,\text{shape\_anchor}}}$$

Generates adjusted historical trend arrays free of artificial step drops:

$$PM_{2.5,\text{output}}(t) = PM_{2.5,\text{shape}}(t) \cdot S_{\text{pm25}}$$

---

## 3. Cryptographic Auditing & Discrepancy Control Tier

EnviroPulse maintains an unalterable continuous ledger to provide absolute data integrity for compliance verification submissions.

### Autonomous Scrutiny Tightening (`/api/compliance/verify`)
- **Validation**: Compares self-reported physical stack emissions arrays against corresponding regional real-time telemetry strings.
- **Adaptive Control**: Monitors consecutive submission variances for each client node. Upon detecting **3 consecutive discrepancy breaches**, the internal verification engine automatically tightens the allowable percentage variance threshold from $20\%$ down to $10\%$.
- **State Persistence**: Serializes consecutive violation counts and internal security tracking to the persistent storage layer located at `./.data/scrutiny.json` to survive server execution restarts.

### Append-Only Cryptographic Hashing (FNV-1a)
To generate non-repudiable evidentiary records for the Department of Environment (DOE), every verified state record is appended to an in-memory ledger sealed with sequential 32-bit hashes:

$$\text{Hash}_{n} = \text{FNV1a}\left(\text{NodeID} \mathbin{\Vert} \text{Timestamp} \mathbin{\Vert} PM_{2.5} \mathbin{\Vert} AQI \mathbin{\Vert} \text{HeatIndex} \mathbin{\Vert} \text{Hash}_{n-1} \mathbin{\Vert} \text{EscalationTag}\right)$$

- **Algorithm**: Implements the canonical 32-bit FNV-1a basis string (`2166136261`) combined with byte multiplication (`16777619`) over UTF-8 converted payload blocks.
- **Verification Engine**: Submits certified continuous ledger slices to external verification frameworks via `/api/audit/log/:nodeId`.
- **Inter-Agency Handlers**: Triggers structural webhooks to secondary authorities via `/api/compliance/escalate` if verified threshold values cross terminal limits.

---

## 4. Execution Rules for Backend Agent Updates

When refactoring routes, updating Express middleware, or adjusting shape parameters, adhere strictly to these rules:
1. **Never alter verified ledger entries**: Existing hash chains must remain append-only. Modifying historical node entries will invalidate downstream Department of Environment verification sweeps.
2. **Ensure synchronized state access**: File read/write operations targeting `./.data/scrutiny.json` must be wrapped in safe non-blocking asynchronous wrappers to prevent corruption during high-concurrency client updates.
3. **Validate upstream input parameters**: Ensure incoming coordinates and query strings pass safe validation logic before executing downstream shape calculations or triggering hash steps.

---

## 5. Testing Requirements (Backend)

### Stack
- **Test runner:** Vitest
- **HTTP testing:** Supertest (test Express routes without a live server)
- **Mocking:** `vi.mock()` for node-cache, external fetch calls, and file I/O
- **Environment:** Always set `SIMULATE_LIVE_INFERENCE=true` — never call real AI APIs in tests

### Protocol: Red-Green-Refactor
1. Write a failing test that describes the expected behaviour of the route or function
2. Implement the minimum code to make it pass
3. Refactor without breaking the test
4. A task is NOT done until `npm test` passes with the new test included

### File Placement
```
tests/
  backend/
    routes/          ← one file per Express route group
    utils/           ← calculateHeatIndex, fnv1a32, calculateIDW, adaptiveVarianceCheck
    audit/           ← audit chain integrity tests
    compliance/      ← compliance verify and escalation tests
```

### What Must Be Tested Per Task

**Utility functions** — test every formula boundary:
- `calculateHeatIndex`: Safe / Cat 1 / Cat 2 / STOP WORK boundary values
- `fnv1a32`: determinism (same input → same output every call)
- `calculateIDW`: weighted result closer to nearest station
- `adaptiveVarianceCheck`: 20% threshold, 10% after 3 breaches, exact boundary cases

**Express routes** — for every route, test:
- Happy path: valid input → correct response shape
- Missing required field → 400 with descriptive message
- External API failure → fallback baseline returned (not 500)
- Cache hit → second identical request returns same result without external call

**Audit chain** — test:
- Genesis entry has `prevHash === "00000000"`
- `entry[N].prevHash === entry[N-1].hash` for all entries
- Tampered entry breaks chain verification

### Test Template

```js
// tests/backend/routes/compliance.test.js
// FR-16, FR-17: Corporate compliance submission and variance verification

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../../server/index.js'

describe('POST /api/compliance/verify', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns PASS when reported PM2.5 is within 20% of sensor baseline', async () => {
    const res = await request(app)
      .post('/api/compliance/verify')
      .send({ company: 'TestCo', zone: 'A1', nodeId: 'node-kl-01',
              date: '2026-05-15', reportedPm25: 12, reportedAqi: 45 })
    expect(res.status).toBe(200)
    expect(res.body.result).toBe('PASS')
  })

  it('returns DISCREPANCY when reported PM2.5 exceeds 20% variance', async () => {
    const res = await request(app)
      .post('/api/compliance/verify')
      .send({ company: 'TestCo', zone: 'A1', nodeId: 'node-kl-01',
              date: '2026-05-15', reportedPm25: 25, reportedAqi: 45 })
    expect(res.status).toBe(200)
    expect(res.body.result).toBe('DISCREPANCY')
  })

  it('returns 400 when required field is missing', async () => {
    const res = await request(app)
      .post('/api/compliance/verify')
      .send({ zone: 'A1' }) // missing company, nodeId, date, values
    expect(res.status).toBe(400)
  })
})
```

### What Must NOT Happen
- Never call real Open-Meteo, AQICN, or AI endpoints in tests — always mock `fetch`
- Never test with hardcoded threshold values — import them from the same source the route uses
- Never skip the fallback/error path — every happy path test needs a corresponding failure test