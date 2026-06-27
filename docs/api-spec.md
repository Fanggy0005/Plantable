# API Specification

## Overview

Base URL

```text
/api
```

Response Format

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

---

# Authentication

Authentication uses Better Auth.

Protected endpoints require a valid authenticated session.

---

# Crop APIs

---

## Get All Crops

GET

```text
/api/crops
```

Description

Returns all available crops.

Query Parameters

| Name     | Type   | Required |
| -------- | ------ | -------- |
| search   | string | No       |
| category | string | No       |

Response

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Rice",
      "category": "Grain"
    }
  ]
}
```

---

## Get Crop Detail

GET

```text
/api/crops/:id
```

Response

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Rice",
    "description": "",
    "requirement": {}
  }
}
```

---

# Soil Analysis APIs

---

## Create Soil Analysis

POST

```text
/api/analyses
```

Request

```json
{
  "nitrogen": 50,
  "phosphorus": 30,
  "potassium": 40,
  "ph": 6.2
}
```

Validation

| Field      | Rule   |
| ---------- | ------ |
| nitrogen   | >= 0   |
| phosphorus | >= 0   |
| potassium  | >= 0   |
| ph         | 0 - 14 |

Response

```json
{
  "success": true,
  "data": {
    "analysisId": "uuid"
  }
}
```

---

## Get Analysis

GET

```text
/api/analyses/:id
```

Returns

* Soil values
* Recommendations
* Suitability score
* Improvement suggestions

---

## Get Analysis History

GET

```text
/api/analyses/history
```

Authentication Required

Returns all analyses belonging to the current user.

---

# Recommendation APIs

---

## Generate Recommendation

POST

```text
/api/recommendations
```

Request

```json
{
  "analysisId": "uuid"
}
```

Response

```json
{
  "success": true,
  "data": [
    {
      "cropId": "uuid",
      "cropName": "Rice",
      "score": 95,
      "level": "Excellent",
      "reasons": [
        "Nitrogen is within the optimal range.",
        "pH is suitable."
      ],
      "improvementSuggestions": [
        "Increase potassium slightly."
      ]
    }
  ]
}
```

Recommendations are sorted by score in descending order.

---

# User APIs

---

## Get Profile

GET

```text
/api/users/me
```

Authentication Required

Returns current user.

---

## Update Profile

PATCH

```text
/api/users/me
```

Request

```json
{
  "name": "John Doe"
}
```

---

# Favorite Crop APIs

---

## Get Favorites

GET

```text
/api/favorites
```

Authentication Required

---

## Add Favorite

POST

```text
/api/favorites
```

Request

```json
{
  "cropId": "uuid"
}
```

---

## Remove Favorite

DELETE

```text
/api/favorites/:cropId
```

---

# File Upload APIs

---

## Upload Soil Report

POST

```text
/api/uploads
```

Multipart Form Data

Fields

| Name | Type |
| ---- | ---- |
| file | File |

Allowed Types

* PDF
* PNG
* JPG
* JPEG

Maximum Size

10 MB

Response

```json
{
  "success": true,
  "data": {
    "fileId": "uuid",
    "fileUrl": ""
  }
}
```

---

# OCR APIs

---

## Extract Soil Data

POST

```text
/api/ocr
```

Request

```json
{
  "fileId": "uuid"
}
```

Response

```json
{
  "success": true,
  "data": {
    "nitrogen": 42,
    "phosphorus": 28,
    "potassium": 31,
    "ph": 6.5
  }
}
```

---

# AI APIs (Future)

---

## Explain Analysis

POST

```text
/api/ai/explain
```

Request

```json
{
  "analysisId": "uuid"
}
```

Returns

* Explanation
* Soil improvement advice
* Planting tips

AI must not calculate recommendation scores.

---

# Error Codes

| Code | Meaning               |
| ---- | --------------------- |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Not Found             |
| 409  | Conflict              |
| 422  | Validation Error      |
| 500  | Internal Server Error |

---

# Validation Rules

* Validate all requests using Zod.
* Reject unknown fields.
* Return readable validation messages.
* Never trust client input.

---

# API Design Rules

* RESTful endpoints only.
* Use plural resource names.
* Use UUID identifiers.
* Return JSON responses.
* Keep response structures consistent.
* Use proper HTTP status codes.
* Paginate list endpoints.
* Do not expose internal database fields.

---

# Versioning

Current Version

```text
v1
```

Future

```text
/api/v2
```

Breaking changes must be introduced through a new API version rather than modifying existing endpoints.
