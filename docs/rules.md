# Development Rules

These rules apply to the entire project.

Every AI agent contributing to this project must follow these rules.

---

# General Principles

* Always prioritize readability over clever code.
* Keep files small and maintainable.
* Follow SOLID principles where appropriate.
* Prefer composition over inheritance.
* Avoid unnecessary abstraction.
* Write code that is easy for humans to understand.
* Keep business logic separated from presentation logic.
* Avoid duplicated code (DRY).
* Use meaningful variable and function names.

---

# TypeScript

Always

* Enable strict typing.
* Avoid using `any`.
* Prefer interfaces or types for API responses.
* Use enums only when necessary.
* Use async/await instead of Promise chains.

Never

* Disable TypeScript checks.
* Ignore type errors.
* Use implicit any.

---

# Folder Structure

Frontend

```text
app/
components/
features/
hooks/
lib/
services/
types/
utils/
```

Backend

```text
src/

controllers/
services/
repositories/
routes/
middlewares/
validators/
types/
utils/
```

Do not place business logic inside route files.

---

# Naming Convention

Files

```text
soil-analysis.service.ts

crop.controller.ts

recommendation.repository.ts
```

Components

```text
SoilInputForm.tsx

CropCard.tsx

SuitabilityScore.tsx
```

Hooks

```text
useCrop.ts

useAnalysis.ts
```

Functions

```typescript
calculateSuitabilityScore()

generateRecommendation()

getCropRequirements()
```

Variables

camelCase

Types

PascalCase

Constants

UPPER_SNAKE_CASE

---

# Backend Rules

Routes only

* Validate request
* Call service
* Return response

Services

* Business logic
* Recommendation calculation
* Validation

Repositories

* Database access only

Repositories must never contain business logic.

---

# Recommendation Engine

The recommendation engine is deterministic.

Never use AI to calculate crop recommendations.

Recommendation logic must be reproducible.

Every recommendation must include

* Suitability score
* Recommendation level
* Reasons
* Improvement suggestions

---

# API Rules

Use REST.

Plural resources.

Examples

```text
GET /crops

GET /analyses

POST /analyses

GET /recommendations
```

Response

```json
{
  "success": true,
  "data": {},
  "message": "Success"
}
```

Errors

```json
{
  "success": false,
  "message": "Validation Error",
  "errors": []
}
```

Use proper HTTP status codes.

---

# Validation

Validate every request.

Use Zod.

Never trust client input.

Return readable validation messages.

---

# Database Rules

Use Prisma ORM.

Never write raw SQL unless absolutely necessary.

Always use UUID as primary keys.

Use UTC timestamps.

Master data

* Crop
* CropRequirement

must not be modified by normal users.

---

# Frontend Rules

Keep components small.

Prefer reusable UI components.

Use shadcn/ui whenever possible.

Keep pages lightweight.

Avoid unnecessary state.

Use React hooks appropriately.

Do not place API logic inside UI components.

---

# Styling

Use Tailwind CSS.

Use utility classes.

Avoid inline styles.

Maintain consistent spacing.

Support responsive layouts.

Support dark mode.

---

# Error Handling

Every API call must

* Handle loading state
* Handle empty state
* Handle error state

Never expose internal server errors to users.

Log unexpected errors on the backend.

---

# Authentication

Protect private routes.

Never trust frontend authentication.

Validate authentication on every protected request.

Store passwords securely.

Never expose secrets.

---

# Security

Always validate inputs.

Sanitize uploaded files.

Prevent SQL Injection.

Prevent XSS.

Prevent CSRF when applicable.

Never expose environment variables.

---

# File Upload

Allowed

* PDF
* PNG
* JPG
* JPEG

Validate

* File size
* MIME type

Store files in Cloudflare R2.

Do not store uploaded files locally.

---

# Performance

Use pagination.

Avoid N+1 queries.

Use database indexes.

Cache static master data when appropriate.

Optimize expensive calculations.

---

# Testing

Write tests for

* Recommendation engine
* Score calculation
* Validation
* API endpoints

Critical business logic should always be testable.

---

# Git Rules

Commit messages

```text
feat:

fix:

refactor:

docs:

style:

test:

chore:
```

Keep commits focused.

Avoid large unrelated commits.

---

# AI Agent Rules

Before generating code

* Read context.md
* Read database.md
* Read api-spec.md
* Follow roadmap.md

Never invent database fields.

Never invent API endpoints.

Never change project architecture without explicit instruction.

If information is missing,

ask for clarification instead of making assumptions.

Maintain consistency across the entire codebase.

All generated code must follow the project architecture and these development rules.
