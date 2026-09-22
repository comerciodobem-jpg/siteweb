# Produzir Registra Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished, mobile-first, installable Produzir Registra web app that implements the approved operator and manager flows from the project specification.

**Architecture:** Use a dependency-light static PWA built with semantic HTML, modular vanilla JavaScript, CSS custom properties, localStorage/IndexedDB-friendly local persistence, the browser BarcodeDetector API when available, and a service worker for offline shell caching. Keep domain logic in pure modules so it can later be replaced by the Óris 360 backend/Supabase API without rewriting the UI.

**Tech Stack:** HTML5, CSS3, ES modules, Web APIs (BarcodeDetector, MediaDevices, Service Worker, localStorage), Node built-in test runner for domain tests.

**Spec:** `docs/superpowers/specs/2026-09-22-produzir-registra-design.md`

## Global Constraints

- Mobile-first.
- Identity colors: white, blue, gray.
- Green only for success/confirmed; yellow/orange for attention; red for urgent/error/divergence.
- Operator flow remains `scan → quantity → register`.
- No mandatory production order, no mandatory start/finish production.
- Operator authorship comes from session; operator cannot select another author.
- Operator record does not mutate official stock.
- Manager review preserves declared vs confirmed vs stock movement separately.
- No public employee ranking.
- Need/urgent flow never blocks free production.
- App must work without a backend for demo/prototype use and keep clean integration boundaries for Óris 360 later.

## Review Focus

1. Double taps / repeated submission must create only one production record.
2. Unknown barcode must never create a production record.
3. Manager confirmation with divergence must preserve original declared totals.
4. Operator must never see the `Conferir` area.
5. Offline/local records must visibly remain pending until synchronized/confirmed.

---

### Task 1: Scaffold the PWA shell and design system

**Files:**
- Create: `index.html`
- Create: `assets/styles.css`
- Create: `manifest.webmanifest`
- Create: `sw.js`
- Create: `assets/icons/app-icon.svg`
- Create: `tests/shell.test.js`

**Interfaces:**
- Produces: global layout containers, tab navigation hooks, PWA manifest, CSS tokens, installable app shell.

- [ ] **Step 1: Write the failing shell tests**
  - Assert required HTML landmarks exist.
  - Assert manifest has name, short_name, start_url, display, theme_color, icons.

- [ ] **Step 2: Run `node --test tests/shell.test.js` and confirm failure because files are missing.**

- [ ] **Step 3: Implement the mobile-first shell**
  - Header with dynamic message slot.
  - Produzir Registra brand lockup.
  - Main content outlet.
  - Bottom/tab navigation.
  - Toast region.
  - White/blue/gray token system.
  - Responsive tablet/desktop adaptation.

- [ ] **Step 4: Re-run shell tests and confirm pass.**

- [ ] **Step 5: Commit `feat: scaffold Produzir Registra PWA shell`.**

---

### Task 2: Add domain model, demo catalog, persistence, and session

**Files:**
- Create: `src/data/demo-data.js`
- Create: `src/domain/models.js`
- Create: `src/domain/production.js`
- Create: `src/domain/review.js`
- Create: `src/domain/needs.js`
- Create: `src/storage/store.js`
- Create: `src/session/session.js`
- Create: `tests/domain.test.js`

**Interfaces:**
- Produces: `findProductByBarcode()`, `createProductionRecord()`, `createProductionReview()`, `calculateNeedProgress()`, `loadState()`, `saveState()`, `getSession()`.

- [ ] **Step 1: Write failing tests for product lookup, positive quantities, idempotency key handling, declared/confirmed preservation, and need progress.**
- [ ] **Step 2: Run `node --test tests/domain.test.js` and confirm expected failures.**
- [ ] **Step 3: Implement pure domain functions and local persistence.**
- [ ] **Step 4: Seed realistic demo products, two operator users, one manager user, production history, and one urgent need.**
- [ ] **Step 5: Re-run tests and confirm pass.**
- [ ] **Step 6: Commit `feat: add production domain and local persistence`.**

---

### Task 3: Build login and motivational entry experience

**Files:**
- Create: `src/ui/login.js`
- Create: `src/ui/motivation.js`
- Modify: `index.html`
- Modify: `assets/styles.css`
- Create: `tests/motivation.test.js`

**Interfaces:**
- Consumes: session module.
- Produces: authenticated session and time/day-aware motivational message.

- [ ] **Step 1: Write failing tests for morning/afternoon message selection and role-aware login.**
- [ ] **Step 2: Run tests and confirm expected failure.**
- [ ] **Step 3: Implement clean login card with demo credentials/profile selection and dynamic phrases.**
- [ ] **Step 4: Ensure manager role is visually distinct only after login, not on public entry.**
- [ ] **Step 5: Re-run tests and confirm pass.**
- [ ] **Step 6: Commit `feat: add login and motivational entry`.**

---

### Task 4: Build Registrar with barcode scanner and manual fallback

**Files:**
- Create: `src/ui/register.js`
- Create: `src/scanner/barcode.js`
- Modify: `assets/styles.css`
- Create: `tests/register.test.js`

**Interfaces:**
- Consumes: catalog, session, domain production functions.
- Produces: pending production records owned by logged-in operator.

- [ ] **Step 1: Write failing tests for valid barcode, invalid barcode, zero/negative quantity, repeated submit idempotency, and authorship from session.**
- [ ] **Step 2: Run tests and confirm failure.**
- [ ] **Step 3: Implement BarcodeDetector path with camera permission when supported.**
- [ ] **Step 4: Implement manual barcode/search fallback for unsupported browsers.**
- [ ] **Step 5: Implement product card, quantity entry, package conversion helper, register action, success feedback, and automatic reset for next scan.**
- [ ] **Step 6: Add compact “Últimos registrados por você” list.**
- [ ] **Step 7: Re-run tests and confirm pass.**
- [ ] **Step 8: Commit `feat: add fast production registration flow`.**

