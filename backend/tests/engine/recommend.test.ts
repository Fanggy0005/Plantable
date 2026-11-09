import { describe, expect, it } from "bun:test"
import { recommendCrops } from "../../src/services/engine"
import type { LabSoilInput, RankedCrop } from "../../src/services/engine"
import { THRESHOLDS, UPLAND_LOAM_RAINFED, crop, requirement } from "./fixtures"

// pH 6.5, organic matter / P / K all "medium": meets every default requirement
const GOOD_SOIL: LabSoilInput = {
  inputMode: "lab",
  ph: 6.5,
  organicMatterPct: 2.0,
  phosphorusMgKg: 15,
  potassiumMgKg: 80,
}

function rankOne(soil: LabSoilInput, req = requirement(), site = UPLAND_LOAM_RAINFED): RankedCrop {
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

  it("penalizes a texture the crop does not prefer", () => {
    const r = rankOne(GOOD_SOIL, requirement({ preferredTextures: ["clay"] }))
    expect(r.penalties).toEqual([{ factor: "texture", points: 15 }])
    expect(r.score).toBe(85)
  })

  it("penalizes low pH per started 0.5 unit, capped", () => {
    expect(rankOne({ ...GOOD_SOIL, ph: 5.0 }).penalties).toEqual([{ factor: "ph_low", points: 8 }])
    expect(rankOne({ ...GOOD_SOIL, ph: 4.9 }).penalties).toEqual([{ factor: "ph_low", points: 16 }])
    expect(rankOne({ ...GOOD_SOIL, ph: 3.0 }).penalties).toEqual([{ factor: "ph_low", points: 40 }])
  })

  it("penalizes high pH more than low pH", () => {
    const r = rankOne({ ...GOOD_SOIL, ph: 7.3 })
    expect(r.penalties).toEqual([{ factor: "ph_high", points: 12 }])
    expect(r.difficulty).toBe("hard")
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
