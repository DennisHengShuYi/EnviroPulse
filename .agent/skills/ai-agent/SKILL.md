---
name: ai-agent
description: LLM inference orchestration, prompt constraints engineering, schema boundary enforcement, fallback generation, and role-scoped structured JSON extraction.
risk: low
source: workspace
---

# AI Agent Skill: Inference Engine & Structured Regulatory Synthesis

This skill manages the orchestration of large language models, explicit prompt constraint engineering, role-scoped structured schema validation, and automatic failover fallback generation. Use this skill when modifying AI endpoints, tweaking prompt contexts, or validating response schemas.

## 1. Upstream Inference Orchestration Layer

The integration tier routes requests to custom OpenAI-compatible completions endpoints (e.g., `api.ilmu.ai/v1` executing specialized reasoning models like `ilmu-glm-5.1` or Anthropic SDK equivalents) via dedicated controller endpoints:
- `/api/predict`: Evaluates 24-hour localized forecasts to emit granular preventative mitigation matrices.
- `/api/advisor`: Synthesizes current thermal and air quality metrics into absolute operational verdicts.
- `/api/analytics/esg`: Computes localized enterprise readiness scores against multijurisdictional framework requirements.

---

## 2. Mandatory Prompt Engineering Constraints

To ensure generated outputs are deterministic, auditable, and legally solid, prompts dispatched to the LLM must enforce three absolute execution constraints:

### Numeric Anchoring
Outputs must embed literal numbers parsed directly from live station telemetry strings. Vague generalizations (e.g., "high temperatures are expected") are rejected. Prompts explicitly demand formatting structured as:
> *"With ambient temperatures recorded at exactly 33.5°C and particulate levels at 42.0 µg/m³..."*

### Statutory Citations
Inference blocks must cite valid localized legal frameworks to support recommended actions. Prompts inject exact textual constraints requiring explicit references to:
- **Occupational Safety and Health (Amendment) Act 2024** Section 15(2).
- **Environmental Quality Act (EQA) 1974** Section 22.
- **Department of Occupational Safety and Health (DOSH)** Thermal Comfort Guidelines.
- **Bursa Malaysia** Enhanced Sustainability Disclosure Requirements (Listing Circular E1).

### Chain-of-Thought (CoT) Arithmetic Validation
Inference models are instructed to output their internal reasoning logic as explicit arithmetic steps inside CoT arrays, verifying percentage calculations of permissible pollutant thresholds prior to emitting plain-text recommendations.

---

## 3. Role-Scoped Schema Extraction Targets

To avoid payload truncation and prevent single responses from exhausting context windows, inference controllers parse incoming requests based on targeted stakeholder roles (`requestedRole`), matching output extraction precisely to **5 isolated JSON schemas**:

### `construction` Schema
- `isFallback`: boolean
- `riskLevel`: string (`LOW` | `MODERATE` | `HIGH` | `EXTREME`)
- `complianceVerdict`: string
- `submissionAlert`: string
- `specificAction`: string
- `regulatoryCitation`: string
- `chainOfThought`: array of strings
- `siteActions`: array of strings
- `detailedAnalysis`: string
- `technicalReasoning`: string
- `healthRiskBreakdown`: `{ heatStress: string, respiratoryRisk: string, complianceExposure: string }`
- `bursaE1Status`: string
- `workRestCycle`: string
- `safetyPPE`: string

### `government` Schema
- `isFallback`: boolean
- `riskLevel`: string
- `complianceVerdict`: string
- `specificAction`: string
- `regulatoryCitation`: string
- `chainOfThought`: array of strings
- `detailedAnalysis`: string
- `technicalReasoning`: string
- `healthRiskBreakdown`: object
- `districtStatus`: string
- `escalationDecision`: string
- `policyAction`: string
- `ncaapScore`: number
- `ncaapContext`: string
- `publicStatus`: string
- `populationAtRisk`: string
- `policyTrigger`: string
- `emergencyProtocol`: string
- `infrastructureImpact`: string
- `escalationContact`: string

### `msme` Schema
- `isFallback`: boolean
- `riskLevel`: string
- `complianceVerdict`: string
- `specificAction`: string
- `regulatoryCitation`: string
- `chainOfThought`: array of strings
- `detailedAnalysis`: string
- `technicalReasoning`: string
- `bursaIndicator`: string
- `plainVerdict`: string
- `submissionRisk`: string (`LOW` | `ELEVATED` | `HIGH`)
- `preSubmissionAction`: string

### `esgFirm` Schema
- `isFallback`: boolean
- `riskLevel`: string
- `complianceVerdict`: string
- `specificAction`: string
- `regulatoryCitation`: string
- `chainOfThought`: array of strings
- `detailedAnalysis`: string
- `readinessScore`: number
- `complianceRating`: string
- `gri305Gap`: string
- `tcfdFlag`: string
- `investorMateriality`: string
- `environmentalPerformance`: string
- `mitigationStrategy`: string
- `regulatoryContext`: string

### `doeAuditor` Schema
- `isFallback`: boolean
- `riskLevel`: string
- `complianceVerdict`: string
- `specificAction`: string
- `regulatoryCitation`: string
- `chainOfThought`: array of strings
- `detailedAnalysis`: string
- `verificationStatus`: string (`CLEAN` | `FLAGGED`)
- `eqaAssessment`: string
- `discrepancySignal`: string
- `evidenceChainRef`: string

---

## 4. Fail-Safe Dynamic Fallback Engines

When upstream AI API endpoints drop connections, time out past 55 seconds, or return un-parseable syntax, the system intercepts execution to return guaranteed high-fidelity static JSON schemas.

```
[Inference Triggered] ──► Timeout / HTTP Error ──► Intercept Execution ──► Return Scoped Fallback Schema
```

Fallback payloads inject localized valid statutory parameters and consistent hash credentials matching the exact shape expected by frontend deserializers, ensuring zero screen crashing or interface rendering artifacts during service outages.

---

## 5. Execution Rules for AI Agent Modifiers

When updating AI system messages, modifying JSON extractors, or altering context windows, respect these boundaries:
1. **Enforce valid JSON parsing**: Never rely on free-form conversational streams. Ensure all endpoints invoke explicit `response_format` JSON enforcement or strict regex block filtering before passing payloads to front-end layers.
2. **Preserve schema isolation**: Do not merge properties from the `government` schema into `construction` payloads. Keep payload sizes optimized for fast mobile client delivery.
3. **Validate fallback models**: If schema parameters change, ensure fallback mock objects inside `server/index.js` are updated synchronously to prevent property resolution errors.
