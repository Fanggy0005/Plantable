import { afterAll, beforeAll, describe, expect, it } from "bun:test"
import type { AnalysisSummary } from "../../src/services/analysis-mapper"
import type { RecommendationResponse } from "../../src/services/recommendation.service"
import type { SoilPlan } from "../../src/services/engine"
import { KIT_SOIL, LAB_SOIL, call, cleanupUsers, cropIdByName, signUp, type TestUser } from "../helpers"

interface PlotData {
  id: string
  name: string
  areaRai: number
  targetCropId: string | null
  latestAnalysis?: AnalysisSummary | null
}

const NEW_PLOT = {
  name: "แปลงหลังบ้าน",
  areaRai: 4,
  province: "ขอนแก่น",
  landType: "upland",
  waterSupply: "rainfed",
  soilTexture: "loam",
}

let owner: TestUser
let stranger: TestUser
let plotId: string
let labAnalysisId: string

beforeAll(async () => {
  owner = await signUp()
  stranger = await signUp()
})

afterAll(async () => {
  await cleanupUsers()
})

describe("authentication", () => {
  it.each([
    ["GET", "/api/plots"],
    ["POST", "/api/plots"],
    ["GET", `/api/analyses/${crypto.randomUUID()}`],
    ["GET", "/api/users/me"],
  ])("%s %s requires login", async (method, path) => {
    const res = await call(method, path, method === "POST" ? { body: NEW_PLOT } : {})
    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
  })
})

describe("plots", () => {
  it("creates a plot", async () => {
    const res = await call<PlotData>("POST", "/api/plots", { body: NEW_PLOT, user: owner })
    expect(res.status).toBe(201)
    expect(res.body.data).toMatchObject({ name: NEW_PLOT.name, areaRai: 4, targetCropId: null })
    plotId = res.body.data.id
  })

  it("rejects a target crop that does not exist", async () => {
    const res = await call("PATCH", `/api/plots/${plotId}`, {
      body: { targetCropId: crypto.randomUUID() },
      user: owner,
    })
    expect(res.status).toBe(422)
  })

  it("rejects invalid plot fields", async () => {
    const res = await call("POST", "/api/plots", { body: { ...NEW_PLOT, areaRai: -1 }, user: owner })
    expect(res.status).toBe(422)
  })
})

describe("soil analyses", () => {
  it("saves a lab-mode test with derived levels", async () => {
    const res = await call<AnalysisSummary>("POST", `/api/plots/${plotId}/analyses`, {
      body: { soil: LAB_SOIL, sampledAt: "2026-05-01" },
      user: owner,
    })
    expect(res.status).toBe(201)
    expect(res.body.data.soil).toEqual(LAB_SOIL)
    expect(res.body.data.levels.nitrogenEstimated).toBe(true)
    labAnalysisId = res.body.data.id
  })

  it("saves a test-kit-mode test", async () => {
    const res = await call<AnalysisSummary>("POST", `/api/plots/${plotId}/analyses`, {
      body: { soil: KIT_SOIL, sampledAt: "2026-09-01", notes: "หลังใส่ปูน" },
      user: owner,
    })
    expect(res.status).toBe(201)
    expect(res.body.data.soil).toEqual(KIT_SOIL)
  })

  it("lists history newest first, and the plot list shows the latest test", async () => {
    const history = await call<AnalysisSummary[]>("GET", `/api/plots/${plotId}/analyses`, { user: owner })
    expect(history.body.data.map((a) => a.sampledAt)).toEqual(["2026-09-01", "2026-05-01"])

    const plots = await call<PlotData[]>("GET", "/api/plots", { user: owner })
    expect(plots.body.data[0]?.latestAnalysis?.sampledAt).toBe("2026-09-01")
  })

  it("recomputes recommendations for a stored test", async () => {
    const res = await call<{ recommendation: RecommendationResponse }>("GET", `/api/analyses/${labAnalysisId}`, {
      user: owner,
    })
    expect(res.status).toBe(200)
    expect(res.body.data.recommendation.ranked.length).toBeGreaterThan(0)
  })

  it("needs a target crop or cropId for the soil plan", async () => {
    const without = await call("GET", `/api/analyses/${labAnalysisId}/soil-plan`, { user: owner })
    expect(without.status).toBe(422)

    const cornId = await cropIdByName("Corn")
    const withQuery = await call<SoilPlan>("GET", `/api/analyses/${labAnalysisId}/soil-plan?cropId=${cornId}`, {
      user: owner,
    })
    expect(withQuery.status).toBe(200)
    expect(withQuery.body.data.areaRai).toBe(4)
    expect(withQuery.body.data.mode).toBe("combined")
  })

  it("uses the plot's target crop by default", async () => {
    const cassavaId = await cropIdByName("Cassava")
    const patch = await call<PlotData>("PATCH", `/api/plots/${plotId}`, {
      body: { targetCropId: cassavaId },
      user: owner,
    })
    expect(patch.body.data.targetCropId).toBe(cassavaId)

    const plan = await call<SoilPlan>("GET", `/api/analyses/${labAnalysisId}/soil-plan?mode=organic`, { user: owner })
    expect(plan.status).toBe(200)
    expect(plan.body.data.cropId).toBe(cassavaId)
    expect(plan.body.data.mode).toBe("organic")
  })
})

describe("ownership", () => {
  it.each([
    ["GET", () => `/api/plots/${plotId}`],
    ["PATCH", () => `/api/plots/${plotId}`],
    ["DELETE", () => `/api/plots/${plotId}`],
    ["GET", () => `/api/plots/${plotId}/analyses`],
    ["POST", () => `/api/plots/${plotId}/analyses`],
    ["GET", () => `/api/analyses/${labAnalysisId}`],
    ["GET", () => `/api/analyses/${labAnalysisId}/soil-plan`],
    ["DELETE", () => `/api/analyses/${labAnalysisId}`],
  ])("another user gets 404 on %s %s", async (method, path) => {
    const body =
      method === "POST"
        ? { soil: LAB_SOIL, sampledAt: "2026-01-01" }
        : method === "PATCH"
          ? { name: "hijacked" }
          : undefined
    const res = await call(method, path(), { body, user: stranger })
    expect(res.status).toBe(404)
  })

  it("leaves the owner's data untouched", async () => {
    const res = await call<PlotData>("GET", `/api/plots/${plotId}`, { user: owner })
    expect(res.body.data.name).toBe(NEW_PLOT.name)
    const stranger_plots = await call<PlotData[]>("GET", "/api/plots", { user: stranger })
    expect(stranger_plots.body.data).toEqual([])
  })
})

describe("deletion", () => {
  it("deletes an analysis, then the plot", async () => {
    expect((await call("DELETE", `/api/analyses/${labAnalysisId}`, { user: owner })).status).toBe(200)
    expect((await call("GET", `/api/analyses/${labAnalysisId}`, { user: owner })).status).toBe(404)

    expect((await call("DELETE", `/api/plots/${plotId}`, { user: owner })).status).toBe(200)
    expect((await call("GET", `/api/plots/${plotId}`, { user: owner })).status).toBe(404)
  })
})
