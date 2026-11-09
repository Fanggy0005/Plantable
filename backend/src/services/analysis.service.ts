import { HttpError, notFound } from "../lib/http-error"
import { analysisRepository } from "../repositories/analysis.repository"
import { masterDataRepository } from "../repositories/master-data.repository"
import { summarizeAnalysis, toDateString, toSite, toSoilInput, type AnalysisSummary } from "./analysis-mapper"
import type { PlanMode, SoilInput } from "./engine"
import { plotService } from "./plot.service"
import { recommendationService } from "./recommendation.service"
import { DEFAULT_PLAN_MODE, soilPlanService } from "./soil-plan.service"

export interface CreateAnalysisInput {
  soil: SoilInput
  sampledAt: string
  notes?: string
}

const DEFAULT_LIST_LIMIT = 20

export class AnalysisService {
  async create(userId: string, plotId: string, input: CreateAnalysisInput): Promise<AnalysisSummary> {
    await plotService.getOwned(userId, plotId)
    const { soil } = input

    const row = await analysisRepository.create({
      plotId,
      inputMode: soil.inputMode,
      sampledAt: new Date(`${input.sampledAt}T00:00:00Z`),
      ph: soil.ph,
      notes: input.notes ?? null,
      ...(soil.inputMode === "lab"
        ? {
            organicMatterPct: soil.organicMatterPct,
            phosphorusMgKg: soil.phosphorusMgKg,
            potassiumMgKg: soil.potassiumMgKg,
          }
        : {
            nitrogenLevel: soil.nitrogenLevel,
            phosphorusLevel: soil.phosphorusLevel,
            potassiumLevel: soil.potassiumLevel,
          }),
    })

    return summarizeAnalysis(row, await masterDataRepository.findThresholds())
  }

  async listByPlot(userId: string, plotId: string, limit = DEFAULT_LIST_LIMIT): Promise<AnalysisSummary[]> {
    await plotService.getOwned(userId, plotId)
    const [rows, thresholds] = await Promise.all([
      analysisRepository.findManyByPlot(plotId, limit),
      masterDataRepository.findThresholds(),
    ])
    return rows.map((row) => summarizeAnalysis(row, thresholds))
  }

  private async getOwned(userId: string, id: string) {
    const row = await analysisRepository.findByIdWithPlot(id)
    if (!row || row.plot.userId !== userId) throw notFound("Soil analysis")
    return row
  }

  /** The stored soil test, recalculated against the plot's site and current master data. */
  async get(userId: string, id: string) {
    const { plot, ...row } = await this.getOwned(userId, id)
    const soil = toSoilInput(row)
    const recommendation = await recommendationService.recommend(toSite(plot), soil)

    return {
      analysis: {
        id: row.id,
        plotId: row.plotId,
        sampledAt: toDateString(row.sampledAt),
        soil,
        notes: row.notes,
        createdAt: row.createdAt,
      },
      plot: plotService.serialize(plot),
      recommendation,
    }
  }

  async delete(userId: string, id: string): Promise<void> {
    await this.getOwned(userId, id)
    await analysisRepository.delete(id)
  }

  async getSoilPlan(userId: string, id: string, options: { cropId?: string; mode?: PlanMode }) {
    const { plot, ...row } = await this.getOwned(userId, id)
    const cropId = options.cropId ?? plot.targetCropId
    if (!cropId) {
      throw new HttpError(422, "Choose a crop for this plot first, or pass cropId")
    }

    return soilPlanService.build({
      cropId,
      areaRai: plot.areaRai,
      mode: options.mode ?? DEFAULT_PLAN_MODE,
      site: toSite(plot),
      soil: toSoilInput(row),
    })
  }
}

export const analysisService = new AnalysisService()
