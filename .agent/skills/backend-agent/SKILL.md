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
