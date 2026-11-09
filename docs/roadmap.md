# Roadmap

Status: `[x]` done · `[ ]` to do · `[~]` exists but must be reworked for v2

The goal of every phase is to answer the two questions in `context.md` better.

---

## Already built (v1)

- [x] Next.js frontend with forest theme, TH/EN, dark mode, motion
- [x] Elysia backend with Prisma + PostgreSQL
- [x] Better Auth email/password, profile
- [x] Crop catalog (30 crops, grouped as field crop / tree crop / horticulture) and crop detail
- [x] Recommendation engine v1 replaced by v2 (see 1.3)
- [x] Generic soil improvement advice replaced by quantified soil plans (see 1.3)
- [x] Analysis history per user replaced by plots + history per plot (see 1.4)
- [x] Charts: NPK radar, pH gauge, score gauge
- [x] PDF export
- [x] Weather widget by province
- [x] Removed: OCR/upload, economics, analytics

---

## Phase 1: Core v2 (answer both questions properly)

### 1.1 Master data (blocks real use)
- [~] Placeholder data seeded (`seed-data/sample-agronomy.ts`, source `SAMPLE…`); the API warns on every result
- [ ] Collect sources (LDD / DOA) for: nutrient level thresholds, crop requirements, fertilizer rates and stages, lime rates, organic matter rates, lime/OM timing
- [ ] Owner reviews the numbers before they are seeded
- [ ] Replace sample values and sources for the current 30 crops

### 1.2 Schema v2
- [x] Add Plot, enums, new SoilAnalysis fields, new master tables (see `database.md`)
- [x] Drop Recommendation, FavoriteCrop, UploadedReport, old CropRequirement mg/kg fields
- [x] Baseline migration `v2_baseline`, applied to `plantable_test`
- [ ] Apply to the dev database (`plantable`): needs a reset, which deletes existing data

### 1.3 Engine v2 (`backend/src/services/engine/`)
- [x] Level normalization (lab → levels; N from organic matter; kit: organic matter from N)
- [x] Site check (land type, water) → ineligible list
- [x] Penalty score + difficulty (incl. `not_feasible`) + reasons
- [x] Soil plan: lime by texture/pH band, organic matter, fertilizer by level and stage, conversion to 18-46-0 / 46-0-0 / 0-0-60, totals for the plot
- [x] Unit tests for all of the above

### 1.4 API
- [x] `/api/plots`, `/api/plots/:id/analyses`, `/api/analyses/:id`, `/api/analyses/:id/soil-plan`
- [x] Stateless `POST /api/recommendations` and `POST /api/soil-plans` with the v2 bodies
- [x] Ownership checks + tests
- [x] Remove legacy endpoints listed in `api-spec.md`
- [x] CORS origin from env, generic 500 messages, global error handler, unknown fields rejected
- [ ] Rate limit on auth endpoints
- [ ] Fix pre-existing type errors in `weather.service.ts` and `tests/environment.test.ts`

### 1.5 Frontend
- [x] Switch `lib/api.ts` and types to the v2 endpoints; remove favorites, regional suitability, v1 analysis calls
- [ ] Plot list / create / detail
- [x] Soil input form with lab and test-kit modes, with help text for every field
- [x] Ranking page: score, difficulty, reasons, ineligible list
- [x] Soil plan page: steps on a timeline, per-rai and whole-plot quantities, chemical/organic/combined switch
- [ ] Guest quick check (`/check`) with a "save to a plot" prompt to log in
- [ ] Mobile-first pass on all pages

### 1.6 Auth
- [ ] LINE Login

### 1.7 Deploy
- [ ] Frontend on Vercel, backend + DB on Railway, env-based config

---

## Phase 2: Make farmers come back

- [ ] What-if simulator on the ranking page
- [ ] Re-test and compare: before/after levels per plot over time
- [ ] Share the soil plan to LINE; PDF uses the v2 plan
- [ ] `/guide`: hand texture test (with pictures), where to get soil tested
- [~] Expand crops to about 25–30 common Thai crops, with sources (30 crops, 18 added, all with SAMPLE values; more tree crops and cool-climate crops wait for per-tree fertilizer rates and a region/climate filter)

---

## Later (only if users ask)

- [ ] Planting window by province and season (reuse weather service)
- [ ] AI explanation of a result (never computes anything)
- [ ] Salinity / drainage problem soils

---

## Not doing

- OCR / soil report upload
- Economics: cost, revenue, yield prediction, ROI
- Analytics dashboard, crop popularity
- Favorites (replaced by plot target crop)
- Machine-learning crop selection
