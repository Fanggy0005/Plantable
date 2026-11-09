import { HttpError, notFound } from "../lib/http-error"
import { cropRepository } from "../repositories/crop.repository"
import { masterDataRepository } from "../repositories/master-data.repository"
import { plotRepository } from "../repositories/plot.repository"
import type { Plot } from "../generated/prisma"
import { summarizeAnalysis } from "./analysis-mapper"
import type { LandType, SoilTexture, WaterSupply } from "./engine"

export interface PlotInput {
  name: string
  areaRai: number
  province: string
  landType: LandType
  waterSupply: WaterSupply
  soilTexture: SoilTexture
  targetCropId?: string | null
}

export class PlotService {
  serialize(plot: Plot) {
    return {
      id: plot.id,
      name: plot.name,
      areaRai: plot.areaRai,
      province: plot.province,
      landType: plot.landType,
      waterSupply: plot.waterSupply,
      soilTexture: plot.soilTexture,
      targetCropId: plot.targetCropId,
      createdAt: plot.createdAt,
      updatedAt: plot.updatedAt,
    }
  }

  /** The plot if it belongs to the user. Someone else's plot is reported as not found. */
  async getOwned(userId: string, id: string): Promise<Plot> {
    const plot = await plotRepository.findById(id)
    if (!plot || plot.userId !== userId) throw notFound("Plot")
    return plot
  }

  async list(userId: string) {
    const [plots, thresholds] = await Promise.all([
      plotRepository.findManyByUser(userId),
      masterDataRepository.findThresholds(),
    ])

    return plots.map(({ analyses, ...plot }) => {
      const latest = analyses[0]
      return {
        ...this.serialize(plot),
        latestAnalysis: latest ? summarizeAnalysis(latest, thresholds) : null,
      }
    })
  }

  async get(userId: string, id: string) {
    return this.serialize(await this.getOwned(userId, id))
  }

  private async assertCropExists(cropId: string | null | undefined) {
    if (cropId && !(await cropRepository.exists(cropId))) {
      throw new HttpError(422, "Validation Error", [{ path: "/targetCropId", message: "Crop does not exist" }])
    }
  }

  async create(userId: string, input: PlotInput) {
    await this.assertCropExists(input.targetCropId)
    return this.serialize(await plotRepository.create({ ...input, userId }))
  }

  async update(userId: string, id: string, input: Partial<PlotInput>) {
    await this.getOwned(userId, id)
    await this.assertCropExists(input.targetCropId)
    return this.serialize(await plotRepository.update(id, input))
  }

  async delete(userId: string, id: string): Promise<void> {
    await this.getOwned(userId, id)
    await plotRepository.delete(id)
  }
}

export const plotService = new PlotService()
