# Database Design

## Overview

PostgreSQL with Prisma ORM. The schema lives only in `backend/prisma/schema.prisma`.

The database holds two kinds of data:

* **Master data**: crops, crop requirements, nutrient thresholds, fertilizer and lime rates. Seeded from cited sources, read-only for users.
* **User data**: users, plots, soil analyses.

Recommendation results and soil plans are **not stored**. They are computed on demand from the soil analysis and the current master data.

---

# Entity Relationship

```text
User
 └── Plot
       ├── SoilAnalysis (many, over time)
       └── targetCrop → Crop

Crop
 ├── CropRequirement (1:1)
 ├── FertilizerRate (many)
 └── FertilizerStage (many)

NutrientLevelThreshold   (standalone master data)
LimeRate                 (standalone master data)

Better Auth tables: Session, Account, Verification (linked to User)
```

---

# Enums

| Enum          | Values                                                    |
| ------------- | --------------------------------------------------------- |
| LandType      | `lowland`, `upland`                                       |
| WaterSupply   | `rainfed`, `seasonal_irrigation`, `year_round` (ordered from least to most water) |
| SoilTexture   | `clay`, `loam`, `sandy`                                   |
| InputMode     | `lab`, `test_kit`                                         |
| NutrientLevel | `low`, `medium`, `high`                                   |
| Nutrient      | `organic_matter`, `nitrogen`, `phosphorus`, `potassium`   |

---

# User Data

## User

Managed by Better Auth. Do not add business fields here; put them on Plot.

| Field         | Type     | Notes        |
| ------------- | -------- | ------------ |
| id            | UUID     | PK           |
| email         | String   | Unique       |
| name          | String?  |              |
| image         | String?  |              |
| emailVerified | Boolean  |              |
| createdAt     | DateTime | UTC          |
| updatedAt     | DateTime | UTC          |

`Session`, `Account` and `Verification` follow the Better Auth schema. LINE Login accounts are rows in `Account`.

## Plot

| Field        | Type          | Notes                                      |
| ------------ | ------------- | ------------------------------------------ |
| id           | UUID          | PK                                         |
| userId       | UUID          | FK → User, cascade delete                  |
| name         | String        | e.g. "แปลงหลังบ้าน"                          |
| areaRai      | Float         | > 0                                        |
| province     | String        | Thai province name                         |
| landType     | LandType      |                                            |
| waterSupply  | WaterSupply   |                                            |
| soilTexture  | SoilTexture   |                                            |
| targetCropId | UUID?         | FK → Crop, set null on delete              |
| createdAt    | DateTime      |                                            |
| updatedAt    | DateTime      |                                            |

Index: `userId`.

## SoilAnalysis

One soil test on one plot. Exactly the fields of the chosen input mode are filled.

| Field             | Type           | lab mode | test_kit mode |
| ----------------- | -------------- | -------- | ------------- |
| id                | UUID           | PK       | PK            |
| plotId            | UUID           | required | required      |
| inputMode         | InputMode      | `lab`    | `test_kit`    |
| sampledAt         | DateTime       | date the soil was sampled | same |
| ph                | Float          | required | required      |
| organicMatterPct  | Float?         | required | —             |
| phosphorusMgKg    | Float?         | required | —             |
| potassiumMgKg     | Float?         | required | —             |
| nitrogenLevel     | NutrientLevel? | —        | required      |
| phosphorusLevel   | NutrientLevel? | —        | required      |
| potassiumLevel    | NutrientLevel? | —        | required      |
| notes             | String?        | optional | optional      |
| createdAt         | DateTime       |          |               |

Rules:

* The validator enforces the per-mode required fields.
* Levels are derived at calculation time, not stored. Lab mode uses `NutrientLevelThreshold`, with nitrogen level = organic matter level. In test-kit mode, organic matter level = nitrogen level.
* Cascade delete with Plot.

Indexes: `plotId`, `sampledAt`.

---

# Master Data

All master tables are seeded from `backend/prisma/seed.ts` (data files under `backend/prisma/seed-data/`). Every row that carries an agronomic number has a `source` field citing where the number came from.

Current state: `seed-data/sample-agronomy.ts` holds **placeholder values** with source `SAMPLE DATA: …`. Replace each value and its source together when the real data is collected.

Normal users must never modify master data.

## Crop

| Field          | Type     | Notes                              |
| -------------- | -------- | ---------------------------------- |
| id             | UUID     | PK                                 |
| name           | String   | Unique, English                    |
| nameTh         | String   |                                    |
| scientificName | String?  |                                    |
| category       | String   | Grain, Vegetable, Fruit, Field crop, … |
| description    | String?  |                                    |
| imageUrl       | String?  |                                    |
| createdAt      | DateTime |                                    |
| updatedAt      | DateTime |                                    |

Index: `name`.

