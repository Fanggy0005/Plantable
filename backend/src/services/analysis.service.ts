import { cropRepository } from "../repositories/crop.repository"
import { analysisRepository } from "../repositories/analysis.repository"
import { rankCropsForSoil } from "./recommendation-engine.service"
import type { SoilInput } from "../types"

export class AnalysisService {
  /**
   * Run recommendation engine and persist the analysis with recommendation snapshots.
   */
  async createAndSaveAnalysis(soil: SoilInput, userId?: string) {
    const crops = await cropRepository.findAll()
    const engineOutput = rankCropsForSoil(soil, crops)

    const savedAnalysis = await analysisRepository.createWithRecommendations(
      soil,
      engineOutput.recommendations,
      userId
    )

    return {
      analysisId: savedAnalysis.id,
      createdAt: savedAnalysis.createdAt,
      soil: {
        nitrogen: savedAnalysis.nitrogen,
        phosphorus: savedAnalysis.phosphorus,
        potassium: savedAnalysis.potassium,
        ph: savedAnalysis.ph,
        organicMatter: savedAnalysis.organicMatter,
        moisture: savedAnalysis.moisture,
        notes: savedAnalysis.notes,
      },
      recommendations: savedAnalysis.recommendations.map((rec) => ({
        id: rec.id,
        cropId: rec.cropId,
        cropName: rec.crop.name,
        cropNameTh: rec.crop.nameTh,
        scientificName: rec.crop.scientificName,
        category: rec.crop.category,
        description: rec.crop.description,
        imageUrl: rec.crop.imageUrl,
        score: rec.suitabilityScore,
        level: rec.recommendationLevel,
        breakdown: {
          nitrogen: rec.nitrogenScore,
          phosphorus: rec.phosphorusScore,
          potassium: rec.potassiumScore,
          ph: rec.phScore,
        },
        reasons: rec.reasons,
        improvementSuggestions: rec.improvementSuggestions,
        cropRequirement: rec.crop.requirement,
      })),
    }
  }

  /**
   * Calculate recommendation rankings in-memory without saving to database.
   */
  async computeInstantRecommendation(soil: SoilInput) {
    const crops = await cropRepository.findAll()
    const engineOutput = rankCropsForSoil(soil, crops)

    return {
      soil,
      rankings: engineOutput.recommendations,
    }
  }

  /**
   * Get an analysis by ID with all recommendation details.
   */
  async getAnalysisById(id: string) {
    const analysis = await analysisRepository.findById(id)
    if (!analysis) {
      throw new Error("Soil analysis not found")
    }

    return {
      analysisId: analysis.id,
      userId: analysis.userId,
      createdAt: analysis.createdAt,
      soil: {
        nitrogen: analysis.nitrogen,
        phosphorus: analysis.phosphorus,
        potassium: analysis.potassium,
        ph: analysis.ph,
        organicMatter: analysis.organicMatter,
        moisture: analysis.moisture,
        notes: analysis.notes,
      },
      recommendations: analysis.recommendations.map((rec) => ({
        id: rec.id,
        cropId: rec.cropId,
        cropName: rec.crop.name,
        cropNameTh: rec.crop.nameTh,
        scientificName: rec.crop.scientificName,
        category: rec.crop.category,
        description: rec.crop.description,
        imageUrl: rec.crop.imageUrl,
        score: rec.suitabilityScore,
        level: rec.recommendationLevel,
        breakdown: {
          nitrogen: rec.nitrogenScore,
          phosphorus: rec.phosphorusScore,
          potassium: rec.potassiumScore,
          ph: rec.phScore,
        },
        reasons: rec.reasons,
        improvementSuggestions: rec.improvementSuggestions,
        cropRequirement: rec.crop.requirement,
      })),
    }
  }

  /**
   * Get historical analyses for an authenticated user.
   */
  async getUserHistory(userId: string) {
    return analysisRepository.findByUserId(userId)
  }
}

export const analysisService = new AnalysisService()
