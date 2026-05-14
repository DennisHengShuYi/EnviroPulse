# CI/CD Pipeline

## EnviroPulse

**Version:** 1.0 (Planned — Phase 4)  
**Date:** 2026-05-15  

---

## Current State

CI/CD pipeline is not yet implemented. All builds and deployments are manual.

---

## Planned Pipeline (GitHub Actions)

### Trigger Events
- Push to `main` → full CI + deploy to production
- Push to `feature/*` or PR opened → CI only (lint + test)

---

### Pipeline Stages

```
[Push / PR]
     │
     ▼
┌─────────────────┐
│   1. Lint       │  ESLint on src/**/*.jsx and server/index.js
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   2. Test       │  npm test (unit + integration)
│                 │  SIMULATE_LIVE_INFERENCE=true (no AI costs)
│                 │  Mock external APIs
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   3. Build      │  npm run build (Vite → /dist)
└────────┬────────┘
         │ (main branch only)
         ▼
┌─────────────────┐
│   4. Deploy     │  rsync /dist to server OR docker build + push
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   5. Smoke Test │  curl /api/districts → assert 50 results
└─────────────────┘
```

---

### Example GitHub Actions Workflow

```yaml
name: CI

on:
  push:
    branches: [main, 'feature/*']
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm test
        env:
          SIMULATE_LIVE_INFERENCE: 'true'
      - run: npm run build

  deploy:
    needs: ci
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci && npm run build
      - name: Deploy
        run: |
          # rsync or docker push step here
          echo "Deploy step — configure for target hosting"
```

---

## Branch Strategy

| Branch | Purpose | CI | Deploy |
|---|---|---|---|
| `main` | Production-ready code | Yes | Yes → Production |
| `feature/*` | Feature development | Yes | No |
| `fix/*` | Bug fixes | Yes | No |
| `hotfix/*` | Emergency production fixes | Yes | Yes → Production (after review) |

---

## Secrets Required in CI

| Secret Name | Purpose |
|---|---|
| `AQICN_TOKEN` | Only needed for smoke tests with live data |
| `ANTHROPIC_API_KEY` | Not needed in CI — use SIMULATE_LIVE_INFERENCE |
| `DEPLOY_SSH_KEY` | SSH key for server deployment (if rsync approach) |
| `DOCKER_HUB_TOKEN` | If using Docker Hub registry |
