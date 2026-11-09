import {
  AMENDMENT_SOURCE,
  DEFAULT_LIMING_MATERIAL,
  LIME_DAYS_AFTER_PLANTING,
  LIMING_MATERIALS,
  ORGANIC_MATTER_DAYS_AFTER_PLANTING,
  ORGANIC_MATTER_KG_PER_RAI,
} from "../../constants/amendments"
import { round1, toStraightFertilizers } from "./fertilizer"
import { LEVEL_TH, NUTRIENT_TH } from "./labels"
import { isBelow, normalizeSoilLevels } from "./levels"
import { determineDifficulty, getPhGap } from "./score"
import { checkSite } from "./site-check"
import type {
  CropRequirementData,
  FertilizerNutrient,
  FertilizerRateData,
  FertilizerStageData,
  LimeRateData,
  NutrientAmounts,
  NutrientThreshold,
  PlanMode,
  SiteInput,
  SoilInput,
  SoilLevels,
  SoilPlan,
  SoilPlanStep,
  SoilTexture,
} from "./types"

export interface SoilPlanInput {
  cropId: string
  requirement: CropRequirementData
  site: SiteInput
  soil: SoilInput
  areaRai: number
  mode: PlanMode
  thresholds: NutrientThreshold[]
  fertilizerRates: FertilizerRateData[]
  fertilizerStages: FertilizerStageData[]
  limeRates: LimeRateData[]
}

interface LimeNeed {
  kgCaco3PerRai: number
  sources: string[]
  fullyCovered: boolean
}

/** Sum lime need across the pH bands between the current pH and the target. */
export function calculateLimeNeed(
  fromPh: number,
  toPh: number,
  texture: SoilTexture,
  limeRates: LimeRateData[]
): LimeNeed {
  const bands = limeRates.filter((r) => r.soilTexture === texture)
  let kg = 0
  let covered = 0
  const sources = new Set<string>()

  for (const band of bands) {
    const overlap = Math.min(toPh, band.phTo) - Math.max(fromPh, band.phFrom)
    if (overlap > 0) {
      kg += overlap * band.kgCaco3PerRaiPerPhUnit
      covered += overlap
      sources.add(band.source)
    }
  }

  return {
    kgCaco3PerRai: kg,
    sources: [...sources],
    fullyCovered: Math.abs(covered - (toPh - fromPh)) < 1e-6,
  }
}

function phCorrectionStep(input: SoilPlanInput, warnings: string[], sources: Set<string>): SoilPlanStep | null {
  const { soil, requirement: req, site, areaRai } = input
  const gap = getPhGap(soil.ph, req)

  if (gap.above > 0) {
    return {
      type: "ph_correction",
      daysAfterPlanting: LIME_DAYS_AFTER_PLANTING,
      titleTh: "ลดความเป็นด่างของดิน",
      material: null,
      kgPerRai: null,
      kgTotal: null,
      noteTh:
        "การลด pH ทำได้ยากและช้า ใส่อินทรียวัตถุอย่างสม่ำเสมอ และปรึกษาสถานีพัฒนาที่ดินเรื่องการใช้กำมะถันผง",
    }
  }
  if (gap.below <= 0) return null

  const need = calculateLimeNeed(soil.ph, req.phOptimal, site.soilTexture, input.limeRates)
  need.sources.forEach((s) => sources.add(s))
  sources.add(AMENDMENT_SOURCE)
  if (!need.fullyCovered) {
    warnings.push("ข้อมูลอัตราปูนไม่ครอบคลุมช่วง pH นี้ทั้งหมด ปริมาณปูนอาจต่ำกว่าที่ต้องใช้จริง")
  }

  const material = LIMING_MATERIALS[DEFAULT_LIMING_MATERIAL]
  const kgPerRai = round1(need.kgCaco3PerRai / material.caco3Equivalent)

  return {
    type: "ph_correction",
    daysAfterPlanting: LIME_DAYS_AFTER_PLANTING,
    titleTh: `ปรับ pH จาก ${soil.ph} เป็น ${req.phOptimal} ด้วย${material.nameTh}`,
    material: DEFAULT_LIMING_MATERIAL,
    kgPerRai,
    kgTotal: round1(kgPerRai * areaRai),
    noteTh: "หว่านให้ทั่วแปลงแล้วไถกลบ ปริมาณคิดจากค่ามาตรฐานของวัสดุ ให้ตรวจค่า CCE บนฉลากแล้วปรับตาม",
  }
}

function organicMatterStep(input: SoilPlanInput, levels: SoilLevels, sources: Set<string>): SoilPlanStep | null {
  const belowCropMin = isBelow(levels.organicMatter, input.requirement.minOrganicMatterLevel)
  if (input.mode === "chemical" && !belowCropMin) return null

  const kgPerRai = ORGANIC_MATTER_KG_PER_RAI[levels.organicMatter]
  if (kgPerRai <= 0) return null

  sources.add(AMENDMENT_SOURCE)
  const estimated = levels.organicMatterEstimated ? " (ประเมินจากระดับไนโตรเจน)" : ""
  return {
    type: "organic_matter",
    daysAfterPlanting: ORGANIC_MATTER_DAYS_AFTER_PLANTING,
    titleTh: "เพิ่มอินทรียวัตถุด้วยปุ๋ยหมักหรือปุ๋ยคอก",
    kgPerRai,
    kgTotal: round1(kgPerRai * input.areaRai),
    noteTh: `อินทรียวัตถุระดับ${LEVEL_TH[levels.organicMatter]}${estimated} ใช้ปุ๋ยคอกที่ย่อยสลายแล้ว หรือปลูกพืชตระกูลถั่วแล้วไถกลบเป็นปุ๋ยพืชสด`,
  }
}

