// Fixtures for engine unit tests. Numbers are arbitrary test values, not agronomic data.
import type {
  CropProfile,
  CropRequirementData,
  FertilizerRateData,
  FertilizerStageData,
  LimeRateData,
  NutrientThreshold,
  SiteInput,
} from "../../src/services/engine"

export const THRESHOLDS: NutrientThreshold[] = [
  { nutrient: "organic_matter", level: "low", min: null, max: 1.5 },
  { nutrient: "organic_matter", level: "medium", min: 1.5, max: 3.5 },
  { nutrient: "organic_matter", level: "high", min: 3.5, max: null },
  { nutrient: "phosphorus", level: "low", min: null, max: 10 },
  { nutrient: "phosphorus", level: "medium", min: 10, max: 25 },
  { nutrient: "phosphorus", level: "high", min: 25, max: null },
  { nutrient: "potassium", level: "low", min: null, max: 60 },
  { nutrient: "potassium", level: "medium", min: 60, max: 120 },
  { nutrient: "potassium", level: "high", min: 120, max: null },
]

export const UPLAND_LOAM_RAINFED: SiteInput = {
  landType: "upland",
  waterSupply: "rainfed",
  soilTexture: "loam",
}

export function requirement(overrides: Partial<CropRequirementData> = {}): CropRequirementData {
  return {
    allowedLandTypes: ["upland"],
    minWaterSupply: "rainfed",
    preferredTextures: ["loam"],
    phMin: 5.5,
    phMax: 7.0,
    phOptimal: 6.5,
    minOrganicMatterLevel: "medium",
    minNitrogenLevel: "medium",
    minPhosphorusLevel: "medium",
    minPotassiumLevel: "medium",
    source: "test",
    ...overrides,
  }
}

export function crop(name: string, req: CropRequirementData | null = requirement()): CropProfile {
  return { id: name.toLowerCase(), name, nameTh: name, category: "cereal", imageUrl: null, requirement: req }
}

export const LIME_RATES: LimeRateData[] = [
  { soilTexture: "loam", phFrom: 4.0, phTo: 5.0, kgCaco3PerRaiPerPhUnit: 300, source: "lime-test" },
  { soilTexture: "loam", phFrom: 5.0, phTo: 7.0, kgCaco3PerRaiPerPhUnit: 200, source: "lime-test" },
  { soilTexture: "clay", phFrom: 4.0, phTo: 7.0, kgCaco3PerRaiPerPhUnit: 400, source: "lime-test" },
]

export const FERTILIZER_RATES: FertilizerRateData[] = [
  { nutrient: "nitrogen", soilLevel: "low", kgPerRai: 12, source: "rate-test" },
  { nutrient: "nitrogen", soilLevel: "medium", kgPerRai: 8, source: "rate-test" },
  { nutrient: "nitrogen", soilLevel: "high", kgPerRai: 4, source: "rate-test" },
  { nutrient: "phosphorus", soilLevel: "low", kgPerRai: 9.2, source: "rate-test" },
  { nutrient: "phosphorus", soilLevel: "medium", kgPerRai: 4.6, source: "rate-test" },
  { nutrient: "phosphorus", soilLevel: "high", kgPerRai: 0, source: "rate-test" },
  { nutrient: "potassium", soilLevel: "low", kgPerRai: 12, source: "rate-test" },
  { nutrient: "potassium", soilLevel: "medium", kgPerRai: 6, source: "rate-test" },
  { nutrient: "potassium", soilLevel: "high", kgPerRai: 0, source: "rate-test" },
]

export const FERTILIZER_STAGES: FertilizerStageData[] = [
  {
    order: 1,
    nameTh: "รองพื้น",
    nameEn: "Basal",
    daysAfterPlanting: 0,
    nitrogenShare: 0.5,
    phosphorusShare: 1,
    potassiumShare: 0.5,
    source: "stage-test",
  },
  {
    order: 2,
    nameTh: "แต่งหน้า",
    nameEn: "Top dress",
    daysAfterPlanting: 30,
    nitrogenShare: 0.5,
    phosphorusShare: 0,
    potassiumShare: 0.5,
    source: "stage-test",
  },
]
