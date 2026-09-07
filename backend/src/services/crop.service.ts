import { cropRepository, type CropFilterParams } from "../repositories/crop.repository"

export class CropService {
  async getAllCrops(params?: CropFilterParams) {
    return cropRepository.findAll(params)
  }

  async getCropById(id: string) {
    const crop = await cropRepository.findById(id)
    if (!crop) {
      throw new Error("Crop not found")
    }
    return crop
  }
}

export const cropService = new CropService()
