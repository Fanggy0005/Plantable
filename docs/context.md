# Project Context

## Project Name

Plantable — Soil Recommendation System for Thai farmers

---

# The Two Questions

Every feature must help answer one of these. If it does not, it does not belong in the app.

1. **What is my land best suited to grow?**
   Rank crops by how well the plot already fits them and how little soil work is needed.
2. **How do I improve my soil so it can grow the crop I chose?**
   Give a concrete, quantified soil-improvement plan (what, how much per rai, when), with soil quality as the main focus.

---

# Target Users

Primary: **Thai farmers** working real plots, measured in **rai (ไร่)**.

* Mostly on mobile phones
* Thai language first (English is supported)
* Many use LINE more than email
* Soil data comes from either a lab report (e.g. Land Development Department, กรมพัฒนาที่ดิน) or a field soil test kit (ชุดตรวจดินภาคสนาม)
* Some have no soil test yet and need guidance to get one

Scale: free to use after login, 100–1,000 users. Design for this scale and avoid infrastructure built for a much larger one.

---

# Core Principles

* **Deterministic engine.** Crop ranking and soil plans are calculated by rules and master data. Same input → same output.
* **AI never decides.** AI may explain results later, but must not calculate scores, select crops, or produce quantities.
* **Hard factors first.** Water and land type cannot be changed, so they filter crops. Texture cannot be changed and is a strong factor. pH and organic matter can be improved slowly. N, P, K can be corrected with fertilizer within one season. The engine must reflect this.
* **Credible data.** Every crop requirement and fertilizer/lime rate comes from a cited source (LDD, Department of Agriculture / กรมวิชาการเกษตร, or equivalent). No invented agronomic numbers.
* **Quantities, not slogans.** "Apply lime" is not a plan. "Apply 300 kg/rai dolomite, 3–4 weeks before planting" is.

---

# Domain Concepts

## Plot (แปลง)

A piece of land owned by a user. A plot has fixed site characteristics:

| Attribute    | Values                                                    | Changeable |
| ------------ | --------------------------------------------------------- | ---------- |
| Area         | rai                                                       | —          |
| Province     | Thai province                                             | —          |
| Land type    | lowland (ที่ลุ่ม/นา) · upland (ที่ดอน)                        | No         |
| Water supply | rainfed only · seasonal irrigation · year-round water     | Rarely     |
| Soil texture | clay (ดินเหนียว) · loam (ดินร่วน) · sandy (ดินทราย)           | No         |
| Target crop  | optional, the crop the farmer chose to grow               | Yes        |

## Soil Analysis (ผลตรวจดิน)

A soil test taken on a plot at a point in time. A plot can have many analyses, so the farmer can re-test after improving the soil and compare.

Two input modes:

| Mode     | Source                    | Values entered                                                       |
| -------- | ------------------------- | -------------------------------------------------------------------- |
| lab      | Laboratory report         | pH, organic matter (%), available P (mg/kg), exchangeable K (mg/kg)  |
| test_kit | Field soil test kit       | pH, N level, P level, K level (low / medium / high)                  |

The engine normalizes both modes into **nutrient levels: low · medium · high**, using threshold master data.

* Lab mode: the nitrogen level is derived from the organic matter level (standard Thai practice, because lab reports usually do not report available N).
* Test-kit mode: kits do not measure organic matter, so the organic matter level is taken from the nitrogen level.

Either way the result marks the derived level as *estimated*, and the UI must say so.

## Nutrient Levels

Thresholds that convert lab numbers to levels are master data, sourced from LDD/DOA documents.
Values must be verified against the source before seeding. Do not guess them.

---

# Recommendation Engine

## Step 1 — Site check (hard filter)

For each crop, compare the plot's land type and water supply with the crop's requirement.

* Mismatch → crop is **ineligible**. It is not ranked, and it is shown in a separate list with the reason (e.g. "Needs standing water; plot is upland and rainfed").

## Step 2 — Suitability score (0–100)

Start at 100 and subtract penalties. Each penalty represents how much soil work is needed or how much the fixed site hurts the crop.

| Factor                                | Penalty basis                                   |
| ------------------------------------- | ----------------------------------------------- |
| Texture not in the crop's preferred list | Per step from the nearest preferred texture (clay ↔ loam ↔ sandy) |
| pH below crop range                   | Per 0.5 pH unit below the minimum, capped       |
| pH above crop range                   | Per 0.5 pH unit above the maximum, capped, larger than "below" because lowering pH is harder |
| pH away from the crop's optimum       | Small, by distance from `phOptimal` inside the range |
| Organic matter below crop minimum     | Per level below the minimum                     |
| N / P / K below crop minimum level    | Small penalty per level below, each (fixable with fertilizer). When organic matter and N come from one measurement, only the larger of the two counts |

A "high" nutrient level is not penalized. With only three levels, "high" means "enough, no fertilizer needed", not "toxic".

