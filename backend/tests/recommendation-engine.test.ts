import { describe, expect, it } from "bun:test"
import {
  scoreNutrient,
  getRecommendationLevel,
  evaluateCropSuitability,
  rankCropsForSoil,
} from "../src/services/recommendation-engine.service"
import type { CropWithRequirement } from "../src/services/recommendation-engine.service"

describe("Recommendation Engine - Pure Scoring Tests", () => {
  describe("scoreNutrient", () => {
    it("should return 100 when nutrient matches optimal value exactly", () => {
      const result = scoreNutrient(120, 80, 160, 120)
      expect(result.status).toBe("optimal")
      expect(result.score).toBe(100)
    })

    it("should return between 80 and 100 when nutrient is within [min, max] range", () => {
      const atMin = scoreNutrient(80, 80, 160, 120)
      expect(atMin.status).toBe("optimal")
      expect(atMin.score).toBeGreaterThanOrEqual(80)
      expect(atMin.score).toBeLessThanOrEqual(100)

      const atMax = scoreNutrient(160, 80, 160, 120)
      expect(atMax.status).toBe("optimal")
      expect(atMax.score).toBeGreaterThanOrEqual(80)
      expect(atMax.score).toBeLessThanOrEqual(100)
    })

    it("should return score < 80 and status 'low' when nutrient is below min", () => {
      const severeDeficit = scoreNutrient(10, 80, 160, 120)
      expect(severeDeficit.status).toBe("low")
      expect(severeDeficit.score).toBeLessThan(80)
      expect(severeDeficit.score).toBeGreaterThanOrEqual(0)
    })

    it("should return score < 80 and status 'high' when nutrient exceeds max", () => {
      const excess = scoreNutrient(300, 80, 160, 120)
      expect(excess.status).toBe("high")
      expect(excess.score).toBeLessThan(80)
      expect(excess.score).toBeGreaterThanOrEqual(0)
    })

    it("should properly score pH values", () => {
      const perfectPh = scoreNutrient(6.0, 5.5, 7.0, 6.0)
      expect(perfectPh.score).toBe(100)
      expect(perfectPh.status).toBe("optimal")

      const acidicPh = scoreNutrient(4.0, 5.5, 7.0, 6.0)
      expect(acidicPh.status).toBe("low")
      expect(acidicPh.score).toBeLessThan(80)

      const alkalinePh = scoreNutrient(8.5, 5.5, 7.0, 6.0)
      expect(alkalinePh.status).toBe("high")
      expect(alkalinePh.score).toBeLessThan(80)
    })
  })

  describe("getRecommendationLevel", () => {
    it("should classify scores into the correct agronomic tiers", () => {
      expect(getRecommendationLevel(95)).toBe("Excellent")
      expect(getRecommendationLevel(90)).toBe("Excellent")
      expect(getRecommendationLevel(85)).toBe("Good")
      expect(getRecommendationLevel(75)).toBe("Good")
      expect(getRecommendationLevel(70)).toBe("Fair")
      expect(getRecommendationLevel(60)).toBe("Fair")
      expect(getRecommendationLevel(50)).toBe("Poor")
      expect(getRecommendationLevel(40)).toBe("Poor")
      expect(getRecommendationLevel(30)).toBe("Not Recommended")
      expect(getRecommendationLevel(0)).toBe("Not Recommended")
    })
  })

  describe("evaluateCropSuitability", () => {
    const mockCrop: CropWithRequirement = {
      id: "test-crop-rice",
      name: "Rice",
      nameTh: "ข้าว",
      scientificName: "Oryza sativa",
      category: "Grain",
      description: "Paddy crop",
      imageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      requirement: {
        id: "req-1",
        cropId: "test-crop-rice",
        nitrogenMin: 80,
        nitrogenMax: 160,
        nitrogenOptimal: 120,
        phosphorusMin: 30,
        phosphorusMax: 60,
        phosphorusOptimal: 45,
        potassiumMin: 30,
        potassiumMax: 60,
        potassiumOptimal: 45,
        phMin: 5.5,
        phMax: 7.0,
        phOptimal: 6.0,
        organicMatterMin: 1.5,
        organicMatterMax: 3.5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }

    it("should return an 'Excellent' rating (>= 90) when soil is at optimal values", () => {
      const optimalSoil = {
        nitrogen: 120,
        phosphorus: 45,
        potassium: 45,
        ph: 6.0,
      }

      const evalResult = evaluateCropSuitability(optimalSoil, mockCrop)
      expect(evalResult.score).toBe(100)
      expect(evalResult.level).toBe("Excellent")
      expect(evalResult.reasons.length).toBeGreaterThanOrEqual(4)
      expect(evalResult.improvementSuggestions.length).toBe(0) // No improvements needed for perfect soil
    })

    it("should generate actionable soil improvement suggestions when deficiencies exist", () => {
      const deficientSoil = {
        nitrogen: 30, // Deficit (< 80)
        phosphorus: 10, // Deficit (< 30)
        potassium: 15, // Deficit (< 30)
        ph: 4.5, // Acidic (< 5.5)
      }

      const evalResult = evaluateCropSuitability(deficientSoil, mockCrop)
      expect(evalResult.score).toBeLessThan(60)
      expect(evalResult.improvementSuggestions.length).toBeGreaterThanOrEqual(3)

      // Should suggest lime for acid pH
      const limeSuggestion = evalResult.improvementSuggestions.some((s) =>
        s.includes("ปูนขาว") || s.includes("โดโลไมท์")
      )
      expect(limeSuggestion).toBe(true)

      // Should suggest nitrogen fertilizer
      const nSuggestion = evalResult.improvementSuggestions.some((s) =>
        s.includes("ยูเรีย") || s.includes("ไนโตรเจน")
      )
      expect(nSuggestion).toBe(true)
    })
  })

  describe("rankCropsForSoil", () => {
    it("should rank crops deterministically in descending order of suitability score", () => {
      const crops: CropWithRequirement[] = [
        {
          id: "crop-a",
          name: "Crop A",
          nameTh: "พืชเอ",
          scientificName: null,
          category: "Grain",
          description: null,
          imageUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          requirement: {
            id: "req-a",
            cropId: "crop-a",
            nitrogenMin: 10,
            nitrogenMax: 30,
            nitrogenOptimal: 20,
            phosphorusMin: 10,
            phosphorusMax: 30,
            phosphorusOptimal: 20,
            potassiumMin: 10,
            potassiumMax: 30,
            potassiumOptimal: 20,
            phMin: 6.0,
            phMax: 7.0,
            phOptimal: 6.5,
            organicMatterMin: null,
            organicMatterMax: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        {
          id: "crop-b",
          name: "Crop B",
          nameTh: "พืชบี",
          scientificName: null,
          category: "Grain",
          description: null,
          imageUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          requirement: {
            id: "req-b",
            cropId: "crop-b",
            nitrogenMin: 100,
            nitrogenMax: 200,
            nitrogenOptimal: 150,
            phosphorusMin: 50,
            phosphorusMax: 100,
            phosphorusOptimal: 75,
            potassiumMin: 50,
            potassiumMax: 100,
            potassiumOptimal: 75,
            phMin: 6.0,
            phMax: 7.0,
            phOptimal: 6.5,
            organicMatterMin: null,
            organicMatterMax: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ]

      const soil = { nitrogen: 20, phosphorus: 20, potassium: 20, ph: 6.5 }
      const output = rankCropsForSoil(soil, crops)

      expect(output.recommendations.length).toBe(2)
      expect(output.recommendations[0].cropId).toBe("crop-a")
      expect(output.recommendations[0].score).toBeGreaterThan(output.recommendations[1].score)
    })
  })
})
