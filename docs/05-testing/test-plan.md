# Test Plan

## EnviroPulse

**Version:** 1.0  
**Date:** 2026-05-15  

---

## 1. Scope

This test plan covers functional, integration, and regulatory accuracy testing for EnviroPulse v1.0.

**In scope:**
- All API endpoints (unit + integration)
- Frontend component rendering and user flows
- Compliance verification logic
- AI advisory fallback accuracy
- Audit chain integrity
- PDF/export functionality

**Out of scope:**
- Hardware sensor testing
- DOE live escalation integration (stub in v1)
- WhatsApp notification integration (stub in v1)
- Load / performance testing at scale

---

## 2. Test Levels

### Unit Tests
- Backend utility functions: `calculateHeatIndex`, `fnv1a32`, `calculateIDW`, `adaptiveVarianceCheck`
- AI fallback generator: `generateDynamicFallback` — assert output schema matches live AI schema per role

### Integration Tests
- All Express API endpoints via supertest or equivalent
- Mock external APIs (Open-Meteo, AQICN, ilmu.ai) using recorded fixtures

### End-to-End Tests
- User flows: district selection → metric display → AI advisory → compliance submission → audit review → PDF export
- Critical path: compliance submission PASS / FAIL / DISCREPANCY scenarios

### Regulatory Accuracy Tests
- Manual spot-check: verify AI advisory cites correct regulation for given sensor values
- Verify Rothfusz Regression output matches DOSH category boundaries
- Verify variance threshold tightening after 3 consecutive breaches

---

## 3. Test Environment

| Environment | Purpose |
|---|---|
| Local Dev | Developer unit and integration testing |
| CI Pipeline | Automated regression on every PR (planned — Phase 4) |
| Staging | Full E2E tests before production deploy (planned — Phase 4) |

Set `SIMULATE_LIVE_INFERENCE=true` for all automated tests to avoid consuming AI API credits.

---

## 4. Pass / Fail Criteria

| Area | Pass Criterion |
|---|---|
| Heat Index Calculation | Output matches Rothfusz formula ± 0.1°C |
| IDW Interpolation | Weighted AQI within 5% of hand-calculated reference |
| Audit Chain Integrity | Hash of each entry = FNV-1a(nodeId\|ts\|pm25\|aqi\|heat\|prevHash\|tag) |
| Compliance Verdict — PASS | reportedPM2.5 within 20% of sensor baseline |
| Compliance Verdict — DISCREPANCY | reportedPM2.5 exceeds 20% variance (10% after 3 breaches) |
| AI Fallback Schema | All required role fields present and non-empty |
| PDF Export | File downloads with correct content, not corrupted |
| API Cache | Second identical request within TTL returns cached response (no external call) |
