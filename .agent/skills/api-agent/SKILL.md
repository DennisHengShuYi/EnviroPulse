---
name: api-agent
description: Upstream data retrieval, caching strategies, georeferencing, rate-limiting insulation, error recovery, and continuous data conversion pipelines.
risk: low
source: workspace
---

# API Agent Skill: Upstream Integration & Conversion Pipelines

This skill encodes the data ingestion, resilient routing, and real-time continuous metric conversion workflows for the EnviroPulse platform. Use this skill to manage upstream API client code, caching layers, mathematical transformations, and HTTP failure recovery loops.

## 1. Upstream Data Sources & Integration Topology

The system aggregates environmental telemetry across three distinct REST endpoints, decoupled into high-frequency localized requests and low-frequency batch analytical arrays:

### Open-Meteo Weather API (`/v1/forecast`)
- **Target**: Fetches real-time thermodynamic state data using geographic coordinates.
- **Parameters**: `temperature_2m`, `relative_humidity_2m`, `wind_speed_10m`, `wind_direction_10m`, `uv_index`.
- **Timeout**: Enforces an explicit 5000ms `AbortController` boundary.

### Open-Meteo Air Quality API (`/v1/air-quality`)
- **Target**: Serves batch historical parameters and acts as a secondary localized real-time fallback source.
- **Parameters**: `us_aqi`, `pm2_5`, `pm10`, `nitrogen_dioxide`, `sulphur_dioxide`, `carbon_monoxide`, `ozone`.
- **Historical Payload**: Retrieves 24-hour diurnal trend shapes and 7-day multi-period baselines.

### AQICN / WAQI REST Network (`/feed/geo:lat;lng/`)
- **Target**: Primary upstream engine for localized station-level particulate indices and individual pollutant arrays.
- **Authentication**: Secured via the `AQICN_TOKEN` environment parameter.
- **Payload Extraction**: Parses global integer AQI structures alongside individual gas component mass concentrations embedded inside the `iaqi` node.

---

## 2. Mathematical Conversion Pipelines

To insulate downstream consumers from raw format variations, incoming payload streams undergo immediate canonical normalization:

### Rothfusz Heat Index Transformation
Ambient raw temperatures ($T$ in Celsius) are converted to Fahrenheit ($T_f$) and mapped against relative humidity ($RH$) percentages via the standard regression formula:

$$HI = -42.379 + 2.04901523 \cdot T_f + 10.14333127 \cdot RH - 0.22475541 \cdot T_f \cdot RH - 0.00683783 \cdot T_f^2 - 0.05481717 \cdot RH^2 + 0.00122874 \cdot T_f^2 \cdot RH + 0.00085282 \cdot T_f \cdot RH^2 - 0.00000199 \cdot T_f^2 \cdot RH^2$$

- **Low-Humidity Corrections**: If $RH < 13\%$ and $T_f \in [80, 112]$, applies a localized downward adjustment.
- **High-Humidity Corrections**: If $RH > 85\%$ and $T_f \in [80, 87]$, applies an empirical upward scaling vector.
- **Safety Boundary**: Enforces $HI \ge T_f$ prior to re-converting the finalized output into standard Celsius metrics.

### US EPA Breakpoint Interpolation
Converts continuous mass concentration feeds ($PM_{2.5}$ in $\mu\text{g/m}^3$) into discrete air quality index bands using piecewise linear scaling:

$$AQI = \text{round}\left(\frac{AQI_{high} - AQI_{low}}{PM_{high} - PM_{low}} \cdot (PM_{2.5} - PM_{low}) + AQI_{low}\right)$$

- **Breakpoints**: 
  - $[0.0, 12.0] \rightarrow [0, 50]$ (Good)
  - $[12.1, 35.4] \rightarrow [51, 100]$ (Moderate)
  - $[35.5, 55.4] \rightarrow [101, 150]$ (Unhealthy for Sensitive Groups)
  - $[55.5, 150.4] \rightarrow [151, 200]$ (Unhealthy)
  - $[150.5, 250.4] \rightarrow [201, 300]$ (Very Unhealthy)
  - $[250.5, 500.4] \rightarrow [301, 500]$ (Hazardous)

---

## 3. Resilience, Caching & Fallback Workflows

To avoid silent backend hangs or UI thread blocking under adverse networking conditions, the API integration tier enforces non-blocking read paths:

```
[Upstream Request Triggered]
         │
         ├───► Check NodeCache (stdTTL: 120s live / 900s historical)
         │          ├───► Cache Hit: Return immediately
         │          └───► Cache Miss: Dispatch fetch with AbortSignal
         │
         └───► Execute Promise Timeout Race (5000ms / 8000ms boundaries)
                    ├───► HTTP 200 OK: Commit to NodeCache & return payload
                    └───► HTTP 429 / Abort / Network Drop: Trigger Active Fallback Engine
```

### Active Fallback Parameters
When external network pipes degrade, the system bypasses external nodes to emit guaranteed continuous internal metrics tailored for equatorial environments:
- **Base Values**: Ambient Temp $31.0^\circ\text{C}$, Relative Humidity $80\%$, Baseline $PM_{2.5}$ $15.0\,\mu\text{g/m}^3$.
- **Diurnal White Noise Jitter**: Injects controlled white noise arrays ($T_{base} + \text{rand}(-0.2, 0.2)$) to ensure front-end polling animations remain fully active and responsive without rendering zero-state placeholders.

---

## 4. Operational Instructions for API Agent Tasks

When updating upstream fetchers, adding proxy layers, or adjusting API timeouts, ensure strict adherence to the following execution constraints:
1. **Never block the event loop**: Maintain absolute isolation of data fetching promises. Use `Promise.allSettled` or safe parallel catch structures when reading multiple upstream targets.
2. **Preserve cache boundaries**: Do not cache real-time base station selections longer than 120 seconds. Historical shape payloads must remain cached independently from active station coordinate shifts.
3. **Log external state errors clearly**: Catch blocks must log explicit status codes (`[API_ERROR] returned HTTP 429`) before shifting downstream processing execution to local fallback generators.
