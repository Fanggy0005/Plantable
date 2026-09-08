import { economicsService, CROP_ECONOMIC_BENCHMARKS } from "../services/economics.service"
import { cropRepository } from "../repositories/crop.repository"
import { analysisRepository } from "../repositories/analysis.repository"
import { successResponse, errorResponse } from "../utils/response"
import type { SoilInput } from "../types"

export class EconomicsController {
  async calculateForCrop(cropId: string, landAreaRai?: number, soil?: SoilInput) {
    try {
      const crop = await cropRepository.findById(cropId)
      if (!crop) {
        return errorResponse("Crop not found")
      }

      const economics = economicsService.calculateCropEconomics(
        {
          id: crop.id,
          name: crop.name,
          nameTh: crop.nameTh,
          requirement: crop.requirement,
        },
        soil,
        landAreaRai || 1
      )

      return successResponse(economics, "Crop economics calculated successfully")
    } catch (err: any) {
      return errorResponse(err.message || "Failed to calculate crop economics", [err])
    }
  }

  async calculateForAnalysis(analysisId: string, cropId?: string, landAreaRai?: number) {
    try {
      const analysis = await analysisRepository.findById(analysisId)
      if (!analysis) {
        return errorResponse("Analysis not found")
      }

      let targetCrop = null
      if (cropId) {
        targetCrop = await cropRepository.findById(cropId)
      } else if (analysis.recommendations && analysis.recommendations.length > 0) {
        const top = analysis.recommendations[0]
        targetCrop = await cropRepository.findById(top.crop.id)
      }

      if (!targetCrop) {
        return errorResponse("No crop available to evaluate economics")
      }

      const soil: SoilInput = {
        nitrogen: analysis.nitrogen,
        phosphorus: analysis.phosphorus,
        potassium: analysis.potassium,
        ph: analysis.ph,
        organicMatter: analysis.organicMatter,
        moisture: analysis.moisture,
      }

      const economics = economicsService.calculateCropEconomics(
        {
          id: targetCrop.id,
          name: targetCrop.name,
          nameTh: targetCrop.nameTh,
          requirement: targetCrop.requirement,
        },
        soil,
        landAreaRai || 1
      )

      return successResponse(economics, "Analysis crop economics calculated successfully")
    } catch (err: any) {
      return errorResponse(err.message || "Failed to calculate analysis crop economics", [err])
    }
  }

  getBenchmarks() {
    try {
      return successResponse(CROP_ECONOMIC_BENCHMARKS, "Economic benchmarks retrieved successfully")
    } catch (err: any) {
      return errorResponse(err.message || "Failed to retrieve benchmarks", [err])
    }
  }
}

export const economicsController = new EconomicsController()
