# Development Rules

These rules apply to the whole project. Every contributor, human or AI agent, follows them.

---

# Before Writing Code

Read these, in order:

1. `context.md`: what the app is for, the domain, and the engine
2. `database.md`: the schema
3. `api-spec.md`: the endpoints
4. `structure.md`: where files go
5. `roadmap.md`: what is being built now

Then:

* Never invent database fields or API endpoints. If one is needed, update the docs first, with the owner's approval.
* Never invent agronomic numbers (thresholds, rates, crop ranges). They come from a cited source into master data.
* Never change the architecture without explicit instruction.
* If something is missing or unclear, ask. Do not assume.
* Every feature must serve one of the two questions in `context.md`. If it does not, do not build it.

---

# General Principles

* Readability over cleverness
* Small, focused files and functions
* No duplicated logic (DRY), but no abstraction before a second use
* Business logic separated from presentation
* Meaningful names
* Build for 100–1,000 users. Do not add infrastructure for scale that does not exist (queues, caches, microservices, object storage)

---

# TypeScript

Always

* Strict mode
* Explicit types for API requests and responses
* async/await

Never

* `any` (use `unknown` and narrow it)
* `@ts-ignore` or disabled checks
* Ignored type errors

Prisma enums and string-literal unions are both fine. Prefer unions in frontend code.

---

# Naming

| Kind        | Convention          | Example                          |
| ----------- | ------------------- | -------------------------------- |
| Files       | kebab-case + role   | `soil-plan.service.ts`, `plot.repository.ts`, `soil-input.schema.ts` |
| Components  | PascalCase          | `SoilInputForm.tsx`, `CropRankCard.tsx` |
| Hooks       | camelCase, `use`    | `usePlots.ts`                    |
| Functions   | camelCase verb      | `calculateSuitabilityScore()`    |
| Variables   | camelCase           |                                  |
| Types       | PascalCase          | `SoilInput`, `SoilPlanStep`      |
| Constants   | UPPER_SNAKE_CASE    | `PH_ABOVE_PENALTY_PER_HALF_UNIT` |

---

# Backend Rules

| Layer       | Does                                            | Never                     |
| ----------- | ----------------------------------------------- | ------------------------- |
| Route       | Path, validation schema, `requireUserId()`, calls a service, wraps `successResponse()` | Business logic, try/catch |
| Service     | Business flow: loads master data, calls the engine, enforces ownership, throws `HttpError` | Raw HTTP concerns |
| Engine      | Pure calculation functions (`services/engine/`) | I/O of any kind (DB, network, AI, clock) |
| Repository  | Prisma queries only                             | Business rules            |

There is no controller layer. Routes stay thin enough not to need one.

## Errors

* Services throw `HttpError(status, message)` (`lib/http-error.ts`) for anything the client should see: 404, 422 and so on
* `lib/error-handler.ts` turns every error into the response envelope. Validation errors become 422 with readable details, and anything unexpected is logged and returned as a generic 500
* Routes do not catch errors

## Ownership

Every Auth endpoint that takes a plot or analysis ID must check that it belongs to the session user. The check lives in the service (`getOwned`), and a failure returns `404`.

---

# Recommendation Engine Rules

* Deterministic and reproducible
* Pure functions, all inputs passed in (soil, site, master data)
* Never uses AI
* Every ranked crop includes: score, level, difficulty, reasons, penalties
* Every soil-plan step includes a quantity per rai and a total for the plot, plus its timing
* Agronomic data (thresholds, rates, crop ranges) comes from master data in the DB
* Scoring weights are tuning parameters in `backend/src/constants/engine.ts`

## Starting scoring parameters

These are product tuning values, not agronomic facts. Adjust them with tests.

| Constant                              | Starting value |
| ------------------------------------- | -------------- |
| `TEXTURE_PENALTY_PER_STEP` (clay ↔ loam ↔ sandy, from the nearest preferred texture) | 10 (1 step) / 20 (2 steps) |
| `PH_BELOW_PENALTY_PER_STEP` (per started 0.5 pH) | 8 (cap 40) |
| `PH_ABOVE_PENALTY_PER_STEP` (per started 0.5 pH) | 12 (cap 50) |
| `PH_OFF_OPTIMAL_PENALTY_PER_UNIT` (distance from `phOptimal`, inside the range, rounded) | 5 per pH unit (cap 5) |
| `ORGANIC_MATTER_PENALTY_PER_LEVEL`    | 10 per level below the minimum |
| `NUTRIENT_PENALTY_PER_LEVEL` (N/P/K)  | 5 per level below the minimum, each |
| `HARD_PH_RAISE_GAP`                   | 1.0 pH unit    |
| `NOT_FEASIBLE_PH_RAISE_GAP`           | 2.0 pH units   |
| `NOT_FEASIBLE_PH_LOWER_GAP`           | 1.0 pH unit    |
| `NOT_FEASIBLE_MAX_SCORE`              | 39             |