const NUTRIENT_KEY: Record<FertilizerNutrient, keyof NutrientAmounts> = {
  nitrogen: "n",
  phosphorus: "p2o5",
  potassium: "k2o",
}

function totalNutrientNeed(
  input: SoilPlanInput,
  levels: SoilLevels,
  warnings: string[],
  sources: Set<string>
): NutrientAmounts {
  const totals: NutrientAmounts = { n: 0, p2o5: 0, k2o: 0 }

  for (const nutrient of Object.keys(NUTRIENT_KEY) as FertilizerNutrient[]) {
    const rate = input.fertilizerRates.find((r) => r.nutrient === nutrient && r.soilLevel === levels[nutrient])
    if (!rate) {
      warnings.push(`ยังไม่มีข้อมูลอัตราปุ๋ย${NUTRIENT_TH[nutrient]}สำหรับดินระดับ${LEVEL_TH[levels[nutrient]]}`)
      continue
    }
    totals[NUTRIENT_KEY[nutrient]] = rate.kgPerRai
    sources.add(rate.source)
  }

  return totals
}

function fertilizerSteps(
  input: SoilPlanInput,
  totals: NutrientAmounts,
  warnings: string[],
  sources: Set<string>
): SoilPlanStep[] {
  const stages = [...input.fertilizerStages].sort((a, b) => a.order - b.order)
  if (stages.length === 0) {
    warnings.push("ยังไม่มีข้อมูลการแบ่งใส่ปุ๋ยของพืชนี้ แสดงเป็นการใส่ครั้งเดียวตอนปลูก")
    stages.push({
      order: 1,
      nameTh: "ใส่ปุ๋ยตอนปลูก",
      nameEn: "At planting",
      daysAfterPlanting: 0,
      nitrogenShare: 1,
      phosphorusShare: 1,
      potassiumShare: 1,
      source: AMENDMENT_SOURCE,
    })
  }

  const steps: SoilPlanStep[] = []
  for (const stage of stages) {
    sources.add(stage.source)
    const nutrientsPerRai: NutrientAmounts = {
      n: round1(totals.n * stage.nitrogenShare),
      p2o5: round1(totals.p2o5 * stage.phosphorusShare),
      k2o: round1(totals.k2o * stage.potassiumShare),
    }
    if (nutrientsPerRai.n + nutrientsPerRai.p2o5 + nutrientsPerRai.k2o <= 0) continue

    if (input.mode === "organic") {
      steps.push({
        type: "fertilizer",
        daysAfterPlanting: stage.daysAfterPlanting,
        titleTh: stage.nameTh,
        nutrientsPerRai,
        products: [],
        noteTh:
          "ใช้ปุ๋ยอินทรีย์ให้ได้ธาตุอาหารตามจำนวนนี้ ดูปริมาณธาตุอาหารบนฉลาก ปุ๋ยอินทรีย์ให้ผลช้ากว่าปุ๋ยเคมี",
      })
      continue
    }

    const mix = toStraightFertilizers(nutrientsPerRai, input.areaRai)
    steps.push({
      type: "fertilizer",
      daysAfterPlanting: stage.daysAfterPlanting,
      titleTh: stage.nameTh,
      nutrientsPerRai,
      products: mix.products,
      noteTh: mix.excessN > 0 ? `ปุ๋ย 18-46-0 ให้ไนโตรเจนเกินที่ต้องการ ${mix.excessN} กก./ไร่ ในรอบนี้` : null,
    })
  }

  return steps
}

/** Answers question 2: how to improve this soil for the chosen crop. */
export function buildSoilPlan(input: SoilPlanInput): SoilPlan {
  const warnings: string[] = []
  const sources = new Set<string>([input.requirement.source])
  const levels = normalizeSoilLevels(input.soil, input.thresholds)
  const difficulty = determineDifficulty(input.soil.ph, levels, input.requirement)

  warnings.push(...checkSite(input.site, input.requirement))
  if (difficulty === "not_feasible") {
    warnings.push("ไม่แนะนำ: ช่องว่าง pH มากเกินกว่าจะปรับให้คุ้มค่าได้จริง ควรเลือกพืชที่เหมาะกับดินนี้มากกว่า")
  } else if (difficulty === "hard") {
    warnings.push("ปรับดินได้ยาก ต้องใช้เวลาหลายฤดู ควรแบ่งใส่ปูนและตรวจดินซ้ำทุกฤดู")
  }

  const totals = totalNutrientNeed(input, levels, warnings, sources)
  const steps: SoilPlanStep[] = [
    phCorrectionStep(input, warnings, sources),
    organicMatterStep(input, levels, sources),
    ...fertilizerSteps(input, totals, warnings, sources),
  ].filter((step): step is SoilPlanStep => step !== null)

  steps.sort((a, b) => (a.daysAfterPlanting ?? Infinity) - (b.daysAfterPlanting ?? Infinity))
  steps.push({
    type: "retest",
    daysAfterPlanting: null,
    titleTh: "ตรวจดินซ้ำหลังเก็บเกี่ยว",
    noteTh: "บันทึกผลตรวจใหม่ในแปลงเดิม เพื่อเทียบว่าดินดีขึ้นแค่ไหน",
  })

  return {
    cropId: input.cropId,
    areaRai: input.areaRai,
    mode: input.mode,
    difficulty,
    steps,
    nutrientTotalsPerRai: totals,
    warnings,
    sources: [...sources],
  }
}