---

### Task 5: Build Produzido analytics and history

**Files:**
- Create: `src/ui/produced.js`
- Create: `src/domain/analytics.js`
- Create: `tests/analytics.test.js`

**Interfaces:**
- Produces: today/week/month totals, weekly bars, filtered history.

- [ ] **Step 1: Write failing aggregation tests for today/week/month and weekly day buckets.**
- [ ] **Step 2: Run tests and confirm failure.**
- [ ] **Step 3: Implement analytics helpers.**
- [ ] **Step 4: Build Produzido UI with KPI cards, CSS bar chart, period filters, and status chips.**
- [ ] **Step 5: Re-run tests and confirm pass.**
- [ ] **Step 6: Commit `feat: add Produzido history and weekly analytics`.**

---

### Task 6: Build Nosso Resultado and production needs

**Files:**
- Create: `src/ui/results.js`
- Modify: `src/domain/needs.js`
- Create: `tests/needs.test.js`

**Interfaces:**
- Produces: team result view, active needs, urgent cards, progress/saldo calculations.

- [ ] **Step 1: Write failing tests for no-goal state, active need progress, urgent state, and completed need.**
- [ ] **Step 2: Run tests and confirm failure.**
- [ ] **Step 3: Implement team totals and need progress components.**
- [ ] **Step 4: Ensure no fake target appears when no need exists.**
- [ ] **Step 5: Add urgent callout that never blocks free production.**
- [ ] **Step 6: Re-run tests and confirm pass.**
- [ ] **Step 7: Commit `feat: add team results and production needs`.**

---

### Task 7: Build manager-only Conferir workflow

**Files:**
- Create: `src/ui/review.js`
- Modify: `src/domain/review.js`
- Create: `tests/review.test.js`

**Interfaces:**
- Consumes: pending records, manager session.
- Produces: review records, confirmed quantities, divergence audit data.

- [ ] **Step 1: Write failing tests proving operator cannot review, manager can review, declared value is preserved, and divergence is computed.**
- [ ] **Step 2: Run tests and confirm failure.**
- [ ] **Step 3: Implement manager-only tab visibility and route guard.**
- [ ] **Step 4: Group pending records by product and show contributor composition.**
- [ ] **Step 5: Implement confirmed quantity input, divergence preview, confirmation, and audit fields.**
- [ ] **Step 6: Reflect confirmed/different states back into Produzido and Need progress.**
- [ ] **Step 7: Re-run tests and confirm pass.**
- [ ] **Step 8: Commit `feat: add manager production review workflow`.**

---

### Task 8: Add offline behavior and synchronization UX

**Files:**
- Create: `src/offline/sync.js`
- Modify: `sw.js`
- Modify: `src/ui/register.js`
- Create: `tests/offline.test.js`

**Interfaces:**
- Produces: local pending sync queue, online/offline status banner, safe replay.

- [ ] **Step 1: Write failing tests for local pending state, retry without duplication, and successful transition to pending review.**
- [ ] **Step 2: Run tests and confirm failure.**
- [ ] **Step 3: Implement service worker shell caching and connectivity banner.**
- [ ] **Step 4: Implement local queue abstraction with idempotency keys.**
- [ ] **Step 5: Re-run tests and confirm pass.**
- [ ] **Step 6: Commit `feat: add offline queue and sync status`.**

---

### Task 9: Wire the application router and polished responsive interactions

**Files:**
- Create: `src/app.js`
- Create: `src/ui/router.js`
- Modify: `index.html`
- Modify: `assets/styles.css`
- Create: `tests/router.test.js`

**Interfaces:**
- Consumes all UI modules.
- Produces complete app navigation, session-aware tabs, and responsive behavior.

- [ ] **Step 1: Write failing tests for tab access by role and logged-out redirect.**
- [ ] **Step 2: Run tests and confirm failure.**
- [ ] **Step 3: Implement SPA router and role-based navigation.**
- [ ] **Step 4: Polish spacing, focus states, keyboard support, empty states, loading states, and toast feedback.**
- [ ] **Step 5: Re-run tests and confirm pass.**
- [ ] **Step 6: Commit `feat: assemble Produzir Registra application`.**

---

### Task 10: Verification, design review, and deployment readiness

**Files:**
- Modify: `README.md`
- Create: `docs/produzir-registra/12-RUN-AND-DEPLOY.md`

**Interfaces:**
- Produces: verified build artifact and run/deploy instructions.

- [ ] **Step 1: Run full suite `node --test`.**
- [ ] **Step 2: Run a browser QA pass covering login, scan fallback, registration, Produzido, Nosso Resultado, manager Conferir, divergence, offline messaging, and mobile/desktop breakpoints.**
- [ ] **Step 3: Run gstack design review for hierarchy, spacing, typography, accessibility, responsiveness, and state consistency.**
- [ ] **Step 4: Fix only Critical/Important findings with RED→GREEN tests.**
- [ ] **Step 5: Document local run and Vercel/static deployment steps.**
- [ ] **Step 6: Commit `docs: add run and deployment guide`.**

## Self-Review

- Spec coverage: all approved operator areas, manager Conferir, urgent needs, results, offline, idempotency, divergence preservation, role access, and visual constraints are represented.
- Placeholder scan: no TBD/TODO implementation placeholders.
- Type/interface consistency: domain functions are introduced before UI modules consume them.
- Review Focus tests are assigned to Tasks 4, 7, 8, and 9.
