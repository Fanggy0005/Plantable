// Shapes of the v2 API (see docs/api-spec.md). String unions match the backend engine value-for-value.

export type LandType = "lowland" | "upland"
export type WaterSupply = "rainfed" | "seasonal_irrigation" | "year_round"
export type SoilTexture = "clay" | "loam" | "sandy"
export type NutrientLevel = "low" | "medium" | "high"
export type Difficulty = "easy" | "moderate" | "hard" | "not_feasible"
export type PlanMode = "chemical" | "organic" | "combined"

/** พืชไร่ · ไม้ยืนต้นเศรษฐกิจ · พืชสวน. The backend derives it from the category. */
export type CropGroup = "field_crop" | "tree_crop" | "horticulture"
export type CropCategory =
  | "cereal"
  | "legume"
  | "oilseed"
  | "root_tuber"
  | "sugar_crop"
  | "plantation"
  | "fruit"
  | "fruit_vegetable"
  | "leafy_vegetable"
  | "spice_herb"

export type RecommendationLevel = "Excellent" | "Good" | "Fair" | "Poor" | "Not Recommended"

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

// ------------------------------------------------------------------
// Recommendations
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
  | "ph_off_optimal"
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
  /** Missing on checks stored before crop groups existed. */
  group?: CropGroup
  category: CropCategory
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
  warnings: string[]
  ranked: RankedCrop[]
  ineligible: IneligibleCrop[]
}

// ------------------------------------------------------------------
// Soil plans
// ------------------------------------------------------------------

export interface NutrientAmounts {
  n: number
  p2o5: number
  k2o: number
}

export interface FertilizerProduct {
  formula: "18-46-0" | "46-0-0" | "0-0-60"
  kgPerRai: number
  kgTotal: number
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

export interface SoilPlanRequest {
  cropId: string
  areaRai: number
  mode: PlanMode
  site: SiteInput
  soil: SoilInput
}

// ------------------------------------------------------------------
// Crops
// ------------------------------------------------------------------

export interface Crop {
  id: string
  name: string
  nameTh: string
  scientificName?: string | null
  group: CropGroup
  category: CropCategory
  description?: string | null
  imageUrl?: string | null
}

export interface CropRequirement {
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

export interface FertilizerStage {
  id: string
  order: number
  nameTh: string
  nameEn: string
  daysAfterPlanting: number
  nitrogenShare: number
  phosphorusShare: number
  potassiumShare: number
  source: string
}

/** GET /api/crops/:id */
export interface CropDetail extends Crop {
  requirement: CropRequirement | null
  fertilizerStages: FertilizerStage[]
}

// ------------------------------------------------------------------
// Users
// ------------------------------------------------------------------

export interface UserProfile {
  id: string
  email: string
  name: string | null
  image: string | null
  createdAt: string
  updatedAt: string
  _count: { plots: number }
}

// ------------------------------------------------------------------
// Client-side quick check (stateless, kept in the browser)
// ------------------------------------------------------------------

/** What the user entered on the soil form. Province and notes are client-only context. */
export interface SoilCheckInput {
  site: SiteInput
  soil: SoilInput
  province: string
  notes?: string
}

/** A quick check and its result, passed from the form to /results. */
export interface SoilCheck extends SoilCheckInput {
  id: string
  createdAt: string
  result: RecommendationResult
}

/** A quick check saved in localStorage. Only the input is kept; the result is recalculated on open. */
export interface LocalHistoryEntry extends SoilCheckInput {
  id: string
  createdAt: string
  topCrops: Pick<RankedCrop, "cropId" | "cropName" | "cropNameTh" | "category" | "score" | "level">[]
}

// ------------------------------------------------------------------
// Environment
// ------------------------------------------------------------------

export type ThaiRegion =
  | "Northern"
  | "Northeastern"
  | "Central"
  | "Eastern"
  | "Southern"
  | "Western"

export type SeasonType = "rainy" | "winter" | "summer"

export interface WeatherForecastDay {
  date: string
  tempMax: number
  tempMin: number
  precipitationSum: number
  conditionTh: string
  condition: string
}

/** Calculated by Plantable from the forecast. Not an official warning. */
export interface AgriculturalAlert {
  type: "drought" | "heavy_rain" | "extreme_heat"
  /** Forecast day the alert is about, when it concerns a single day. */
  date?: string
  titleTh: string
  titleEn: string
  messageTh: string
  messageEn: string
  severity: "medium" | "high"
}

/**
 * `live`: Open-Meteo data. `climatology`: typical values for the season because live
 * data was unavailable. It has no forecast, no alerts, and no rain or wind values.
 */
export type WeatherSource = "live" | "climatology"

export interface WeatherData {
  source: WeatherSource
  /** Time of the current observation (Asia/Bangkok); null for climatology. */
  observedAt: string | null
  province: string
  region: ThaiRegion
  regionTh: string
  temperature: number
  humidity: number
  precipitation: number | null
  condition: string
  conditionTh: string
  windSpeed: number | null
  season: SeasonType
  seasonLabelTh: string
  forecast: WeatherForecastDay[]
  agriculturalAlerts: AgriculturalAlert[]
}