Target: around 25–30 crops commonly grown in Thailand.

## CropRequirement (1:1 with Crop)

| Field                  | Type            | Notes                                        |
| ---------------------- | --------------- | -------------------------------------------- |
| id                     | UUID            | PK                                           |
| cropId                 | UUID            | Unique FK → Crop                             |
| allowedLandTypes       | LandType[]      | Site check                                   |
| minWaterSupply         | WaterSupply     | Site check: plot must be ≥ this              |
| preferredTextures      | SoilTexture[]   | Penalty if plot texture not listed           |
| phMin                  | Float           |                                              |
| phMax                  | Float           |                                              |
| phOptimal              | Float           |                                              |
| minOrganicMatterLevel  | NutrientLevel   |                                              |
| minNitrogenLevel       | NutrientLevel   |                                              |
| minPhosphorusLevel     | NutrientLevel   |                                              |
| minPotassiumLevel      | NutrientLevel   |                                              |
| source                 | String          | Citation                                     |
| createdAt / updatedAt  | DateTime        |                                              |

## NutrientLevelThreshold

Converts lab values to levels.

| Field  | Type          | Notes                                   |
| ------ | ------------- | --------------------------------------- |
| id     | UUID          | PK                                      |
| nutrient | Nutrient    | `organic_matter`, `phosphorus`, `potassium` |
| level  | NutrientLevel |                                         |
| min    | Float?        | inclusive, null = no lower bound        |
| max    | Float?        | exclusive, null = no upper bound        |
| unit   | String        | `%` or `mg/kg`                          |
| source | String        |                                         |

Unique: (`nutrient`, `level`).

## FertilizerRate

The total nutrient a crop needs per rai, for each soil level.

| Field     | Type          | Notes                                  |
| --------- | ------------- | -------------------------------------- |
| id        | UUID          | PK                                     |
| cropId    | UUID          | FK → Crop                              |
| nutrient  | Nutrient      | `nitrogen`, `phosphorus`, `potassium`  |
| soilLevel | NutrientLevel |                                        |
| kgPerRai  | Float         | kg of N, P₂O₅ or K₂O per rai           |
| source    | String        |                                        |

Unique: (`cropId`, `nutrient`, `soilLevel`).

## FertilizerStage

How a crop's total fertilizer is split over the season.

| Field             | Type   | Notes                                  |
| ----------------- | ------ | -------------------------------------- |
| id                | UUID   | PK                                     |
| cropId            | UUID   | FK → Crop                              |
| order             | Int    | 1, 2, 3 …                              |
| nameTh            | String | e.g. "รองพื้น", "แต่งหน้าครั้งที่ 1"          |
| nameEn            | String |                                        |
| daysAfterPlanting | Int    | 0 = at planting, negative = before     |
| nitrogenShare     | Float  | 0–1, the shares of each nutrient sum to 1 across stages |
| phosphorusShare   | Float  | 0–1                                    |
| potassiumShare    | Float  | 0–1                                    |
| source            | String |                                        |

Unique: (`cropId`, `order`).

## LimeRate

Lime needed to raise pH by one unit within a pH band, by texture, in CaCO₃ equivalent.
To go from pH A to pH B, the engine sums `rate × overlap` over every band between A and B.

| Field                  | Type        | Notes                                |
| ---------------------- | ----------- | ------------------------------------ |
| id                     | UUID        | PK                                   |
| soilTexture            | SoilTexture |                                      |
| phFrom                 | Float       | inclusive                            |
| phTo                   | Float       | exclusive                            |
| kgCaco3PerRaiPerPhUnit | Float       | kg CaCO₃ per rai per 1.0 pH unit     |
| source                 | String      |                                      |

Unique: (`soilTexture`, `phFrom`).

Liming materials (ปูนมาร์ล, โดโลไมท์, ปูนขาว) and their CaCO₃-equivalent factors are constants in the backend, not a table.
Organic matter amendment rates (manure/compost kg per rai by organic matter level) are also backend constants, with the source cited in a comment.

---

# Removed from the previous schema

| Removed          | Reason                                           |
| ---------------- | ------------------------------------------------ |
| UploadedReport   | OCR and file upload removed                      |
| Recommendation   | Results are computed on demand                   |
| FavoriteCrop     | Replaced by `Plot.targetCropId`                  |
| SoilAnalysis.userId, province, region, season, moisture | Ownership and location belong to Plot; moisture is not used |
| CropRequirement N/P/K min/max/optimal (mg/kg) | Replaced by level-based minimums and FertilizerRate |

---

# Design Principles

* UUID primary keys
* UTC timestamps
* Prisma enums for fixed value sets
* No soft delete
* Master data is normalized and cited
* Only Prisma manages the schema. Migrations start at `prisma/migrations/*_v2_baseline`
* Tests use a separate database `plantable_test` (`backend/.env.test`, gitignored)
