# Entity-Relationship Diagram (ERD)

## EnviroPulse — Logical Data Model

**Version:** 1.0  
**Date:** 2026-05-15  

> Note: The current v1 implementation stores most entities in-memory or as JSON.
> This ERD represents the logical model. Columns map directly to object shapes
> used in the Express routes and React components.

---

## Entities & Attributes

### DISTRICT
| Column | Type | Notes |
|---|---|---|
| id | VARCHAR | PK |
| name | VARCHAR | e.g. "Kuala Lumpur" |
| lat | DECIMAL(9,6) | |
| lng | DECIMAL(9,6) | |
| type | ENUM | Urban core, Industrial, Suburban, Planned city, Transport hub, Tourist hub |
| region | ENUM | CENTRAL, NORTHERN, SOUTHERN, EAST COAST, SARAWAK, SABAH |

### SENSOR_NODE
| Column | Type | Notes |
|---|---|---|
| id | VARCHAR | PK |
| districtId | VARCHAR | FK → DISTRICT.id |
| name | VARCHAR | |
| type | VARCHAR | |
| lat | DECIMAL(9,6) | |
| lng | DECIMAL(9,6) | |
| region | VARCHAR | |
| systemStatus | JSON | feed, sync, activeNode flags |

### SENSOR_READING
| Column | Type | Notes |
|---|---|---|
| id | SERIAL | PK |
| nodeId | VARCHAR | FK → SENSOR_NODE.id |
| ts | TIMESTAMP | Reading timestamp |
| heatIndex | FLOAT | °C, Rothfusz calculated |
| aqi | FLOAT | Composite AQI |
| tempC | FLOAT | |
| tempF | FLOAT | |
| rh | FLOAT | Relative humidity % |
| uv | FLOAT | UV index |
| wind | FLOAT | km/h |
| windDir | FLOAT | degrees |
| pm25 | FLOAT | µg/m³ |
| pm10 | FLOAT | µg/m³ |
| no2 | FLOAT | µg/m³ |
| so2 | FLOAT | µg/m³ |
| co | FLOAT | µg/m³ |
| o3 | FLOAT | µg/m³ |

### AUDIT_CHAIN_ENTRY
| Column | Type | Notes |
|---|---|---|
| id | SERIAL | PK |
| nodeId | VARCHAR | FK → SENSOR_NODE.id |
| ts | TIMESTAMP | Entry timestamp |
| pm25 | FLOAT | |
| aqi | FLOAT | |
| heat | FLOAT | |
| hash | CHAR(8) | FNV-1a 32-bit of this entry |
| prevHash | CHAR(8) | Hash of previous entry (chain link) |
| escalationTag | VARCHAR | Nullable — DOE escalation flag |
| seqIndex | INTEGER | Position in chain |

### COMPLIANCE_SUBMISSION
| Column | Type | Notes |
|---|---|---|
| id | SERIAL | PK |
| nodeId | VARCHAR | FK → SENSOR_NODE.id |
| districtId | VARCHAR | FK → DISTRICT.id |
| company | VARCHAR | |
| zone | VARCHAR | |
| submissionDate | DATE | |
| reportedPm25 | FLOAT | Corporate self-reported value |
| reportedAqi | FLOAT | Corporate self-reported value |
| reportedStatus | VARCHAR | |
| submittedAt | TIMESTAMP | |

### COMPLIANCE_VERDICT
| Column | Type | Notes |
|---|---|---|
| id | SERIAL | PK |
| submissionId | INTEGER | FK → COMPLIANCE_SUBMISSION.id |
| sensorPm25 | FLOAT | Live baseline at time of check |
| sensorAqi | FLOAT | Live baseline at time of check |
| pm25Variance | FLOAT | % deviation |
| aqiVariance | FLOAT | % deviation |
| varianceThreshold | FLOAT | 20% standard, 10% after 3 breaches |
| result | ENUM | PASS, FAIL, DISCREPANCY |
| breachCount | INTEGER | Consecutive breach count for this node |
| verifiedAt | TIMESTAMP | |

### AI_ADVISORY
| Column | Type | Notes |
|---|---|---|
| id | SERIAL | PK |
| districtId | VARCHAR | FK → DISTRICT.id |
| role | ENUM | construction, government, msme, esgFirm, doeAuditor |
| riskLevel | ENUM | LOW, MODERATE, HIGH, EXTREME |
| isFallback | BOOLEAN | True if dynamic fallback was used |
| complianceVerdict | TEXT | |
| specificAction | TEXT | |
| regulatoryCitation | TEXT | |
| chainOfThought | JSON | Array of reasoning steps with arithmetic |
| healthRiskBreakdown | JSON | heatStress, respiratoryRisk, complianceExposure |
| bursaE1Status | VARCHAR | |
| generatedAt | TIMESTAMP | |
| ttlExpiry | TIMESTAMP | Mirrors node-cache TTL |

