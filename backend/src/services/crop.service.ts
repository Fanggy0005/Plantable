import { notFound } from "../lib/http-error"
import { cropRepository, type CropFilterParams } from "../repositories/crop.repository"

export class CropService {
  async list(params: CropFilterParams) {
    return cropRepository.findAll(params)
  }

  async get(id: string) {
    const crop = await cropRepository.findDetail(id)
    if (!crop) throw notFound("Crop")
    return crop
  }
}

export const cropService = new CropService()
