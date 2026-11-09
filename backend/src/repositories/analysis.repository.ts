import { prisma } from "../config/db"
import type { Prisma } from "../generated/prisma"

export class AnalysisRepository {
  async create(data: Prisma.SoilAnalysisUncheckedCreateInput) {
    return prisma.soilAnalysis.create({ data })
  }

  async findManyByPlot(plotId: string, limit: number) {
    return prisma.soilAnalysis.findMany({
      where: { plotId },
      orderBy: [{ sampledAt: "desc" }, { createdAt: "desc" }],
      take: limit,
    })
  }

  async findByIdWithPlot(id: string) {
    return prisma.soilAnalysis.findUnique({ where: { id }, include: { plot: true } })
  }

  async delete(id: string) {
    await prisma.soilAnalysis.delete({ where: { id } })
  }
}

export const analysisRepository = new AnalysisRepository()
