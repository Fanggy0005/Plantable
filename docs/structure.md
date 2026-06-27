# Project Structure

## Overview

This project follows a modular full-stack architecture.

The project is divided into two applications:

* Frontend (Next.js)
* Backend (ElysiaJS)

Each module is responsible for a single feature.

Business logic must remain independent from the UI.

---

# Root Structure

```text
soil-recommendation/

├── frontend/
├── backend/
├── docs/
├── .gitignore
├── README.md
└── docker-compose.yml
```

---

# Documentation

```text
docs/

├── roadmap.md
├── context.md
├── database.md
├── api-spec.md
├── rules.md
└── project-structure.md
```

All AI agents must read these documents before generating code.

---

# Frontend Structure

```text
frontend/

├── app/
├── components/
├── features/
├── hooks/
├── services/
├── lib/
├── types/
├── utils/
├── styles/
├── public/
└── middleware.ts
```

---

# app/

Contains Next.js App Router.

Example

```text
app/

├── page.tsx
├── layout.tsx

├── login/

├── dashboard/

├── analyses/

├── crops/

├── profile/
```

Only pages and layouts belong here.

Do not place business logic here.

---

# components/

Reusable UI components.

```text
components/

Button/

Card/

Navbar/

Footer/

Charts/

Loading/

EmptyState/

ErrorState/
```

Components must be reusable.

---

# features/

Each feature owns its own UI, hooks and logic.

```text
features/

soil-analysis/

crop/

recommendation/

auth/

profile/

favorite/

dashboard/
```

Example

```text
features/

soil-analysis/

components/

hooks/

services/

types/

utils/
```

Feature modules should not depend directly on other features.

---

# hooks/

Global reusable hooks.

Example

```text
useDebounce

usePagination

useDarkMode

useCurrentUser
```

---

# services/

Frontend API clients.

Example

```text
analysis.service.ts

crop.service.ts

auth.service.ts
```

No UI code belongs here.

---

# lib/

Third-party configuration.

Example

```text
axios.ts

auth.ts

query-client.ts

storage.ts
```

---

# utils/

Pure helper functions.

Example

```text
formatDate()

calculatePercentage()

convertUnit()
```

Utilities must not call APIs.

---

# types/

Global shared types.

Example

```text
Crop

User

Recommendation

SoilAnalysis
```

---

# Backend Structure

```text
backend/

src/

├── index.ts
├── routes/
├── controllers/
├── services/
├── repositories/
├── validators/
├── middleware/
├── models/
├── utils/
├── constants/
├── types/
└── config/
```

---

# routes/

Register API endpoints.

Responsibilities

* Routing
* Validation
* Middleware

Routes must never contain business logic.

---

# controllers/

Receive requests.

Call services.

Return responses.

Controllers should remain thin.

---

# services/

Contains business logic.

Examples

```text
RecommendationService

AnalysisService

CropService

OCRService
```

Suitability score calculation belongs here.

---

# repositories/

Database access layer.

Responsibilities

* Prisma queries
* CRUD operations

Repositories must not contain business logic.

---

# validators/

Contains Zod schemas.

Example

```text
createAnalysis.schema.ts

updateProfile.schema.ts
```

Every request must be validated.

---

# middleware/

Authentication

Logging

Error handler

Rate limiter

Request logger

---

# models/

Shared backend models.

Use only when necessary.

Database schema remains inside Prisma.

---

# config/

Application configuration.

Example

```text
database.ts

storage.ts

env.ts

auth.ts
```

---

# constants/

Application constants.

Example

```text
RecommendationLevel

ErrorMessage

UploadLimit

SupportedFileTypes
```

---

# Prisma

```text
backend/

prisma/

schema.prisma

seed.ts

migrations/
```

Only Prisma manages database schema.

---

# Storage

Uploaded files

Cloudflare R2

Never store uploaded files locally.

---

# Feature Flow

```text
User

↓

Page

↓

Feature

↓

Service

↓

REST API

↓

Controller

↓

Service

↓

Repository

↓

Prisma

↓

PostgreSQL
```

Every request follows this architecture.

---

# Import Rules

Allowed

```text
Page

↓

Feature

↓

Service

↓

API
```

Forbidden

```text
Page

↓

Repository
```

---

# Dependency Rules

Frontend

Page

↓

Feature

↓

Service

↓

API

Backend

Route

↓

Controller

↓

Service

↓

Repository

↓

Database

Dependencies must never point upward.

---

# Naming Convention

Components

```text
CropCard.tsx

SoilInputForm.tsx

AnalysisHistory.tsx
```

Services

```text
analysis.service.ts

crop.service.ts
```

Repositories

```text
crop.repository.ts
```

Controllers

```text
analysis.controller.ts
```

Validators

```text
create-analysis.schema.ts
```

---

# Testing Structure

```text
tests/

unit/

integration/

e2e/
```

Business logic should always be unit-testable.

---

# Future Modules

Future features should follow the same architecture.

Examples

```text
weather/

fertilizer/

ocr/

ai/

notification/

analytics/
```

Every new feature must remain modular and independent.

---

# AI Agent Instructions

Before generating code:

1. Read `context.md`
2. Read `rules.md`
3. Read `database.md`
4. Read `api-spec.md`
5. Follow `roadmap.md`

AI agents must:

* Respect the project architecture.
* Never create files outside the defined structure.
* Never duplicate business logic.
* Keep modules independent.
* Prefer reusable components and services.
* Ask for clarification instead of making assumptions when requirements are unclear.
