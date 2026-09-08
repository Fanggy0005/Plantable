import { cropRepository } from "../repositories/crop.repository"
import { analysisRepository } from "../repositories/analysis.repository"
import { rankCropsForSoil } from "./recommendation-engine.service"
import { soilImprovementService } from "./soil-improvement.service"
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
        province: savedAnalysis.province,
        region: savedAnalysis.region,
        season: savedAnalysis.season,
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
      soilImprovement: soilImprovementService.generatePlan(
        soil,
        savedAnalysis.recommendations[0]
          ? {
              id: savedAnalysis.recommendations[0].crop.id,
              name: savedAnalysis.recommendations[0].crop.name,
              nameTh: savedAnalysis.recommendations[0].crop.nameTh,
              requirement: savedAnalysis.recommendations[0].crop.requirement,
            }
          : null
      ),
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
      soilImprovement: soilImprovementService.generatePlan(
        soil,
        engineOutput.recommendations[0]
          ? {
              id: engineOutput.recommendations[0].cropId,
              name: engineOutput.recommendations[0].cropName,
              nameTh: engineOutput.recommendations[0].cropNameTh,
            }
          : null
      ),
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

    const soil: SoilInput = {
      nitrogen: analysis.nitrogen,
      phosphorus: analysis.phosphorus,
      potassium: analysis.potassium,
      ph: analysis.ph,
      organicMatter: analysis.organicMatter,
      moisture: analysis.moisture,
      notes: analysis.notes,
      province: analysis.province,
      region: analysis.region,
      season: analysis.season,
    }

    return {
      analysisId: analysis.id,
      userId: analysis.userId,
      createdAt: analysis.createdAt,
      soil,
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
      soilImprovement: soilImprovementService.generatePlan(
        soil,
        analysis.recommendations[0]
          ? {
              id: analysis.recommendations[0].crop.id,
              name: analysis.recommendations[0].crop.name,
              nameTh: analysis.recommendations[0].crop.nameTh,
              requirement: analysis.recommendations[0].crop.requirement,
            }
          : null
      ),
    }
  }

  /**
   * Get historical analyses for an authenticated user.
   */
  async getUserHistory(userId: string) {
    return analysisRepository.findByUserId(userId)
  }

  async deleteAnalysis(id: string, userId: string) {
    return analysisRepository.deleteById(id, userId)
  }

  async claimAnalysis(id: string, userId: string) {
    return analysisRepository.assignUser(id, userId)
  }
}

export const analysisService = new AnalysisService()
