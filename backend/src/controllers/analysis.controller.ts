import { analysisService } from "../services/analysis.service"
import { successResponse, errorFromCaught } from "../utils/response"
import type { SoilInput } from "../types"

export class AnalysisController {
  async createAnalysis(soil: SoilInput, userId?: string) {
    try {
      const result = await analysisService.createAndSaveAnalysis(soil, userId)
      return successResponse(result, "Analysis completed and saved successfully")
    } catch (err) {
      return errorFromCaught(err, "Failed to process soil analysis")
    }
  }

  async getAnalysisById(id: string) {
    try {
      const result = await analysisService.getAnalysisById(id)
      return successResponse(result, "Analysis retrieved successfully")
    } catch (err) {
      return errorFromCaught(err, "Analysis not found")
    }
  }

  async getUserHistory(userId: string) {
    try {
      const history = await analysisService.getUserHistory(userId)
      return successResponse(history, "History retrieved successfully")
    } catch (err) {
      return errorFromCaught(err, "Failed to fetch analysis history")
    }
  }

  async computeInstantRecommendation(soil: SoilInput) {
    try {
      const result = await analysisService.computeInstantRecommendation(soil)
      return successResponse(result, "Recommendation generated successfully")
    } catch (err) {
      return errorFromCaught(err, "Failed to generate recommendation")
    }
  }

  async deleteAnalysis(id: string, userId: string) {
    try {
      await analysisService.deleteAnalysis(id, userId)
      return successResponse({ success: true }, "Analysis deleted successfully")
    } catch (err) {
      return errorFromCaught(err, "Failed to delete analysis")
    }
  }

  async claimAnalysis(id: string, userId: string) {
    try {
      const updated = await analysisService.claimAnalysis(id, userId)
      return successResponse(updated, "Analysis saved to your account")
    } catch (err) {
      return errorFromCaught(err, "Failed to save analysis to account")
    }
  }
}

export const analysisController = new AnalysisController()
