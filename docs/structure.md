# Project Structure

Two applications in one repository, both on Bun:

* `frontend/`: Next.js (App Router)
* `backend/`: ElysiaJS + Prisma

Do not create top-level folders outside this structure without updating this document.

---

# Root

```text
Plantable/
├── backend/
├── frontend/
├── docs/
│   ├── context.md      product, domain, engine
│   ├── database.md     schema
│   ├── api-spec.md     endpoints
│   ├── rules.md        coding rules
│   ├── structure.md    this file
│   └── roadmap.md      phases and status
├── package.json
└── README.md
```

---

# Backend

```text
backend/
├── prisma/
│   ├── schema.prisma        the only source of the DB schema
│   ├── seed.ts              loads master data
│   ├── seed-data/           crops.ts, sample-agronomy.ts (SAMPLE values until real data arrives)
│   └── migrations/
├── src/
│   ├── index.ts             app setup (`app` export), CORS, route registration
│   ├── config/              db client
│   ├── constants/           engine.ts (scoring tuning), amendments.ts (liming materials, organic rates)
│   ├── lib/                 auth.ts (Better Auth), session.ts (requireUserId), http-error.ts, error-handler.ts
│   ├── routes/              path + validation + auth, then call a service
│   ├── services/            business flow (plot, analysis, recommendation, soil-plan, crop, user, weather)
│   │   └── engine/          pure functions: levels, site-check, score, recommend, fertilizer, soil-plan
│   ├── repositories/        Prisma queries only
│   ├── validators/          Elysia `t` schemas (soil-input.schema.ts, request.schema.ts)
│   ├── types/               weather types
│   ├── utils/               response envelope
│   └── generated/           Prisma client output (generated, do not edit)
└── tests/
    ├── engine/              pure unit tests (no DB)
    ├── api/                 integration tests (test DB)
    └── helpers.ts           test client, sign-up, test-DB guard
```

## Request flow

```text
Route → Service → Repository → Prisma → PostgreSQL
          ↓
       engine/ (pure)

Errors: thrown HttpError → lib/error-handler.ts → envelope
```

Dependencies only point downward. `engine/` imports nothing from routes, services, repositories or Prisma. It defines its own string-union types, which match the Prisma enums value for value.

## Modules

| Module          | Route file                  | Service                       | Repository               |
| --------------- | --------------------------- | ----------------------------- | ------------------------ |
| Crops           | `crop.routes.ts`            | `crop.service.ts`             | `crop.repository.ts`     |
| Plots           | `plot.routes.ts`            | `plot.service.ts`             | `plot.repository.ts`     |
| Analyses        | `plot.routes.ts` (nested), `analysis.routes.ts` | `analysis.service.ts`, `analysis-mapper.ts` | `analysis.repository.ts` |
| Recommendations + soil plans (stateless) | `recommendation.routes.ts` | `recommendation.service.ts`, `soil-plan.service.ts` | `crop.repository.ts`, `master-data.repository.ts` |
| Users           | `user.routes.ts`            | `user.service.ts`             | `user.repository.ts`     |
| Environment     | `environment.routes.ts`     | `weather.service.ts`          | —                        |

---

# Frontend

```text
frontend/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   └── (web)/               pages and layouts only, no business logic
├── components/
│   ├── ui/                  shadcn/ui primitives
│   ├── layout/              navbar parts, language switcher
│   ├── shared/              PageHeader, States (loading/empty/error), StatCard, CropIcon
│   ├── charts/              NPK radar, pH gauge, score gauge
│   ├── Navbar.tsx
│   └── Footer.tsx
├── features/                one folder per feature: components/, hooks/, messages.ts
├── lib/
│   ├── api.ts               API client (all fetch calls live here)
│   ├── auth-client.ts       Better Auth client
│   ├── i18n/                TH/EN setup
│   ├── export-pdf.ts
│   └── utils.ts
├── types/                   API request/response types
└── public/
```

## Pages (target)

| Route                         | Purpose                                         |
| ----------------------------- | ----------------------------------------------- |
| `/`                           | Landing                                         |
| `/login`, `/register`         | Auth (email + LINE)                             |
| `/check`                      | Guest quick check: site + soil → ranking (not saved) |
| `/plots`                      | My plots with latest soil status                |
| `/plots/new`                  | Create plot                                     |
| `/plots/[id]`                 | Plot detail: soil history, before/after, target crop |
| `/plots/[id]/analyses/new`    | Enter a soil test (lab or kit mode)             |
| `/analyses/[id]`              | Ranking + ineligible list + what-if simulator   |
| `/analyses/[id]/plan`         | Soil plan for the chosen crop (`?crop=`), share/PDF |
| `/crops`, `/crops/[id]`       | Crop catalog with requirements and sources      |
| `/guide`                      | No soil test yet: texture hand test, where to test soil |
| `/profile`                    | Account                                         |

Current pages map to the target as: `analyze` → `check` and `plots/[id]/analyses/new`, `results` → `analyses/[id]`, `history` → `plots`.

## Features (target)

```text
features/
├── auth/
├── marketing/
├── plot/
├── soil-analysis/       input form (lab/kit modes), input help
├── recommendation/      ranking, ineligible list, simulator
├── soil-plan/           plan steps, quantities, share (renamed from soil-improvement)
├── crop/
├── guide/
├── environment/         weather widget (secondary)
└── profile/
```

Rules:

* A feature does not import another feature's internals. Shared pieces move to `components/shared/` or `types/`.
* `messages.ts` per feature holds all TH/EN strings for it.

## Frontend flow

```text
Page → Feature component → hook → lib/api.ts → REST API
```

---

# Naming Examples

| Kind        | Example                                     |
| ----------- | ------------------------------------------- |
| Component   | `PlotCard.tsx`, `SoilPlanSteps.tsx`         |
| Hook        | `usePlot.ts`, `useSimulator.ts`             |
| Service     | `soil-plan.service.ts`                      |
| Repository  | `plot.repository.ts`                        |
| Validator   | `soil-input.schema.ts`, `request.schema.ts` |
| Engine file | `engine/site-check.ts`, `engine/score.ts`, `engine/fertilizer.ts` |