### SYSTEM_THRESHOLD
| Column | Type | Notes |
|---|---|---|
| id | SERIAL | PK |
| parameter | VARCHAR | e.g. pm25, aqi, heatIndex |
| warnValue | FLOAT | Warning trigger level |
| critValue | FLOAT | Critical trigger level |
| unit | VARCHAR | µg/m³, °C, etc. |
| source | VARCHAR | WHO, DOE, DOSH |
| updatedAt | TIMESTAMP | |

### ALERT
| Column | Type | Notes |
|---|---|---|
| id | SERIAL | PK |
| districtId | VARCHAR | FK → DISTRICT.id |
| nodeId | VARCHAR | FK → SENSOR_NODE.id |
| thresholdId | INTEGER | FK → SYSTEM_THRESHOLD.id |
| parameter | VARCHAR | |
| value | FLOAT | Reading that triggered the alert |
| severity | ENUM | WARNING, CRITICAL |
| triggeredAt | TIMESTAMP | |
| resolvedAt | TIMESTAMP | Nullable |

---

## Relationships

```
DISTRICT ──< SENSOR_NODE       (1 district has many sensor nodes)
SENSOR_NODE ──< SENSOR_READING (1 node has many time-series readings)
SENSOR_NODE ──< AUDIT_CHAIN_ENTRY  (1 node has an append-only chain)
DISTRICT    ──< COMPLIANCE_SUBMISSION
SENSOR_NODE ──< COMPLIANCE_SUBMISSION
COMPLIANCE_SUBMISSION ──|| COMPLIANCE_VERDICT  (1-to-1 result)
DISTRICT    ──< AI_ADVISORY    (scoped to district + role)
DISTRICT    ──< ALERT
SENSOR_NODE ──< ALERT
SYSTEM_THRESHOLD ──< ALERT
```

---

## ERD (Text Diagram)

```
┌─────────────┐         ┌──────────────────┐        ┌───────────────────┐
│  DISTRICT   │1       N│  SENSOR_NODE     │1      N│  SENSOR_READING   │
│─────────────│────────▶│──────────────────│───────▶│───────────────────│
│ PK id       │         │ PK id            │        │ PK id             │
│ name        │         │ FK districtId    │        │ FK nodeId         │
│ lat / lng   │         │ name / type      │        │ ts, heatIndex     │
│ type        │         │ lat / lng        │        │ aqi, tempC, rh    │
│ region      │         │ region           │        │ pm25..o3          │
└─────────────┘         │ systemStatus     │        └───────────────────┘
       │                └──────────────────┘
       │                        │ 1
       │1                       │ has many
       │                        │ N
       │              ┌─────────▼──────────┐
       │              │ AUDIT_CHAIN_ENTRY  │
       │              │────────────────────│
       │              │ PK id              │
       │              │ FK nodeId          │
       │              │ ts, pm25, aqi, heat│
       │              │ hash, prevHash     │
       │              │ escalationTag      │
       │              └────────────────────┘
       │
       │1       N┌────────────────────────┐     1┌──────────────────────┐
       └────────▶│ COMPLIANCE_SUBMISSION  │──────▶│ COMPLIANCE_VERDICT   │
                 │────────────────────────│       │──────────────────────│
                 │ PK id                  │       │ PK id                │
                 │ FK districtId, nodeId  │       │ FK submissionId      │
                 │ company, zone          │       │ sensorPm25, sensorAqi│
                 │ reportedPm25, Aqi      │       │ variance, threshold  │
                 │ submittedAt            │       │ result, breachCount  │
                 └────────────────────────┘       └──────────────────────┘

┌──────────────────────┐     ┌─────────────────────┐     ┌───────────────┐
│    AI_ADVISORY       │     │       ALERT          │     │ SYS_THRESHOLD │
│──────────────────────│     │─────────────────────│     │───────────────│
│ PK id                │     │ PK id               │     │ PK id         │
│ FK districtId        │     │ FK districtId       │     │ parameter     │
│ role, riskLevel      │     │ FK nodeId           │     │ warnValue     │
│ isFallback           │     │ FK thresholdId ─────┼────▶│ critValue     │
│ complianceVerdict    │     │ severity            │     │ unit, source  │
│ chainOfThought (JSON)│     │ triggeredAt         │     └───────────────┘
│ ttlExpiry            │     │ resolvedAt          │
└──────────────────────┘     └─────────────────────┘
```
