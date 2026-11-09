import { prisma } from "../config/db"

export class MasterDataRepository {
  async findThresholds() {
    return prisma.nutrientLevelThreshold.findMany()
  }

  async findLimeRates() {
    return prisma.limeRate.findMany({ orderBy: [{ soilTexture: "asc" }, { phFrom: "asc" }] })
  }
}

export const masterDataRepository = new MasterDataRepository()
