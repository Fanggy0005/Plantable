import { analyticsService } from "../services/analytics.service"
import { successResponse, errorFromCaught } from "../utils/response"

export class AnalyticsController {
  async getDashboard() {
    try {
      const data = await analyticsService.getDashboardData()
      return successResponse(data, "Analytics dashboard data retrieved successfully")
    } catch (err) {
      return errorFromCaught(err, "Failed to retrieve analytics dashboard data")
    }
  }
}

export const analyticsController = new AnalyticsController()