Penalty values live in `backend/src/constants/engine.ts` and are tuning parameters, not agronomic facts. Starting values are documented in `rules.md`.

Score bands (unchanged):

* 90–100 Excellent
* 75–89 Good
* 60–74 Fair
* 40–59 Poor
* 0–39 Not Recommended

## Step 3 — Amendment difficulty

Every ranked crop also gets a difficulty label so the farmer understands the effort:

* **easy** — fertilizer only, done this season
* **moderate** — needs lime and/or organic matter, start before planting
* **hard** — pH needs to be lowered a little, or raised by more than 1.0 unit; takes multiple seasons
* **not_feasible** — pH must be raised by more than 2.0 units, or lowered by more than 1.0 unit. Correcting the soil is not realistic or not worth it; pick another crop. The score is capped at 39 (Not Recommended).

Ranking order: score descending. Ties are broken by easier difficulty.

When the farmer still asks for a plan for a `not_feasible` crop, the plan is built but starts with a clear "not recommended" warning.

## Step 4 — Soil improvement plan (for one chosen crop)

Input: soil analysis, plot (texture, area), crop, mode (chemical · organic · combined).

The plan is an ordered list of steps with quantities per rai **and** for the whole plot:

1. **pH correction** — if pH is below range, lime quantity from the lime-rate table (by texture and pH band), converted to the chosen liming material, applied before planting. If pH is above range, organic matter and sulfur guidance, flagged as slow/hard.
2. **Organic matter** — manure/compost quantity per rai, or green manure option, by organic matter level.
3. **Fertilizer** — kg of N, P₂O₅, K₂O per rai from the crop fertilizer-rate table for the soil's levels. The engine converts these into straight fertilizers (แม่ปุ๋ย) 18-46-0, 46-0-0 and 0-0-60, and splits them by the crop's application stages (days after planting).
4. **Re-test** — reminder to test the soil again after the season and compare.

Modes:

* **chemical**: fertilizer as straight fertilizers; organic matter step only if organic matter is below the crop minimum
* **combined** (default): fertilizer as straight fertilizers, plus organic matter whenever it is not already high
* **organic**: organic matter step, and the fertilizer steps show the N/P₂O₅/K₂O targets without chemical products, with a note that organic sources act more slowly

## Sample data

Until the real LDD/DOA numbers are collected, master data is seeded with placeholder values whose `source` starts with `SAMPLE`. Every recommendation and plan built on it carries a warning that the numbers are not verified. The UI must show this warning prominently.

## Engine rules

* The engine must not call AI, the network, or the database. Services load master data and pass it in.
* The engine is a set of pure functions, fully unit-tested.
* Results are computed on demand, not stored. History stores only the soil input; when you open it, the result is recalculated with the current master data.

---

# Features

## Core (answers the two questions)

* Plot management (create, edit, delete plots)
* Soil analysis input (lab mode and test-kit mode), with help text for each value
* Crop ranking with reasons, ineligible list, difficulty label
* Soil improvement plan for a chosen crop, with quantities per rai and for the whole plot
* "What-if" simulator: adjust pH / organic matter / levels and see the ranking change
* Re-test and compare: soil history per plot, before/after view
* Crop catalog with requirements and their source
* Guidance for users without a soil test (hand texture test, where to get soil tested)

## Supporting

* Authentication: email/password and LINE Login
* Share the plan to LINE and export it to PDF
* TH/EN interface, dark mode, mobile-first layout
* Weather widget by plot province (already built, secondary)

## Removed / not planned

* OCR and file upload of soil reports — removed
* Economics (cost, revenue, yield, ROI) — removed
* Analytics dashboard / crop popularity — removed
* Favorites — replaced by the plot's target crop
* AI chat — later, optional, only to explain results

---

# Tech Stack

| Layer        | Choice                                          |
| ------------ | ----------------------------------------------- |
| Runtime / PM | Bun                                             |
| Frontend     | Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Recharts, motion |
| Backend      | ElysiaJS, TypeScript                            |
| Validation   | Elysia `t` (TypeBox) schemas                    |
| Database     | PostgreSQL with Prisma ORM                      |
| Auth         | Better Auth (email/password + LINE)             |
| Hosting      | Frontend on Vercel, backend + database on Railway (or equivalent) |

No object storage is needed (no file uploads).

---

# Architecture

```text
Frontend (Next.js)
  ↓ REST (JSON)
Backend (Elysia)
  Route → Controller → Service → Repository → Prisma → PostgreSQL
                         ↓
                Recommendation engine (pure functions)
```

---

# Development Principles

* Keep it simple for the scale: 100–1,000 users.
* Put complexity where the two questions need it (engine, master data, the plan), not in infrastructure.
* Keep business logic in backend services and the engine, never in UI components or routes.
* Every API is typed and validated.
* Readable over clever. Code should be easy for humans and AI agents to follow.
