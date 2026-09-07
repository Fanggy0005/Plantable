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
