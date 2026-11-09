import { describe, expect, it } from "bun:test"
import { recommendCrops } from "../../src/services/engine"
import type { LabSoilInput, PenaltyFactor, RankedCrop, SiteInput, SoilInput, TestKitSoilInput } from "../../src/services/engine"
import { THRESHOLDS, UPLAND_LOAM_RAINFED, crop, requirement } from "./fixtures"

function penalty(r: RankedCrop, factor: PenaltyFactor): number {
  return r.penalties.find((p) => p.factor === factor)?.points ?? 0
}

// pH 6.5, organic matter / P / K all "medium": meets every default requirement
const GOOD_SOIL: LabSoilInput = {
  inputMode: "lab",
  ph: 6.5,
  organicMatterPct: 2.0,
  phosphorusMgKg: 15,
  potassiumMgKg: 80,
}

function rankOne(soil: SoilInput, req = requirement(), site: SiteInput = UPLAND_LOAM_RAINFED): RankedCrop {
  const result = recommendCrops(site, soil, [crop("A", req)], THRESHOLDS)
  const ranked = result.ranked[0]
  if (!ranked) throw new Error("crop was not ranked")
  return ranked
}

describe("score and difficulty", () => {
  it("gives 100 / Excellent / easy when the soil meets every requirement", () => {
    const r = rankOne(GOOD_SOIL)
    expect(r.score).toBe(100)
    expect(r.level).toBe("Excellent")
    expect(r.difficulty).toBe("easy")
    expect(r.penalties).toEqual([])
  })

  it("penalizes texture by steps from the nearest preferred texture (clay ↔ loam ↔ sandy)", () => {
    const oneStep = rankOne(GOOD_SOIL, requirement({ preferredTextures: ["clay"] }))
    expect(oneStep.penalties).toEqual([{ factor: "texture", points: 10 }])
    expect(oneStep.score).toBe(90)

    const sandy = { ...UPLAND_LOAM_RAINFED, soilTexture: "sandy" } as const
    expect(rankOne(GOOD_SOIL, requirement({ preferredTextures: ["clay"] }), sandy).penalties).toEqual([
      { factor: "texture", points: 20 },
    ])
    // the nearest preferred texture counts
    expect(rankOne(GOOD_SOIL, requirement({ preferredTextures: ["clay", "loam"] }), sandy).penalties).toEqual([
      { factor: "texture", points: 10 },
    ])
  })

  it("penalizes low pH per started 0.5 unit, capped", () => {
    expect(penalty(rankOne({ ...GOOD_SOIL, ph: 5.0 }), "ph_low")).toBe(8)
    expect(penalty(rankOne({ ...GOOD_SOIL, ph: 4.9 }), "ph_low")).toBe(16)
    expect(penalty(rankOne({ ...GOOD_SOIL, ph: 3.0 }), "ph_low")).toBe(40)
  })

  it("penalizes high pH more than low pH", () => {
    const r = rankOne({ ...GOOD_SOIL, ph: 7.3 })
    expect(penalty(r, "ph_high")).toBe(12)
    expect(r.difficulty).toBe("hard")
  })

  it("penalizes distance from the optimal pH inside the range", () => {
    // range 5.5–7.0, optimum 6.5
    expect(rankOne(GOOD_SOIL).penalties).toEqual([])
    expect(rankOne({ ...GOOD_SOIL, ph: 6.0 }).penalties).toEqual([{ factor: "ph_off_optimal", points: 3 }])
    expect(rankOne({ ...GOOD_SOIL, ph: 5.5 }).penalties).toEqual([{ factor: "ph_off_optimal", points: 5 }])
    expect(rankOne({ ...GOOD_SOIL, ph: 7.0 }).penalties).toEqual([{ factor: "ph_off_optimal", points: 3 }])
    expect(rankOne({ ...GOOD_SOIL, ph: 6.0 }).reasons[0]).toContain("ค่าที่เหมาะที่สุดคือ 6.5")
  })

  it("never raises the score as pH moves further from the optimum", () => {
    for (const phs of [
      [6.5, 6.2, 6.0, 5.8, 5.5, 5.4, 5.0, 4.6, 4.0, 3.5],
      [6.5, 6.8, 7.0, 7.1, 7.5, 8.0],
    ]) {
      const scores = phs.map((ph) => rankOne({ ...GOOD_SOIL, ph }).score)
      expect(scores).toEqual([...scores].sort((a, b) => b - a))
    }
  })

  it("rates a small pH gap below range as moderate, a large one as hard", () => {
    expect(rankOne({ ...GOOD_SOIL, ph: 5.1 }).difficulty).toBe("moderate")
    expect(rankOne({ ...GOOD_SOIL, ph: 4.3 }).difficulty).toBe("hard")
  })

  it("marks pH 4.2 for a crop needing 6.5+ as not_feasible and caps it at Not Recommended", () => {
    const r = rankOne({ ...GOOD_SOIL, ph: 4.2 }, requirement({ phMin: 6.5, phMax: 7.5, phOptimal: 7.0 }))
    expect(r.difficulty).toBe("not_feasible")
    expect(r.score).toBeLessThanOrEqual(39)
    expect(r.level).toBe("Not Recommended")
  })

  it("marks pH more than 1.0 above range as not_feasible", () => {
    expect(rankOne({ ...GOOD_SOIL, ph: 8.1 }).difficulty).toBe("not_feasible")
  })

  it("penalizes organic matter below the crop minimum and makes it moderate", () => {
    const r = rankOne({ ...GOOD_SOIL, organicMatterPct: 1.0 }, requirement({ minNitrogenLevel: "low" }))
    expect(r.penalties).toEqual([{ factor: "organic_matter", points: 10 }])
    expect(r.difficulty).toBe("moderate")
  })

  it("penalizes N/P/K below minimum lightly, still easy", () => {
    const r = rankOne({ ...GOOD_SOIL, phosphorusMgKg: 5, potassiumMgKg: 30 })
    expect(r.penalties).toEqual([
      { factor: "phosphorus", points: 5 },
      { factor: "potassium", points: 5 },
    ])
    expect(r.difficulty).toBe("easy")
    expect(r.score).toBe(90)
  })

  it("does not penalize high nutrient levels", () => {
    expect(rankOne({ ...GOOD_SOIL, phosphorusMgKg: 50, potassiumMgKg: 200 }).penalties).toEqual([])
  })

  it("penalizes per level below the minimum", () => {
    const high = requirement({ minPhosphorusLevel: "high", minNitrogenLevel: "low" })
    expect(penalty(rankOne({ ...GOOD_SOIL, phosphorusMgKg: 15 }, high), "phosphorus")).toBe(5)
    expect(penalty(rankOne({ ...GOOD_SOIL, phosphorusMgKg: 5 }, high), "phosphorus")).toBe(10)

    const omHigh = requirement({ minOrganicMatterLevel: "high", minNitrogenLevel: "low" })
    expect(penalty(rankOne({ ...GOOD_SOIL, organicMatterPct: 1.0 }, omHigh), "organic_matter")).toBe(20)
  })
})

