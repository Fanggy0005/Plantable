import { soilImprovementService } from "../services/soil-improvement.service"
import { cropRepository } from "../repositories/crop.repository"
import { analysisRepository } from "../repositories/analysis.repository"
import { successResponse, errorResponse } from "../utils/response"
import type { SoilInput } from "../types"

export class SoilImprovementController {
  async getPlanForSoil(soil: SoilInput, cropId?: string) {
    try {
      let cropContext = null
      if (cropId) {
        const crop = await cropRepository.findById(cropId)
        if (crop) {
          cropContext = {
            id: crop.id,
            name: crop.name,
            nameTh: crop.nameTh,
            requirement: crop.requirement,
          }
        }
      }

      const plan = soilImprovementService.generatePlan(soil, cropContext)
      return successResponse(plan, "Soil improvement plan generated successfully")
    } catch (err: any) {
      return errorResponse(err.message || "Failed to generate soil improvement plan", [err])
    }
  }

  async getPlanForAnalysis(analysisId: string, cropId?: string) {
    try {
      const analysis = await analysisRepository.findById(analysisId)
      if (!analysis) {
        return errorResponse("Analysis not found")
      }

      let cropContext = null
      if (cropId) {
        const crop = await cropRepository.findById(cropId)
        if (crop) {
          cropContext = {
            id: crop.id,
            name: crop.name,
            nameTh: crop.nameTh,
            requirement: crop.requirement,
          }
        }
      } else if (analysis.recommendations && analysis.recommendations.length > 0) {
        // Default to top recommended crop
        const top = analysis.recommendations[0]
        cropContext = {
          id: top.crop.id,
          name: top.crop.name,
          nameTh: top.crop.nameTh,
          requirement: top.crop.requirement,
        }
      }

      const soil: SoilInput = {
        nitrogen: analysis.nitrogen,
        phosphorus: analysis.phosphorus,
        potassium: analysis.potassium,
        ph: analysis.ph,
        organicMatter: analysis.organicMatter,
        moisture: analysis.moisture,
        notes: analysis.notes,
      }

      const plan = soilImprovementService.generatePlan(soil, cropContext)
      return successResponse(plan, "Soil improvement plan retrieved successfully")
    } catch (err: any) {
      return errorResponse(err.message || "Failed to retrieve soil improvement plan", [err])
    }
  }
}

export const soilImprovementController = new SoilImprovementController()
