---
name: frontend-agent
description: UI rendering pipelines, client state management, interactive geospatial mapping, lazy-loaded rendering optimization, and administrative workflow integration.
risk: low
source: workspace
---

# Frontend Agent Skill: Client Sync, Geospatial Rendering & Scoped Intelligence

This skill governs the UI application state layer, multi-station rendering maps, charting animations, single-role lazy-loaded tab interactions, and automated PDF compliance reports. Use this skill when modifying React components, optimizing render loops, updating styling tokens, or integrating web components.

## 1. Client Synchronization & State Architecture

The frontend client relies on decoupled update loops to prevent thread blocking and UI stutter during data refreshes:

```
[Global Active District Context] ──┬──► High-Frequency Loop (Local Station Telemetry: 10s intervals)
                                   └──► Low-Frequency Loop (Regional Aggregates / Shapes: 3m intervals)
```

- **Global District State**: Maintained centrally to drive reactive UI updates across all secondary view wrappers (`AlertsPage`, `ReportsPage`, `MapHero`).
- **Status Indicator (`isLive`)**: Displays real-time operational state metrics inside the top navigational headers, communicating when the platform falls back to cached baseline profiles during external upstream network drops.

---

## 2. Geospatial Rendering & Chart Integration

The interface blends interactive map projections with diurnally translated thermodynamic graphs:

### MapLibre-GL / Leaflet Mapping Components (`MapHero.jsx`)
- **Integration Layer**: Consumes static regional bounding boxes alongside real-time coordinate arrays fetched via `/api/sensors`.
- **Dynamic Overlays**: Positions localized map markers scaled dynamically to reflect physical PM2.5 concentrations and Heat Index bounds. Clicking markers triggers deep spatial detail popups without triggering global component rerenders.

### Recharts Time-Series Projections (`TrendChart.jsx`)
- **Data Binding**: Renders continuous output matrices processed by the backend's proportional scaling overlay algorithms.
- **Multi-Metric Toggling**: Provides client-side active filters allowing users to smoothly isolate continuous arrays for `AQI`, `Temperature`, and `PM2.5` diurnally tracked curves.

---

## 3. Lazy-Loaded Role-Scoped Intelligence

To maintain immediate UI responsiveness and avoid token context truncation, the main advisory interface (`AIAdvisory.jsx`) implements granular single-role lazy loading.

```
[User Selects Stakeholder Tab] ──► Dispatch Scoped Request (`/api/advisor?role=requestedRole`)
                                          │
                                          └──► Render Isolated Component Tab (Zero global re-renders)
```

- **Stakeholder Isolation**: Renders dedicated component screens for `construction`, `government`, `msme`, `esgFirm`, and `doeAuditor`.
- **On-Demand Fetching**: Instead of requesting an expensive monolithic blob containing all five schemas upon initial page load, the controller requests fine-grained single-schema target strings strictly when user interactions focus on a specific tab node.
- **Streaming State Insulators**: Displays highly customized shimmering skeletal load sequences during active LLM inference passes, guaranteeing visual stability.

---

## 4. Administrative Verification & Report Extraction

The client provides operational interfaces for environmental auditors and reporting officials:

### Interactive Verification Interface (`CompliancePage.jsx`)
- **Workflow**: Polls `/api/compliance/verify` to execute dynamic variance threshold validations.
- **Visual Alerting**: Displays reactive alert indicators if physical self-reported stack PM2.5 values deviate beyond automatically adjusted variance boundaries ($20\%$ baseline, dynamically tightening to $10\%$ upon recurrent violations).
- **Ledger Logs**: Exposes complete immutable audit histories stamped with consecutive cryptographic FNV-1a hash strings.

### Document Compilation Subsystem (`ReportsPage.jsx`)
- **PDF Generation Engine**: Leverages client-side canvas rendering pipelines powered by **html2canvas** combined with **jspdf**.
- **Automated Embedding**: Captures rendered DOM sub-trees of dynamic charts, georeferenced maps, and compliance ledger verification logs to assemble highly standardized, professional multi-page regulatory dossiers ready for immediate offline submission.

---

## 5. Execution Rules for Frontend Agent Updates

When refactoring React layouts, adding state variables, or tweaking canvas generators, enforce these constraints:
1. **Prevent unnecessary rerenders**: Ensure heavy visual blocks like `MapHero` and `TrendChart` are wrapped in `React.memo` or use isolated context selectors. Global state changes must not force reflows of live canvas surfaces.
2. **Handle empty states gracefully**: If backend fetchers return missing object nodes during edge-case fallback scenarios, components must provide beautiful defensive fallback layouts rather than allowing `TypeError` page crashes.
3. **Optimize PDF generation layout**: Ensure DOM nodes targeted by `html2canvas` enforce fixed pixel dimensions or standard web layouts to prevent output pagination truncation or blurred PDF graphic blocks.
