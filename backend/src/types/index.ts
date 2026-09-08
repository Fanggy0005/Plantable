export interface SoilInput {
  nitrogen: number
  phosphorus: number
  potassium: number
  ph: number
  organicMatter?: number | null
  moisture?: number | null
  province?: string | null
  region?: string | null
  season?: string | null
  notes?: string | null
}

export type RecommendationLevel =
  | "Excellent"
  | "Good"
  | "Fair"
  | "Poor"
  | "Not Recommended"

export interface NutrientScore {
  score: number // 0-100
  status: "low" | "optimal" | "high"
  deficitOrExcess: number
}

export interface CropEvaluationResult {
  cropId: string
  cropName: string
  cropNameTh: string
  scientificName?: string | null
  category: string
  description?: string | null
  imageUrl?: string | null
  score: number // 0-100
  level: RecommendationLevel
  breakdown: {
    nitrogen: number
    phosphorus: number
    potassium: number
    ph: number
  }
  reasons: string[]
  improvementSuggestions: string[]
}

export interface RecommendationEngineOutput {
  soil: SoilInput
  recommendations: CropEvaluationResult[]
}

export type NutrientDeficiencyStatus =
  | "severe_deficiency"
  | "mild_deficiency"
  | "optimal"
  | "mild_excess"
  | "severe_excess"

export interface NutrientDiagnostic {
  nutrient: "nitrogen" | "phosphorus" | "potassium" | "ph"
  name: string
  nameTh: string
  currentValue: number
  optimalRange: { min: number; max: number; optimal: number }
  status: NutrientDeficiencyStatus
  statusLabelTh: string
  symptomsTh: string
  impactTh: string
}

export interface FertilizerScheduleItem {
  stage: string
  formula: string
  rateKgPerRai: number
  rateKgPerHectare: number
  timing: string
  instructions: string
}

export interface OrganicAlternative {
  nameTh: string
  type: "manure" | "green_manure" | "rock_mineral" | "bio_fertilizer"
  targetNutrient: string
  rateTh: string
  benefitTh: string
}

export interface PhCorrectionPlan {
  currentPh: number
  category: "strongly_acidic" | "moderately_acidic" | "optimal" | "alkaline"
  categoryTh: string
  recommendedMaterial: string
  dosageKgPerRai: number
  dosageKgPerHectare: number
  applicationMethodTh: string
}

export interface SoilImprovementPlan {
  cropId?: string
  cropName?: string
  cropNameTh?: string
  soilHealthScore: number
  overallConditionTh: string
  diagnostics: NutrientDiagnostic[]
  fertilizerRecommendations: FertilizerScheduleItem[]
  organicAlternatives: OrganicAlternative[]
  phCorrection: PhCorrectionPlan
  generalTipsTh: string[]
}

export interface OcrExtractedSoilData {
  fileId?: string
  fileName?: string
  fileType?: string
  nitrogen: number | null
  phosphorus: number | null
  potassium: number | null
  ph: number | null
  organicMatter?: number | null
  moisture?: number | null
  confidence: {
    nitrogen: number
    phosphorus: number
    potassium: number
    ph: number
    overall: number
  }
  rawText?: string
  extractedData?: Record<string, any>
}

// ==========================================
// Phase 4 - Advanced Features Types
// ==========================================

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
}

export interface AgriculturalAlert {
  type: "drought" | "heavy_rain" | "extreme_heat" | "favorable"
  titleTh: string
  messageTh: string
  severity: "low" | "medium" | "high"
}

export interface WeatherData {
  province: string
  region: ThaiRegion
  regionTh: string
  temperature: number
  humidity: number
  precipitation: number
  condition: string
  conditionTh: string
  windSpeed: number
  season: SeasonType
  seasonLabelTh: string
  forecast: WeatherForecastDay[]
  agriculturalAlerts: AgriculturalAlert[]
}

export interface RegionalCropSuitability {
  cropId: string
  cropName: string
  cropNameTh: string
  province: string
  region: ThaiRegion
  regionTh: string
  season: SeasonType
  seasonLabelTh: string
  waterAvailability: "high" | "moderate" | "low"
  climateScore: number // 0-100
  regionalFit: "highly_suitable" | "moderately_suitable" | "poorly_suitable"
  regionalFitLabelTh: string
  regionalReasonTh: string
  bestPlantingMonthsTh: string
}

export interface CostBreakdownItem {
  category: string
  categoryTh: string
  amountThb: number
  percentage: number
}

export interface CropEconomics {
  cropId: string
  cropName: string
  cropNameTh: string
  expectedYieldPerRai: number // in kg
  expectedYieldPerHectare: number // in kg
  marketPricePerKg: number // in THB
  grossRevenuePerRai: number // in THB
  fertilizerCostPerRai: number // in THB
  otherProductionCostPerRai: number // in THB
  totalCostPerRai: number // in THB
  netProfitPerRai: number // in THB
  roiPercentage: number // %
  breakEvenPricePerKg: number // in THB
  landAreaRai: number
  totalProjectedRevenue: number
  totalProjectedCost: number
  totalProjectedProfit: number
  costBreakdown: CostBreakdownItem[]
}

export interface AnalyticsDashboardData {
  kpis: {
    totalAnalyses: number
    totalCrops: number
    totalUsers: number
  }
  totalAnalyses: number
  totalCrops: number
  totalUsers: number
  averageSoilMetrics: {
    nitrogen: number
    phosphorus: number
    potassium: number
    ph: number
  }
  soilHealthDistribution: {
    optimalPercentage: number
    deficientPercentage: number
    excessPercentage: number
  }
  phCategoryDistribution: Array<{
    category: string
    labelTh: string
    count: number
    percentage: number
  }>
  cropPopularityRanking: Array<{
    cropId: string
    name: string
    nameTh: string
    category: string
    count: number
    percentage: number
    averageScore: number
  }>
  regionalActivity: Array<{
    region: string
    regionTh: string
    count: number
  }>
  recentActivityTimeline: Array<{
    id: string
    createdAt: string
    cropNameTh: string
    suitabilityScore: number
    recommendationLevel: string
  }>
  recentAnalysesTimeline?: Array<{
    id: string
    createdAt: string
    cropNameTh: string
    suitabilityScore: number
    recommendationLevel: string
  }>
}

