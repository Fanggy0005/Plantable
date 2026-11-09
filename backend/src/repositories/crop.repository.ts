import { prisma } from "../config/db"
import type { Prisma } from "../generated/prisma"

export interface CropFilterParams {
  search?: string
  category?: string
}

export class CropRepository {
  async findAll(params: CropFilterParams = {}) {
    const where: Prisma.CropWhereInput = {}

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { nameTh: { contains: params.search, mode: "insensitive" } },
        { scientificName: { contains: params.search, mode: "insensitive" } },
      ]
    }
    if (params.category) {
      where.category = { equals: params.category, mode: "insensitive" }
    }

    return prisma.crop.findMany({ where, orderBy: { name: "asc" } })
  }

  /** All crops with their requirement, for ranking. */
  async findAllWithRequirement() {
    return prisma.crop.findMany({ include: { requirement: true }, orderBy: { name: "asc" } })
  }

  async findDetail(id: string) {
    return prisma.crop.findUnique({
      where: { id },
      include: {
        requirement: true,
        fertilizerStages: { orderBy: { order: "asc" } },
      },
    })
  }

  /** A crop with everything needed to build its soil plan. */
  async findForSoilPlan(id: string) {
    return prisma.crop.findUnique({
      where: { id },
      include: {
        requirement: true,
        fertilizerRates: true,
        fertilizerStages: { orderBy: { order: "asc" } },
      },
    })
  }

  async exists(id: string): Promise<boolean> {
    return (await prisma.crop.count({ where: { id } })) > 0
  }
}

export const cropRepository = new CropRepository()
