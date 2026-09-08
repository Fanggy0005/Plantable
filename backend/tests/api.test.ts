import { describe, expect, it } from "bun:test"
import { Elysia } from "elysia"
import { cropRoutes } from "../src/routes/crop.routes"
import { analysisRoutes } from "../src/routes/analysis.routes"

const app = new Elysia()
  .use(cropRoutes)
  .use(analysisRoutes)
  .get("/health", () => ({ status: "ok" }))

describe("API Endpoints Integration Tests", () => {
  it("GET /health should return status ok", async () => {
    const response = await app.handle(new Request("http://localhost/health"))
    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.status).toBe("ok")
  })

  it("GET /api/crops should return seeded crops list", async () => {
    const response = await app.handle(new Request("http://localhost/api/crops"))
    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.success).toBe(true)
    expect(Array.isArray(json.data)).toBe(true)
    expect(json.data.length).toBeGreaterThanOrEqual(10)
  })

  it("GET /api/crops?category=Grain should filter correctly", async () => {
    const response = await app.handle(new Request("http://localhost/api/crops?category=Grain"))
    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.success).toBe(true)
    expect(json.data.every((c: any) => c.category === "Grain")).toBe(true)
  })

  it("POST /api/analyses should analyze soil and return recommendations", async () => {
    const soilSample = {
      nitrogen: 120,
      phosphorus: 45,
      potassium: 45,
      ph: 6.0,
    }

    const response = await app.handle(
      new Request("http://localhost/api/analyses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(soilSample),
      })
    )

    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.success).toBe(true)
    expect(json.data.analysisId).toBeDefined()
    expect(Array.isArray(json.data.recommendations)).toBe(true)
    expect(json.data.recommendations.length).toBeGreaterThanOrEqual(10)

    // Verify the highest score crop
    const topCrop = json.data.recommendations[0]
    expect(topCrop.cropName).toBeDefined()
    expect(topCrop.score).toBeGreaterThan(0)
    expect(topCrop.breakdown).toBeDefined()
  }, 15000)

  it("POST /api/recommendations should return instant calculation", async () => {
    const soilSample = {
      nitrogen: 80,
      phosphorus: 30,
      potassium: 30,
      ph: 5.5,
    }

    const response = await app.handle(
      new Request("http://localhost/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(soilSample),
      })
    )

    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.success).toBe(true)
    expect(json.data.rankings).toBeDefined()
    expect(json.data.rankings.length).toBeGreaterThanOrEqual(1)
  })

  it("POST /api/analyses should reject invalid pH values", async () => {
    const invalidSoil = {
      nitrogen: 50,
      phosphorus: 50,
      potassium: 50,
      ph: 15, // Invalid pH > 14
    }

    const response = await app.handle(
      new Request("http://localhost/api/analyses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidSoil),
      })
    )

    // Validation failure in Elysia returns 422 or 400
    expect(response.status).toBeGreaterThanOrEqual(400)
  })
})
