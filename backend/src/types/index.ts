export interface SoilInput {
  nitrogen: number
  phosphorus: number
  potassium: number
  ph: number
  organicMatter?: number | null
  moisture?: number | null
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
