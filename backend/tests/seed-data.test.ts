import { describe, expect, it } from "bun:test"
import { CROPS } from "../prisma/seed-data/crops"
import { SAMPLE_CROP_AGRONOMY } from "../prisma/seed-data/sample-agronomy"
import { CATEGORY_GROUP, CROP_GROUPS } from "../src/constants/crop-categories"

// Guards the seed files: a typo here would only show up as a bad recommendation.

describe("crop seed data", () => {
  it("has unique English and Thai names", () => {
    expect(new Set(CROPS.map((c) => c.name)).size).toBe(CROPS.length)
    expect(new Set(CROPS.map((c) => c.nameTh)).size).toBe(CROPS.length)
  })

  it("pairs every catalog crop with agronomy data and vice versa", () => {
    expect(Object.keys(SAMPLE_CROP_AGRONOMY).sort()).toEqual(CROPS.map((c) => c.name).sort())
  })

  it("covers every crop group", () => {
    const groups = new Set(CROPS.map((c) => CATEGORY_GROUP[c.category]))
    expect([...groups].sort()).toEqual([...CROP_GROUPS].sort())
  })

  for (const crop of CROPS) {
    const a = SAMPLE_CROP_AGRONOMY[crop.name]

    it(`${crop.name}: valid category, site and pH`, () => {
      expect(CATEGORY_GROUP[crop.category]).toBeDefined()
      expect(a).toBeDefined()
      if (!a) return
      expect(a.allowedLandTypes.length).toBeGreaterThan(0)
      expect(a.preferredTextures.length).toBeGreaterThan(0)
      expect(a.phMin).toBeGreaterThanOrEqual(3)
      expect(a.phMax).toBeLessThanOrEqual(10)
      expect(a.phMin).toBeLessThanOrEqual(a.phOptimal)
      expect(a.phOptimal).toBeLessThanOrEqual(a.phMax)
    })

    it(`${crop.name}: fertilizer never increases as the soil level rises`, () => {
      if (!a) return
      for (const [low, medium, high] of Object.values(a.fertilizer)) {
        expect(high).toBeGreaterThanOrEqual(0)
        expect(medium).toBeGreaterThanOrEqual(high)
        expect(low).toBeGreaterThanOrEqual(medium)
      }
    })
  }
})