Scoring rules:

* **Off-optimum pH** is measured on pH clamped to the crop range. Outside the range it stays at its edge value and `ph_low` / `ph_high` add on top, so moving further from the optimum never raises the score
* **Organic matter and nitrogen count once.** When either level is estimated from the other (lab: N from organic matter; test kit: organic matter from N), they are one measurement: only the larger of the two penalties is applied (the measured factor wins a tie). Reasons still mention both
* **Levels below the minimum** are counted: low against a "high" minimum is 2 levels

Difficulty, checked in this order:

* `not_feasible`: pH more than `NOT_FEASIBLE_PH_RAISE_GAP` below min, or more than `NOT_FEASIBLE_PH_LOWER_GAP` above max
* `hard`: pH above max, or more than `HARD_PH_RAISE_GAP` below min
* `moderate`: pH below min, or organic matter below min
* `easy`: everything else

---

# Validation

* Validate every request with Elysia `t` (TypeBox) schemas in `validators/`
* Reject unknown fields: objects use `additionalProperties: false`, and the root app runs with `normalize: false` so extra fields return 422 instead of being silently dropped
* Enforce the per-mode required fields of `SoilInput`
* Readable messages, in Thai first, for fields the user can fix
* Never trust client input, including IDs. Check ownership

---

# API Rules

See `api-spec.md`. In short: REST, plural nouns, a consistent envelope, proper status codes, and no internal errors exposed.

---

# Database Rules

* Prisma only. No raw SQL unless absolutely necessary
* UUID primary keys, UTC timestamps
* Schema changes go through `prisma migrate`, one focused migration per change
* Master data changes go through the seed files with a `source`, never through the app

---

# Frontend Rules

* **Mobile-first.** Design at 360px width first. Large tap targets, one main action per screen
* **Thai first.** Every user-facing string lives in a `messages.ts` (TH + EN). No hard-coded UI text in components
* Use **rai** for area and **kg** for quantities. Show both per-rai and whole-plot amounts
* Explain every input: what it is, where to find it on a lab report or kit, and what to do if you don't have it
* No business logic in components. The UI displays what the API returns. The simulator calls `POST /api/recommendations` (debounced). It does not re-implement the engine
* API calls go through the API client in `lib/api.ts`, never `fetch` inside components
* shadcn/ui components and Tailwind utility classes; no inline styles
* Every data view handles loading, empty and error states
* Support dark mode

---

# Error Handling

* Never show internal errors to users. Use a generic message with a retry option
* Log unexpected errors on the backend with context (route, user id)
* `errors` in responses contains validation details only

---

# Authentication & Security

* Better Auth for sessions: email/password and LINE Login
* Validate the session on every Auth request on the backend. Never trust the frontend
* Rate-limit auth endpoints
* CORS and Better Auth trusted origins allow only `FRONTEND_URL` (env, default `http://localhost:3000`)
* Secrets only in env vars. Never commit `.env*` files, never send them to the client
* Escape user content (plot names, notes) when rendering. No `dangerouslySetInnerHTML`

---

# Testing

Use `bun test`, in `backend/tests/`.

* `tests/engine/`: pure unit tests, no database, test fixtures only
* `tests/api/`: integration tests through `app.handle()`, against the separate `plantable_test` database (`backend/.env.test`). `tests/helpers.ts` refuses to run against any other database
* Set up the test DB once: `DATABASE_URL=<test url> bunx prisma migrate deploy && bun prisma/seed.ts`

Must have:

* Engine unit tests: level normalization, site check, each penalty, difficulty, ranking order, soil-plan quantities and fertilizer conversion. No database needed
* Validation tests for `SoilInput` per mode
* Ownership tests: user A cannot read or modify user B's plot or analysis
* Endpoint integration tests for plots and analyses

---

# Git Rules

Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `style:`, `test:`, `chore:` (optional scope, e.g. `feat(engine):`).

Keep commits focused. Docs changes that alter the schema or API are committed before or with the code that implements them.
