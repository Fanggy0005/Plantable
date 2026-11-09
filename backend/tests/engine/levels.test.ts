import { describe, expect, it } from "bun:test"
import { classifyValue, normalizeSoilLevels } from "../../src/services/engine/levels"
import { THRESHOLDS } from "./fixtures"

describe("classifyValue", () => {
  it("treats min as inclusive and max as exclusive", () => {
    expect(classifyValue("organic_matter", 1.49, THRESHOLDS)).toBe("low")
    expect(classifyValue("organic_matter", 1.5, THRESHOLDS)).toBe("medium")
    expect(classifyValue("organic_matter", 3.5, THRESHOLDS)).toBe("high")
  })

  it("handles open-ended ranges", () => {
    expect(classifyValue("phosphorus", 0, THRESHOLDS)).toBe("low")
    expect(classifyValue("potassium", 10_000, THRESHOLDS)).toBe("high")
  })

  it("throws when master data has no threshold for the nutrient", () => {
    expect(() => classifyValue("phosphorus", 5, [])).toThrow()
  })
})

describe("normalizeSoilLevels", () => {
  it("lab mode: classifies values and derives nitrogen from organic matter", () => {
    const levels = normalizeSoilLevels(
      { inputMode: "lab", ph: 6, organicMatterPct: 1.0, phosphorusMgKg: 15, potassiumMgKg: 150 },
      THRESHOLDS
    )
    expect(levels).toEqual({
      organicMatter: "low",
      nitrogen: "low",
      phosphorus: "medium",
      potassium: "high",
      organicMatterEstimated: false,
      nitrogenEstimated: true,
    })
  })

  it("test-kit mode: uses the kit levels and derives organic matter from nitrogen", () => {
    const levels = normalizeSoilLevels(
      { inputMode: "test_kit", ph: 6, nitrogenLevel: "high", phosphorusLevel: "low", potassiumLevel: "medium" },
      THRESHOLDS
    )
    expect(levels).toEqual({
      organicMatter: "high",
      nitrogen: "high",
      phosphorus: "low",
      potassium: "medium",
      organicMatterEstimated: true,
      nitrogenEstimated: false,
    })
  })
})
