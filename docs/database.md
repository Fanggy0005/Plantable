# Database Design

## Overview

This project uses **PostgreSQL** with **Prisma ORM**.

The database is designed to support:

* User authentication
* Soil analysis history
* Crop recommendation
* Suitability score calculation
* Crop requirement data
* Future AI features
* OCR imported reports

---

# Entity Relationship

```
User
 ├── SoilAnalysis
 │      ├── Recommendation
 │      └── UploadedReport
 │
 └── FavoriteCrop

Crop
 └── CropRequirement
```

---

# Tables

---

## User

Stores user information.

| Field     | Type     | Description       |
| --------- | -------- | ----------------- |
| id        | UUID     | Primary Key       |
| email     | String   | Unique            |
| name      | String   | Display name      |
| image     | String?  | Profile image     |
| createdAt | DateTime | Created timestamp |
| updatedAt | DateTime | Updated timestamp |

Relation

* One User has many SoilAnalysis
* One User has many FavoriteCrop

---

## Crop

Master data for all crops.

| Field          | Type |
| -------------- | ---- |
| id             | UUID |
| name           |      |
| scientificName |      |
| category       |      |
| description    |      |
| imageUrl       |      |
| createdAt      |      |
| updatedAt      |      |

Example

* Rice
* Corn
* Cassava
* Sugarcane
* Tomato

Relation

* One Crop has one CropRequirement
* One Crop has many Recommendation

---

## CropRequirement

Stores recommended soil values.

| Field            |
| ---------------- |
| id               |
| cropId           |
| nitrogenMin      |
| nitrogenMax      |
| phosphorusMin    |
| phosphorusMax    |
| potassiumMin     |
| potassiumMax     |
| phMin            |
| phMax            |
| organicMatterMin |
| organicMatterMax |

Relation

* Belongs to Crop

---

## SoilAnalysis

Stores user soil analysis.

| Field         |
| ------------- |
| id            |
| userId        |
| nitrogen      |
| phosphorus    |
| potassium     |
| ph            |
| organicMatter |
| moisture      |
| notes         |
| createdAt     |

Relation

* Belongs to User
* Has many Recommendation
* Has one UploadedReport

---

## Recommendation

Stores calculated recommendation results.

| Field                 |
| --------------------- |
| id                    |
| soilAnalysisId        |
| cropId                |
| suitabilityScore      |
| recommendationLevel   |
| reason                |
| improvementSuggestion |

recommendationLevel

* Excellent
* Good
* Fair
* Poor
* Not Recommended

Relation

* Belongs to SoilAnalysis
* Belongs to Crop

---

## FavoriteCrop

Stores user's favorite crops.

| Field     |
| --------- |
| id        |
| userId    |
| cropId    |
| createdAt |

---

## UploadedReport

Stores uploaded files.

| Field          |
| -------------- |
| id             |
| soilAnalysisId |
| fileUrl        |
| fileType       |
| ocrStatus      |
| extractedData  |
| createdAt      |

fileType

* pdf
* image

ocrStatus

* pending
* processing
* completed
* failed

---

# Relationships

User

1 -> N SoilAnalysis

User

1 -> N FavoriteCrop

Crop

1 -> 1 CropRequirement

Crop

1 -> N Recommendation

SoilAnalysis

1 -> N Recommendation

SoilAnalysis

1 -> 1 UploadedReport

---

# Indexes

User

* email

Crop

* name

SoilAnalysis

* userId
* createdAt

Recommendation

* soilAnalysisId
* cropId
* suitabilityScore

---

# Future Expansion

Planned tables

* WeatherHistory
* Fertilizer
* FertilizerRecommendation
* CropYieldPrediction
* SoilRegion
* AIConversation
* Notification

These tables are intentionally excluded from the MVP schema to keep the initial implementation simple.

---

# Design Principles

* UUID as primary key
* Soft delete is not required for MVP
* All timestamps use UTC
* Normalize master data
* Recommendation results are stored instead of recalculated every request
* Database is optimized for PostgreSQL + Prisma ORM