describe("organic matter and nitrogen from one measurement", () => {
  it("lab: low organic matter is not also counted as low nitrogen", () => {
    const r = rankOne({ ...GOOD_SOIL, organicMatterPct: 1.0 })
    expect(r.penalties).toEqual([{ factor: "organic_matter", points: 10 }])
    // the reason still tells the farmer nitrogen is low too
    expect(r.reasons.some((x) => x.includes("ประเมินจากอินทรียวัตถุ"))).toBe(true)
  })

  it("lab: keeps the nitrogen penalty when only the nitrogen minimum is missed", () => {
    const r = rankOne(GOOD_SOIL, requirement({ minNitrogenLevel: "high" }))
    expect(r.penalties).toEqual([{ factor: "nitrogen", points: 5 }])
  })

  it("test kit: counts low nitrogen once, keeping the larger penalty", () => {
    const kit: TestKitSoilInput = {
      inputMode: "test_kit",
      ph: 6.5,
      nitrogenLevel: "low",
      phosphorusLevel: "medium",
      potassiumLevel: "medium",
    }
    expect(rankOne(kit).penalties).toEqual([{ factor: "organic_matter", points: 10 }])
    // tie (10 vs 10): the measured factor, nitrogen, is kept
    expect(rankOne(kit, requirement({ minNitrogenLevel: "high" })).penalties).toEqual([
      { factor: "nitrogen", points: 10 },
    ])
  })
})

describe("recommendCrops", () => {
  it("lists crops failing the site check as ineligible with reasons", () => {
    const result = recommendCrops(
      UPLAND_LOAM_RAINFED,
      GOOD_SOIL,
      [
        crop("Rice", requirement({ allowedLandTypes: ["lowland"] })),
        crop("Durian", requirement({ minWaterSupply: "year_round" })),
        crop("Unknown", null),
        crop("Cassava"),
      ],
      THRESHOLDS
    )
    expect(result.ranked.map((r) => r.cropName)).toEqual(["Cassava"])
    expect(result.ineligible.map((r) => r.cropName)).toEqual(["Durian", "Rice", "Unknown"])
    for (const item of result.ineligible) {
      expect(item.reasons.length).toBeGreaterThan(0)
    }
  })

  it("sorts by score, then by easier difficulty", () => {
    const result = recommendCrops(
      UPLAND_LOAM_RAINFED,
      GOOD_SOIL,
      [
        // 90, moderate: organic matter below a "high" minimum
        crop("Moderate", requirement({ minOrganicMatterLevel: "high", minNitrogenLevel: "low" })),
        // 90, easy: P and K below a "high" minimum
        crop("Easy", requirement({ minPhosphorusLevel: "high", minPotassiumLevel: "high" })),
        // 100
        crop("Best"),
        // capped at 39
        crop("Infeasible", requirement({ phMin: 8.6, phMax: 9.0, phOptimal: 8.8 })),
      ],
      THRESHOLDS
    )
    expect(result.ranked.map((r) => [r.cropName, r.score, r.difficulty])).toEqual([
      ["Best", 100, "easy"],
      ["Easy", 90, "easy"],
      ["Moderate", 90, "moderate"],
      ["Infeasible", 39, "not_feasible"],
    ])
  })

  it("is deterministic", () => {
    const crops = [crop("A"), crop("B", requirement({ preferredTextures: ["sandy"] }))]
    const first = recommendCrops(UPLAND_LOAM_RAINFED, GOOD_SOIL, crops, THRESHOLDS)
    const second = recommendCrops(UPLAND_LOAM_RAINFED, GOOD_SOIL, crops, THRESHOLDS)
    expect(second).toEqual(first)
  })
})
