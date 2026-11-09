import { describe, expect, it } from "bun:test"
import type { SoilPlan } from "../../src/services/engine"
import { SAMPLE_DATA_WARNING } from "../../src/services/data-quality"
import type { RecommendationResponse } from "../../src/services/recommendation.service"
import { KIT_SOIL, LAB_SOIL, UPLAND_SITE, call, cropIdByName } from "../helpers"

describe("POST /api/recommendations", () => {
  it("ranks crops for lab input, lists site mismatches, and flags sample data", async () => {
    const res = await call<RecommendationResponse>("POST", "/api/recommendations", {
      body: { site: UPLAND_SITE, soil: LAB_SOIL },
    })

    expect(res.status).toBe(200)
    const data = res.body.data
    expect(data.levels).toMatchObject({ organicMatter: "low", phosphorus: "low", potassium: "low" })
    expect(data.ranked.length).toBeGreaterThan(0)
    expect(data.ineligible.map((c) => c.cropName)).toContain("Rice")
    expect(data.warnings).toContain(SAMPLE_DATA_WARNING)
    expect(data.ranked.every((c) => typeof c.group === "string" && typeof c.category === "string")).toBe(true)

    const scores = data.ranked.map((c) => c.score)
    expect(scores).toEqual([...scores].sort((a, b) => b - a))
  })

  it("accepts test-kit input", async () => {
    const res = await call<RecommendationResponse>("POST", "/api/recommendations", {
      body: { site: UPLAND_SITE, soil: KIT_SOIL },
    })
    expect(res.status).toBe(200)
    expect(res.body.data.levels).toMatchObject({ nitrogen: "medium", organicMatterEstimated: true })
  })

  it.each([
    ["pH out of range", { site: UPLAND_SITE, soil: { ...LAB_SOIL, ph: 11 } }],
    ["fields from the other mode", { site: UPLAND_SITE, soil: { ...LAB_SOIL, nitrogenLevel: "low" } }],
    ["missing lab value", { site: UPLAND_SITE, soil: { inputMode: "lab", ph: 6, organicMatterPct: 2 } }],
    ["unknown level", { site: UPLAND_SITE, soil: { ...KIT_SOIL, potassiumLevel: "very_high" } }],
    ["missing site", { soil: LAB_SOIL }],
    ["unknown top-level field", { site: UPLAND_SITE, soil: LAB_SOIL, extra: true }],
  ])("rejects %s with 422 and the error envelope", async (_label, body) => {
    const res = await call("POST", "/api/recommendations", { body })
    expect(res.status).toBe(422)
    expect(res.body.success).toBe(false)
    expect(res.body.message).toBe("Validation Error")
    expect(res.body.errors?.length).toBeGreaterThan(0)
  })
})

describe("POST /api/soil-plans", () => {
  it("builds a quantified plan for the chosen crop and area", async () => {
    const cropId = await cropIdByName("Corn")
    const res = await call<SoilPlan>("POST", "/api/soil-plans", {
      body: { cropId, areaRai: 5, mode: "combined", site: UPLAND_SITE, soil: LAB_SOIL },
    })

    expect(res.status).toBe(200)
    const plan = res.body.data
    expect(plan.areaRai).toBe(5)
    expect(plan.steps[0]?.type).toBe("ph_correction")
    expect(plan.steps.at(-1)?.type).toBe("retest")
    expect(plan.steps.some((s) => s.type === "fertilizer" && s.products.length > 0)).toBe(true)
    expect(plan.warnings[0]).toBe(SAMPLE_DATA_WARNING)
  })

  it("returns 404 for an unknown crop", async () => {
    const res = await call("POST", "/api/soil-plans", {
      body: { cropId: crypto.randomUUID(), areaRai: 1, mode: "chemical", site: UPLAND_SITE, soil: LAB_SOIL },
    })
    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
  })

  it("rejects a non-positive area", async () => {
    const cropId = await cropIdByName("Corn")
    const res = await call("POST", "/api/soil-plans", {
      body: { cropId, areaRai: 0, mode: "chemical", site: UPLAND_SITE, soil: LAB_SOIL },
    })
    expect(res.status).toBe(422)
  })
})

describe("crops", () => {
  it("GET /api/crops lists the catalog", async () => {
    const res = await call<Array<{ name: string }>>("GET", "/api/crops")
    expect(res.status).toBe(200)
    expect(res.body.data.length).toBeGreaterThanOrEqual(30)
  })

  it("filters by group and by category, and returns the derived group", async () => {
    const field = await call<Array<{ name: string; group: string; category: string }>>(
      "GET",
      "/api/crops?group=field_crop"
    )
    expect(field.status).toBe(200)
    expect(field.body.data.length).toBeGreaterThan(0)
    expect(field.body.data.every((c) => c.group === "field_crop")).toBe(true)
    expect(field.body.data.map((c) => c.name)).toContain("Mung Bean")

    const leafy = await call<Array<{ category: string; group: string }>>("GET", "/api/crops?category=leafy_vegetable")
    expect(leafy.body.data.length).toBeGreaterThan(0)
    expect(leafy.body.data.every((c) => c.category === "leafy_vegetable" && c.group === "horticulture")).toBe(true)
  })

  it("rejects an unknown group or category", async () => {
    expect((await call("GET", "/api/crops?group=flowers")).status).toBe(422)
    expect((await call("GET", "/api/crops?category=Grain")).status).toBe(422)
  })

  it("GET /api/crops/:id returns requirement and stages", async () => {
    const res = await call<{ requirement: { source: string }; fertilizerStages: unknown[] }>(
      "GET",
      `/api/crops/${await cropIdByName("Cassava")}`
    )
    expect(res.status).toBe(200)
    expect(res.body.data.requirement.source).toBeDefined()
    expect(res.body.data.fertilizerStages.length).toBeGreaterThan(0)
  })

  it("returns 422 for a malformed id and 404 for an unknown one", async () => {
    expect((await call("GET", "/api/crops/not-a-uuid")).status).toBe(422)
    expect((await call("GET", `/api/crops/${crypto.randomUUID()}`)).status).toBe(404)
  })
})
