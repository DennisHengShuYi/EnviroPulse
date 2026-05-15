# EnviroPulse — Agent Coordination Rules

**Version:** 1.0
**Date:** 2026-05-15
**Applies to:** All agents operating in this workspace

---

## Which Skill to Load

Load only the skill that matches the current task. If a task spans multiple agents, follow the multi-agent sequencing rules below.

| Task Type | Skill to Load |
|---|---|
| AI prompts, role schemas, fallback logic, inference routing | `ai-agent` |
| Open-Meteo / AQICN fetchers, IDW, caching, heat index math | `api-agent` |
| Express routes, audit chain, compliance verify, analytics | `backend-agent` |
| React components, pages, PDF export, map rendering | `frontend-agent` |

---

## Pre-Task Protocol

Before writing any code, the agent MUST complete all of these steps and state them explicitly:

1. **Identify the requirement** — state which FR (FR-XX) or UC (UC-XX) this task maps to. If none exists, STOP and create the FR in `docs/01-requirements/functional-requirements.md` first.
2. **Read the architecture** — read the relevant section in `docs/02-architecture/` before touching any file.
3. **Check for existing code** — search the codebase for the function or component before creating a new one. Never duplicate.
4. **Confirm file placement** — verify the target file location follows the folder structure in `docs/04-development/dev-setup.md`.
5. **State the plan** — write a 3–5 bullet implementation plan before writing a single line of code. Wait for confirmation if the task is ambiguous.

---

## Traceability Requirement

Every code change must be traceable back to a documented requirement.

- Add a comment above every new function: `// FR-XX: <brief description>`
- Add a comment above every new React component: `// UC-XX: <brief description>`
- Add a comment above every regulatory threshold or formula: `// Source: <standard name e.g. DOSH 2024, WHO AQG 2021>`
- If you cannot identify a matching FR or UC — **STOP and ask** before proceeding.
- New behaviour with no FR must not be implemented. Add the FR first.

---

## Definition of Done

A task is ONLY complete when ALL of the following are true. Never mark a task done without checking each item.

**Code**
- [ ] Implements exactly the FR/UC it was assigned to — no scope creep
- [ ] No `console.log` left in production code paths
- [ ] All async functions have `try/catch` with fallback or meaningful error state
- [ ] No hardcoded threshold values — all regulatory values reference `docs/09-governance/regulatory-framework.md`
- [ ] No commented-out code left in the file

**Tests**
- [ ] Every new function has a corresponding test written using Red-Green-Refactor
- [ ] `npm test` runs clean — zero failures across the full suite
- [ ] New test covers both the happy path and the failure/fallback path
- [ ] No real external APIs called in tests — all mocked

**Documentation**
- [ ] If an API endpoint was added or changed → update `docs/02-architecture/api-reference.md`
- [ ] If a component was added → update `docs/02-architecture/component-diagram.md`
- [ ] If a regulatory threshold was added or changed → update `docs/09-governance/regulatory-framework.md`
- [ ] If a new UC flow was implemented → update `docs/01-requirements/use-cases.md`

**Commit**
- [ ] Commit message follows the convention below
- [ ] No uncommitted changes left in the working tree

---

## Commit Message Convention

**Format:** `<type>(<scope>): <description> [FR-XX]`

**Types:**

| Type | When to use |
|---|---|
| `feat` | New feature or behaviour |
| `fix` | Bug fix |
| `test` | Adding or fixing tests only |
| `docs` | Documentation changes only |
| `refactor` | Code restructure with no behaviour change |
| `chore` | Dependencies, tooling, config |

**Scope:** the agent or module affected — `backend`, `frontend`, `ai`, `api`, `audit`, `compliance`, `docs`

**Examples:**
```
feat(backend): add adaptive variance tightening to compliance verify [FR-17]
test(frontend): add HeroMetrics colour-coding unit tests [TC-27, TC-28]
fix(api): handle AQICN 429 rate limit with Malaysian baseline fallback [FR-01]
feat(ai): add doeAuditor schema validation on response parse [FR-10]
docs(backend): update api-reference for new config/thresholds endpoint [FR-29]
refactor(frontend): extract WorkerGrid heat category logic into util [FR-30]
```

---

## Multi-Agent Task Sequencing

When a task touches more than one skill, execute in this order — never in parallel:

```
1. api-agent     → confirm external data shape is correct and tested
2. backend-agent → build and test the Express route against confirmed data
3. ai-agent      → update prompt or schema only after route contract is stable
4. frontend-agent → build UI against the confirmed, tested API contract only
```

**Never build UI against an unfinished or untested endpoint.** If the backend route is not complete and passing tests, the frontend agent must wait.

---

## Regulatory Change Rule

If a task requires changing any regulatory threshold value (AQI, PM2.5, Heat Index, variance %, etc.):

1. **STOP** — do not change the value in code first.
2. Read `docs/09-governance/regulatory-framework.md` and verify the new value against the cited standard.
3. Read `docs/04-development/coding-standards.md` — Regulatory/Domain Rules section.
4. Update `docs/09-governance/regulatory-framework.md` with the new value and its source standard first.
5. Only then update the code, with a source comment: `// Source: DOSH 2024 §15(2)`
6. Commit the docs change and the code change separately.

---

## What Agents Must Never Do

- Never call real external APIs (Open-Meteo, AQICN, ilmu.ai, Anthropic) in tests
- Never alter existing audit chain entries — the chain is append-only
- Never merge schema properties across roles (e.g. `government` fields into `construction` payload)
- Never hardcode a regulatory threshold without a source comment
- Never commit with `SIMULATE_LIVE_INFERENCE` unset in the test environment
- Never create a new file without checking if the functionality already exists elsewhere
- Never skip the Pre-Task Protocol, even for "small" tasks