# Audit Trail Documentation

## EnviroPulse — Immutable Audit Chain

**Version:** 1.0  
**Date:** 2026-05-15  

---

## 1. Purpose

The audit chain provides a tamper-evident, append-only record of sensor readings per monitoring node. It is designed to support DOE auditors in verifying that corporate environmental self-reports were not submitted during periods when sensor readings were elevated.

---

## 2. Hash Algorithm

**Algorithm:** FNV-1a (Fowler–Noll–Vo) 32-bit  
**Input format (concatenated string):**

```
nodeId|timestamp|pm25|aqi|heat|prevHash|escalationTag
```

**Output:** 8-character hexadecimal string

**Note:** FNV-1a is not cryptographically secure. It provides tamper *detection* in a trusted environment but is not suitable for adversarial tamper *resistance*. See `docs/07-security/security-review.md` for planned upgrade path.

---

## 3. Chain Structure

Each entry contains:

| Field | Type | Description |
|---|---|---|
| ts | ISO 8601 timestamp | When the reading was recorded |
| pm25 | Float | PM2.5 µg/m³ |
| aqi | Float | Composite AQI |
| heat | Float | Heat Index °C |
| hash | 8-char hex | FNV-1a hash of this entry's data |
| prevHash | 8-char hex | Hash of the immediately preceding entry |
| escalationTag | String / null | DOE escalation flag if applicable |
| seqIndex | Integer | Position in the chain (0 = genesis) |

**Genesis entry:** `prevHash = "00000000"`. Auto-created on first access for a new node.

---

## 4. Verification Procedure

To verify the integrity of an audit chain:

1. Retrieve the chain via `GET /api/audit/log/:nodeId`
2. Reverse the returned array (API returns newest-first; chain is oldest-first)
3. For entry at index 0: verify `prevHash == "00000000"`
4. For each subsequent entry N: verify `entry[N].prevHash == entry[N-1].hash`
5. For each entry: recompute `FNV-1a("nodeId|ts|pm25|aqi|heat|prevHash|escalationTag")` and compare to stored `hash`

Any mismatch indicates the chain was modified after recording.

---

## 5. Persistence

- Breach counts are persisted to `./.data/scrutiny.json`
- The full in-memory chain is rebuilt on server restart using the persisted breach count as context
- The chain itself is in-memory in v1 — a server restart resets chain entries (breach count survives)

**Phase 4 improvement:** Persist full chain entries to a database for cross-restart integrity.

---

## 6. DOE Escalation Tagging

When a discrepancy is escalated via `POST /api/compliance/escalate`, the relevant audit chain entry receives an `escalationTag` marking it as flagged for regulatory review. This tag becomes part of the hash input for all subsequent entries, making the escalation tamper-evident within the chain.

---

## 7. Export

Auditors can download the full audit log as a text file from the Sensors page. The exported file contains all fields in the order defined in section 3, suitable for offline verification.
