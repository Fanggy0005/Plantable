import { CATEGORY_GROUP } from "../constants/crop-categories"
import { notFound } from "../lib/http-error"
import { cropRepository, type CropFilterParams } from "../repositories/crop.repository"
import type { CropCategory } from "./engine/types"

/** Adds the derived group (field crop / tree crop / horticulture) to a crop row. */
function withGroup<T extends { category: CropCategory }>(crop: T) {
  return { ...crop, group: CATEGORY_GROUP[crop.category] }
}

export class CropService {
  async list(params: CropFilterParams) {
    return (await cropRepository.findAll(params)).map(withGroup)
  }

  async get(id: string) {
    const crop = await cropRepository.findDetail(id)
    if (!crop) throw notFound("Crop")
    return withGroup(crop)
  }
}

export const cropService = new CropService()
