# API Specification

## Overview

Base URL: `/api` · JSON only · Version: v1 (no version prefix until a breaking change is needed)

### Response format

Success

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

Error

```json
{
  "success": false,
  "message": "Validation Error",
  "errors": []
}
```

`errors` holds readable validation details only. Never put stack traces or raw exception objects in it.

### Authentication

Better Auth, mounted at `/api/auth/*` (email/password and LINE Login).
Endpoints marked **Auth** require a valid session and only access the current user's data. Accessing another user's plot returns `404`, not `403`, so the API does not reveal that the plot exists.

### Shared request types

`SiteInput`

```json
{
  "landType": "upland",
  "waterSupply": "rainfed",
  "soilTexture": "loam"
}
```

`SoilInput`, lab mode

```json
{
  "inputMode": "lab",
  "ph": 5.2,
  "organicMatterPct": 1.1,
  "phosphorusMgKg": 8,
  "potassiumMgKg": 45
}
```

`SoilInput`, test-kit mode

```json
{
  "inputMode": "test_kit",
  "ph": 5.5,
  "nitrogenLevel": "low",
  "phosphorusLevel": "medium",
  "potassiumLevel": "low"
}
```

Validation:

| Field            | Rule                                 |
| ---------------- | ------------------------------------ |
| ph               | 3.0 – 10.0                           |
| organicMatterPct | 0 – 100                              |
| phosphorusMgKg   | ≥ 0                                  |
| potassiumMgKg    | ≥ 0                                  |
| *Level           | `low` · `medium` · `high`            |
| per mode         | Fields of the other mode are rejected |

---

# Crops (public)

## GET /api/crops

Query: `search?`, `category?`

```json
{
  "success": true,
  "data": [
    { "id": "uuid", "name": "Rice", "nameTh": "ข้าว", "category": "Grain", "imageUrl": null }
  ]
}
```

## GET /api/crops/:id

Returns the crop, its `requirement`, its `fertilizerStages`, and the `source` of each.

---

# Recommendations (public, stateless)

Used by guests, by the "what-if" simulator, and internally by the analysis endpoints. Nothing is stored.

## POST /api/recommendations

Request

```json
{
  "site": { "landType": "upland", "waterSupply": "rainfed", "soilTexture": "loam" },
  "soil": { "inputMode": "lab", "ph": 5.2, "organicMatterPct": 1.1, "phosphorusMgKg": 8, "potassiumMgKg": 45 }
}
```

Response

```json
{
  "success": true,
  "data": {
    "levels": {
      "organicMatter": "low", "nitrogen": "low", "phosphorus": "low", "potassium": "low",
      "organicMatterEstimated": false, "nitrogenEstimated": true
    },
    "warnings": ["ข้อมูลตัวอย่าง: ตัวเลขยังไม่ได้ตรวจสอบกับแหล่งอ้างอิง ห้ามนำไปใช้ในแปลงจริง"],
    "ranked": [
      {
        "cropId": "uuid",
        "cropName": "Cassava",
        "cropNameTh": "มันสำปะหลัง",
        "score": 82,
        "level": "Good",
        "difficulty": "moderate",
        "reasons": ["pH 5.2 อยู่ในช่วงที่เหมาะสม (4.5–7.0)", "อินทรียวัตถุต่ำกว่าที่พืชต้องการ"],
        "penalties": [{ "factor": "organic_matter", "points": 10 }]
      }
    ],
    "ineligible": [
      { "cropId": "uuid", "cropName": "Rice", "cropNameTh": "ข้าว", "reasons": ["ต้องการพื้นที่ลุ่มหรือมีน้ำขัง"] }
    ]
  }
}
```

`ranked` is sorted by score descending. Ties are broken by easier difficulty.

* `difficulty`: `easy` · `moderate` · `hard` · `not_feasible`
* `penalties[].factor`: `texture` · `ph_low` · `ph_high` · `organic_matter` · `nitrogen` · `phosphorus` · `potassium`
* `warnings`: data-quality warnings (e.g. sample master data). Show them to the user

---

# Soil Improvement Plans (public, stateless)

## POST /api/soil-plans

Request

```json
{
  "cropId": "uuid",
  "areaRai": 5,
  "mode": "combined",
  "site": { "landType": "upland", "waterSupply": "rainfed", "soilTexture": "loam" },
  "soil": { "inputMode": "lab", "ph": 5.2, "organicMatterPct": 1.1, "phosphorusMgKg": 8, "potassiumMgKg": 45 }
}
```

`mode`: `chemical` · `organic` · `combined`

Response

```json
{
  "success": true,
  "data": {
    "cropId": "uuid",
    "areaRai": 5,
    "difficulty": "moderate",
    "steps": [
      {
        "type": "ph_correction",
        "daysAfterPlanting": -28,
        "titleTh": "ปรับ pH ด้วยโดโลไมต์",
        "material": "dolomite",
        "kgPerRai": 300,
        "kgTotal": 1500,
        "noteTh": "หว่านให้ทั่วแล้วไถกลบ"
      },
      {
        "type": "fertilizer",
        "daysAfterPlanting": 0,
        "titleTh": "ใส่รองพื้นตอนปลูก",
        "nutrientsPerRai": { "n": 4, "p2o5": 4.6, "k2o": 2.4 },
        "products": [
          { "formula": "18-46-0", "kgPerRai": 10, "kgTotal": 50 },
          { "formula": "46-0-0", "kgPerRai": 4.8, "kgTotal": 24 },
          { "formula": "0-0-60", "kgPerRai": 4, "kgTotal": 20 }
        ],
        "noteTh": null
      },
      { "type": "retest", "daysAfterPlanting": null, "titleTh": "ตรวจดินซ้ำหลังเก็บเกี่ยว", "noteTh": "…" }
    ],
    "nutrientTotalsPerRai": { "n": 8, "p2o5": 4.6, "k2o": 4.8 },
    "warnings": ["…"],
    "sources": ["…"]
  }
}
```

