import { prisma } from "../config/db"
import type { CropWithRequirement } from "../services/recommendation-engine.service"

export interface CropFilterParams {
  search?: string
  category?: string
}

export class CropRepository {
  async findAll(params?: CropFilterParams): Promise<CropWithRequirement[]> {
    const where: any = {}

    if (params?.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { nameTh: { contains: params.search, mode: "insensitive" } },
        { scientificName: { contains: params.search, mode: "insensitive" } },
      ]
    }

    if (params?.category) {
      where.category = { equals: params.category, mode: "insensitive" }
    }

    return prisma.crop.findMany({
      where,
      include: {
        requirement: true,
      },
      orderBy: {
        name: "asc",
      },
    })
  }

  async findById(id: string): Promise<CropWithRequirement | null> {
    return prisma.crop.findUnique({
      where: { id },
      include: {
        requirement: true,
      },
    })
  }
}

export const cropRepository = new CropRepository()
