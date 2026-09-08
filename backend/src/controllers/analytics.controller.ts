import { analyticsService } from "../services/analytics.service"
import { successResponse, errorResponse } from "../utils/response"

export class AnalyticsController {
  async getDashboard() {
    try {
      const data = await analyticsService.getDashboardData()
      return successResponse(data, "Analytics dashboard data retrieved successfully")
    } catch (err: any) {
      return errorResponse(err.message || "Failed to retrieve analytics dashboard data", [err])
    }
  }
}

export const analyticsController = new AnalyticsController()