The example numbers above only show the format. Real numbers come from master data.

Steps:

* Order: by `daysAfterPlanting` (negative = before planting). `retest` is always last, with `daysAfterPlanting: null`
* `type`: `ph_correction` · `organic_matter` · `fertilizer` · `retest`
* `ph_correction` when pH is above range: `material`, `kgPerRai` and `kgTotal` are `null`, and `noteTh` gives guidance
* `fertilizer` in `organic` mode: `products` is empty, and `nutrientsPerRai` is the target to meet with organic sources

`warnings`: sample-data warning, site-check failures, `hard` / `not_feasible` warnings, and missing master data.

---

# Plots (Auth)

| Method | Path             | Description                         |
| ------ | ---------------- | ----------------------------------- |
| GET    | /api/plots       | List the current user's plots, each with its latest analysis summary |
| POST   | /api/plots       | Create a plot                       |
| GET    | /api/plots/:id   | Plot detail                         |
| PATCH  | /api/plots/:id   | Update name, area, site fields, `targetCropId` |
| DELETE | /api/plots/:id   | Delete plot and its analyses        |

Create request

```json
{
  "name": "แปลงหลังบ้าน",
  "areaRai": 5,
  "province": "ขอนแก่น",
  "landType": "upland",
  "waterSupply": "rainfed",
  "soilTexture": "loam",
  "targetCropId": null
}
```

---

# Soil Analyses (Auth)

| Method | Path                         | Description                                   |
| ------ | ---------------------------- | --------------------------------------------- |
| GET    | /api/plots/:id/analyses      | Soil history of a plot, newest `sampledAt` first (`limit` 1–100, default 20) |
| POST   | /api/plots/:id/analyses      | Save a soil test                              |
| GET    | /api/analyses/:id            | Stored soil input + recomputed recommendations for the plot's site |
| DELETE | /api/analyses/:id            | Delete a soil test                            |
| GET    | /api/analyses/:id/soil-plan  | Soil plan for this analysis. Query `cropId?` (defaults to the plot's target crop; 422 if neither), `mode?` (default `combined`) |

(Elysia requires the same parameter name at the same path position, so the plot id is `:id` in nested routes too.)

Create request

```json
{
  "soil": { "inputMode": "lab", "ph": 5.2, "organicMatterPct": 1.1, "phosphorusMgKg": 8, "potassiumMgKg": 45 },
  "sampledAt": "2026-05-01",
  "notes": "ก่อนใส่ปูน"
}
```

Each item from the list and create endpoints is an `AnalysisSummary`: `{ id, plotId, sampledAt, soil, levels, notes, createdAt }`. It includes `levels`, so the frontend can draw the before/after comparison without extra calls.

`GET /api/analyses/:id` returns `{ analysis, plot, recommendation }`, where `recommendation` has the same shape as the `POST /api/recommendations` response.

---

# Users (Auth)

| Method | Path          | Description             |
| ------ | ------------- | ----------------------- |
| GET    | /api/users/me | Current user            |
| PATCH  | /api/users/me | Update `name`           |

---

# Environment (public, secondary)

| Method | Path                        | Description                     |
| ------ | --------------------------- | ------------------------------- |
| GET    | /api/environment/provinces  | Province list grouped by region |
| GET    | /api/environment/weather    | Weather by `province`           |

---

# Removed endpoints (v1)

| Endpoint                                   | Replacement                          |
| ------------------------------------------ | ------------------------------------ |
| POST /api/analyses, GET /api/analyses/history | `/api/plots/:plotId/analyses`     |
| POST /api/analyses/:id/claim               | Guests use the stateless endpoints; saving requires login |
| POST /api/analysis/recommend, GET /api/analysis/history | Removed (backward-compat aliases) |
| POST /api/soil-improvement, GET /api/analyses/:id/soil-improvement | `/api/soil-plans`, `/api/analyses/:id/soil-plan` |
| /api/favorites/*                           | `Plot.targetCropId`                  |
| /api/uploads, /api/ocr, /api/economics/*, /api/crops/:id/economics, /api/analytics/* | Removed (features dropped) |
| GET /api/environment/regional-suitability  | Engine v2 site check                 |
| POST /api/recommendations (v1 body: N/P/K mg/kg) | Same path, v2 body `{ site, soil }` |

---

# Status Codes

| Code | Meaning                                  |
| ---- | ---------------------------------------- |
| 200  | OK                                       |
| 201  | Created                                  |
| 400  | Bad request                              |
| 401  | Not logged in                            |
| 404  | Not found, or not owned by current user  |
| 422  | Validation error                         |
| 429  | Too many requests (auth endpoints)       |
| 500  | Internal error (generic message only)    |

---

# API Design Rules

* REST, plural resource names, UUID identifiers
* Validate every request with Elysia `t` schemas; reject unknown fields
* Consistent response envelope
* Paginate only lists that grow without bound (analyses per plot)
* Never expose internal fields (`userId` of other users, raw errors)
* Breaking changes go to `/api/v2`
