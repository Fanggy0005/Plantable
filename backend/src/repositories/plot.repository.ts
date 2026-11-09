import { prisma } from "../config/db"
import type { Prisma } from "../generated/prisma"

const latestAnalysis = {
  analyses: { orderBy: [{ sampledAt: "desc" }, { createdAt: "desc" }], take: 1 },
} satisfies Prisma.PlotInclude

export class PlotRepository {
  async findManyByUser(userId: string) {
    return prisma.plot.findMany({
      where: { userId },
      include: latestAnalysis,
      orderBy: { createdAt: "desc" },
    })
  }

  async findById(id: string) {
    return prisma.plot.findUnique({ where: { id } })
  }

  async create(data: Prisma.PlotUncheckedCreateInput) {
    return prisma.plot.create({ data })
  }

  async update(id: string, data: Prisma.PlotUncheckedUpdateInput) {
    return prisma.plot.update({ where: { id }, data })
  }

  async delete(id: string) {
    await prisma.plot.delete({ where: { id } })
  }
}

export const plotRepository = new PlotRepository()
