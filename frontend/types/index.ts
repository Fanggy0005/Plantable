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

export interface CropRequirement {
  id: string
  cropId: string
  nitrogenMin: number
  nitrogenMax: number
  nitrogenOptimal: number
  phosphorusMin: number
  phosphorusMax: number
  phosphorusOptimal: number
  potassiumMin: number
  potassiumMax: number
  potassiumOptimal: number
  phMin: number
  phMax: number
  phOptimal: number
  organicMatterMin?: number | null
  organicMatterMax?: number | null
}

export interface Crop {
  id: string
  name: string
  nameTh: string
  scientificName?: string | null
  category: string
  description?: string | null
  imageUrl?: string | null
  requirement?: CropRequirement | null
}

export interface RecommendedCrop {
  plantId: string
  cropId?: string
  name: string
  nameTh: string
  scientificName?: string | null
  category?: string
  description: string
  imageUrl?: string | null
  score: number
  level?: RecommendationLevel
  breakdown: {
    nitrogen: number
    phosphorus: number
    potassium: number
    ph: number
  }
  reasons: string[]
  improvements: string[]
  cropRequirement?: CropRequirement | null
}

export interface AnalysisResult {
  analysisId?: string
  createdAt?: string
  soil: SoilInput
  rankings: RecommendedCrop[]
}
