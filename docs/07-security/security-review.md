# Security Review

## EnviroPulse v1.0

**Version:** 1.0  
**Date:** 2026-05-15  

---

## 1. Authentication & Authorisation

**Current state (v1):** No authentication layer. All API endpoints are publicly accessible. Role selection (construction, government, msme, esgFirm, doeAuditor) is passed as a POST body parameter with no server-side verification.

**Risk:** High — any client can impersonate any role and access all endpoints.

**Planned mitigation (Phase 4):**
- Implement JWT-based authentication
- Add role-based access control (RBAC) middleware on all POST endpoints
- Restrict `/api/compliance/escalate` to verified DOE Auditor role tokens

---

## 2. API Key Management

**Current state:** API keys stored in `.env` file. `.env` must be listed in `.gitignore`.

**Risks:**
- `.env` accidentally committed to source control
- Keys visible in server logs if not masked

**Mitigations:**
- Verify `.env` is in `.gitignore` — never commit secrets
- In production, use a secrets manager (AWS Secrets Manager, Azure Key Vault, GCP Secret Manager)
- Rotate keys immediately if exposure is suspected

---

## 3. Input Validation

**Current state:** POST body fields are used directly in API calls and AI prompts without sanitisation beyond presence checks.

**Risks:**
- Prompt injection via malicious `company` or `zone` fields in `/api/compliance/verify`
- Malformed numeric inputs causing NaN propagation in calculations

**Mitigations:**
- Validate and sanitise all string inputs before embedding in AI prompts
- Parse numeric fields with `parseFloat` and reject NaN values with a 400 response
- Limit string field lengths to prevent excessively large prompt injection attempts

---

## 4. Audit Chain Integrity

**Current state:** FNV-1a 32-bit hashing used for audit chain.

**Limitation:** FNV-1a is not cryptographically secure — it is not collision-resistant and cannot protect against a determined attacker who controls the server.

**Appropriate for:** Tamper detection in a trusted environment, not adversarial tampering by a server-side attacker.

**Planned mitigation (Phase 4):**
- Replace with HMAC-SHA256 keyed with a server secret for stronger tamper evidence
- Consider external notarisation (blockchain timestamp or trusted third-party hash registry) for regulatory-grade audit trails

---

## 5. CORS Configuration

**Current state:** `cors()` middleware applied with default settings (allows all origins).

**Risk:** In production, this allows any website to call the API.

**Mitigation:** Restrict CORS to known origin(s) in production:

```js
app.use(cors({ origin: 'https://yourdomain.com' }));
```

---

## 6. Rate Limiting

**Current state:** No rate limiting on API endpoints.

**Risk:** API abuse, excessive AI API costs from repeated calls.

**Mitigation:** Add `express-rate-limit` middleware, especially on `/api/advisor`, `/api/predict`, and `/api/analytics/esg`.

---

## 7. Data Exposure

**Current state:** All 50 district sensor readings are returned to all clients. No data segregation by role.

**Risk:** Low for v1 (data is environmental/public domain). Higher risk if private submission data is added.

**Mitigation (Phase 4):** Scope compliance submission data to the submitting organisation only.

---

## 8. Dependency Security

Run regularly:

```bash
npm audit
```

Address any HIGH or CRITICAL severity vulnerabilities before production deployment.

---

## 9. Security Checklist

- [ ] `.env` in `.gitignore` — secrets never committed
- [ ] API keys rotated for production
- [ ] CORS restricted to production domain
- [ ] Input sanitisation on all POST body string fields
- [ ] Rate limiting on AI and compliance endpoints
- [ ] `npm audit` passing with no HIGH/CRITICAL issues
- [ ] HTTPS/TLS in place for production
- [ ] Authentication planned for Phase 4
