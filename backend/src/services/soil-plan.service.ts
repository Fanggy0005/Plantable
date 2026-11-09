import { HttpError, notFound } from "../lib/http-error"
import { cropRepository } from "../repositories/crop.repository"
import { masterDataRepository } from "../repositories/master-data.repository"
import { buildSoilPlan, type PlanMode, type SiteInput, type SoilInput, type SoilPlan } from "./engine"
import { SAMPLE_DATA_WARNING, usesSampleData } from "./data-quality"

export interface SoilPlanRequest {
  cropId: string
  areaRai: number
  mode: PlanMode
  site: SiteInput
  soil: SoilInput
}

export const DEFAULT_PLAN_MODE: PlanMode = "combined"

export class SoilPlanService {
  async build(request: SoilPlanRequest): Promise<SoilPlan> {
    const [crop, thresholds, limeRates] = await Promise.all([
      cropRepository.findForSoilPlan(request.cropId),
      masterDataRepository.findThresholds(),
      masterDataRepository.findLimeRates(),
    ])

    if (!crop) throw notFound("Crop")
    if (!crop.requirement) throw new HttpError(422, "This crop has no requirement data yet")

    const plan = buildSoilPlan({
      ...request,
      requirement: crop.requirement,
      thresholds,
      fertilizerRates: crop.fertilizerRates,
      fertilizerStages: crop.fertilizerStages,
      limeRates,
    })

    const sources = [...plan.sources, ...thresholds.map((t) => t.source)]
    if (usesSampleData(sources)) plan.warnings.unshift(SAMPLE_DATA_WARNING)

    return plan
  }
}

export const soilPlanService = new SoilPlanService()
