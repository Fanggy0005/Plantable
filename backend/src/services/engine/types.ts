// Engine input/output types. The string unions match the Prisma enums value-for-value,
// so Prisma rows can be passed in directly without the engine depending on Prisma.

export type LandType = "lowland" | "upland"
export type WaterSupply = "rainfed" | "seasonal_irrigation" | "year_round"
export type SoilTexture = "clay" | "loam" | "sandy"
export type NutrientLevel = "low" | "medium" | "high"
export type Nutrient = "organic_matter" | "nitrogen" | "phosphorus" | "potassium"
export type FertilizerNutrient = "nitrogen" | "phosphorus" | "potassium"

export type Difficulty = "easy" | "moderate" | "hard" | "not_feasible"
export type RecommendationLevel = "Excellent" | "Good" | "Fair" | "Poor" | "Not Recommended"
export type PlanMode = "chemical" | "organic" | "combined"

// ------------------------------------------------------------------
// Inputs
// ------------------------------------------------------------------

export interface SiteInput {
  landType: LandType
  waterSupply: WaterSupply
  soilTexture: SoilTexture
}

export interface LabSoilInput {
  inputMode: "lab"
  ph: number
  organicMatterPct: number
  phosphorusMgKg: number
  potassiumMgKg: number
}

export interface TestKitSoilInput {
  inputMode: "test_kit"
  ph: number
  nitrogenLevel: NutrientLevel
  phosphorusLevel: NutrientLevel
  potassiumLevel: NutrientLevel
}

export type SoilInput = LabSoilInput | TestKitSoilInput

export interface NutrientThreshold {
  nutrient: Nutrient
  level: NutrientLevel
  min: number | null
  max: number | null
}

export interface CropRequirementData {
  allowedLandTypes: LandType[]
  minWaterSupply: WaterSupply
  preferredTextures: SoilTexture[]
  phMin: number
  phMax: number
  phOptimal: number
  minOrganicMatterLevel: NutrientLevel
  minNitrogenLevel: NutrientLevel
  minPhosphorusLevel: NutrientLevel
  minPotassiumLevel: NutrientLevel
  source: string
}

export interface CropProfile {
  id: string
  name: string
  nameTh: string
  category: string
  imageUrl: string | null
  requirement: CropRequirementData | null
}

export interface FertilizerRateData {
  nutrient: Nutrient
  soilLevel: NutrientLevel
  kgPerRai: number
  source: string
}

export interface FertilizerStageData {
  order: number
  nameTh: string
  nameEn: string
  daysAfterPlanting: number
  nitrogenShare: number
  phosphorusShare: number
  potassiumShare: number
  source: string
}

export interface LimeRateData {
  soilTexture: SoilTexture
  phFrom: number
  phTo: number
  kgCaco3PerRaiPerPhUnit: number
  source: string
}

// ------------------------------------------------------------------
// Outputs
// ------------------------------------------------------------------

export interface SoilLevels {
  organicMatter: NutrientLevel
  nitrogen: NutrientLevel
  phosphorus: NutrientLevel
  potassium: NutrientLevel
  /** True when a level was not measured and was inferred from another one. */
  organicMatterEstimated: boolean
  nitrogenEstimated: boolean
}

export type PenaltyFactor =
  | "texture"
  | "ph_low"
  | "ph_high"
  | "organic_matter"
  | "nitrogen"
  | "phosphorus"
  | "potassium"

export interface Penalty {
  factor: PenaltyFactor
  points: number
}

export interface RankedCrop {
  cropId: string
  cropName: string
  cropNameTh: string
  category: string
  imageUrl: string | null
  score: number
  level: RecommendationLevel
  difficulty: Difficulty
  reasons: string[]
  penalties: Penalty[]
}

export interface IneligibleCrop {
  cropId: string
  cropName: string
  cropNameTh: string
  reasons: string[]
}

export interface RecommendationResult {
  levels: SoilLevels
  ranked: RankedCrop[]
  ineligible: IneligibleCrop[]
}

export interface FertilizerProduct {
  formula: "18-46-0" | "46-0-0" | "0-0-60"
  kgPerRai: number
  kgTotal: number
}

export interface NutrientAmounts {
  n: number
  p2o5: number
  k2o: number
}

export type SoilPlanStep =
  | {
      type: "ph_correction"
      daysAfterPlanting: number
      titleTh: string
      material: string | null
      kgPerRai: number | null
      kgTotal: number | null
      noteTh: string
    }
  | {
      type: "organic_matter"
      daysAfterPlanting: number
      titleTh: string
      kgPerRai: number
      kgTotal: number
      noteTh: string
    }
  | {
      type: "fertilizer"
      daysAfterPlanting: number
      titleTh: string
      nutrientsPerRai: NutrientAmounts
      products: FertilizerProduct[]
      noteTh: string | null
    }
  | {
      type: "retest"
      daysAfterPlanting: null
      titleTh: string
      noteTh: string
    }

export interface SoilPlan {
  cropId: string
  areaRai: number
  mode: PlanMode
  difficulty: Difficulty
  steps: SoilPlanStep[]
  nutrientTotalsPerRai: NutrientAmounts
  warnings: string[]
  sources: string[]
}
