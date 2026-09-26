import { cropService } from "../services/crop.service"
import { successResponse, errorFromCaught } from "../utils/response"

export class CropController {
  async getAllCrops(query: { search?: string; category?: string }) {
    try {
      const crops = await cropService.getAllCrops(query)
      return successResponse(crops, "Crops retrieved successfully")
    } catch (err) {
      return errorFromCaught(err, "Failed to retrieve crops")
    }
  }

  async getCropById(id: string) {
    try {
      const crop = await cropService.getCropById(id)
      return successResponse(crop, "Crop retrieved successfully")
    } catch (err) {
      return errorFromCaught(err, "Failed to retrieve crop")
    }
  }
}

export const cropController = new CropController()
