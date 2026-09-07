import { cropService } from "../services/crop.service"
import { successResponse, errorResponse } from "../utils/response"

export class CropController {
  async getAllCrops(query: { search?: string; category?: string }) {
    try {
      const crops = await cropService.getAllCrops(query)
      return successResponse(crops, "Crops retrieved successfully")
    } catch (err: any) {
      return errorResponse(err.message || "Failed to retrieve crops", [err])
    }
  }

  async getCropById(id: string) {
    try {
      const crop = await cropService.getCropById(id)
      return successResponse(crop, "Crop retrieved successfully")
    } catch (err: any) {
      return errorResponse(err.message || "Failed to retrieve crop", [err])
    }
  }
}

export const cropController = new CropController()
