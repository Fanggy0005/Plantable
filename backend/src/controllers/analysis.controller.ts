import { analysisService } from "../services/analysis.service"
import { successResponse, errorResponse } from "../utils/response"
import type { SoilInput } from "../types"

export class AnalysisController {
  async createAnalysis(soil: SoilInput, userId?: string) {
    try {
      const result = await analysisService.createAndSaveAnalysis(soil, userId)
      return successResponse(result, "Analysis completed and saved successfully")
    } catch (err: any) {
      return errorResponse(err.message || "Failed to process soil analysis", [err])
    }
  }

  async getAnalysisById(id: string) {
    try {
      const result = await analysisService.getAnalysisById(id)
      return successResponse(result, "Analysis retrieved successfully")
    } catch (err: any) {
      return errorResponse(err.message || "Analysis not found", [err])
    }
  }

  async getUserHistory(userId: string) {
    try {
      const history = await analysisService.getUserHistory(userId)
      return successResponse(history, "History retrieved successfully")
    } catch (err: any) {
      return errorResponse(err.message || "Failed to fetch analysis history", [err])
    }
  }

  async computeInstantRecommendation(soil: SoilInput) {
    try {
      const result = await analysisService.computeInstantRecommendation(soil)
      return successResponse(result, "Recommendation generated successfully")
    } catch (err: any) {
      return errorResponse(err.message || "Failed to generate recommendation", [err])
    }
  }
}

export const analysisController = new AnalysisController()
