// ==================================================================
// SAMPLE AGRONOMIC DATA: NOT VERIFIED. DO NOT USE IN PRODUCTION.
//
// Placeholder values so the engine can run end to end before the real
// LDD / DOA numbers are collected (docs/roadmap.md 1.1). Every row
// carries SAMPLE_SOURCE, and the API adds a warning to every result
// built on it. Replace a row and its source together when real data
// arrives.
// ==================================================================

import type { LandType, NutrientLevel, SoilTexture, WaterSupply } from "../../src/services/engine"

export const SAMPLE_SOURCE = "SAMPLE DATA: not verified, do not use in production"

type Levels = [low: number, medium: number, high: number]

export interface SampleCropAgronomy {
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
  /** kg N, P₂O₅, K₂O per rai for soil level low / medium / high */
  fertilizer: { nitrogen: Levels; phosphorus: Levels; potassium: Levels }
}

const STANDARD_FERTILIZER: SampleCropAgronomy["fertilizer"] = {
  nitrogen: [12, 8, 4],
  phosphorus: [6, 4, 2],
  potassium: [6, 4, 2],
}

const MEDIUM_MINIMUMS = {
  minOrganicMatterLevel: "medium",
  minNitrogenLevel: "medium",
  minPhosphorusLevel: "medium",
  minPotassiumLevel: "medium",
} as const

// pH ranges are carried over from the v1 seed. They are not cited either.
export const SAMPLE_CROP_AGRONOMY: Record<string, SampleCropAgronomy> = {
  Rice: {
    allowedLandTypes: ["lowland"],
    minWaterSupply: "rainfed",
    preferredTextures: ["clay", "loam"],
    phMin: 5.5, phMax: 7.0, phOptimal: 6.0,
    ...MEDIUM_MINIMUMS,
    minPhosphorusLevel: "low",
    fertilizer: { nitrogen: [12, 9, 6], phosphorus: [6, 3, 0], potassium: [6, 3, 0] },
  },
  Corn: {
    allowedLandTypes: ["upland"],
    minWaterSupply: "rainfed",
    preferredTextures: ["loam", "clay"],
    phMin: 5.8, phMax: 7.0, phOptimal: 6.5,
    ...MEDIUM_MINIMUMS,
    fertilizer: { nitrogen: [18, 14, 10], phosphorus: [8, 6, 3], potassium: [6, 4, 2] },
  },
  Cassava: {
    allowedLandTypes: ["upland"],
    minWaterSupply: "rainfed",
    preferredTextures: ["sandy", "loam"],
    phMin: 5.0, phMax: 7.0, phOptimal: 6.0,
    minOrganicMatterLevel: "low",
    minNitrogenLevel: "low",
    minPhosphorusLevel: "low",
    minPotassiumLevel: "medium",
    fertilizer: { nitrogen: [8, 6, 4], phosphorus: [4, 3, 2], potassium: [12, 9, 6] },
  },
  Sugarcane: {
    allowedLandTypes: ["upland", "lowland"],
    minWaterSupply: "rainfed",
    preferredTextures: ["loam", "clay"],
    phMin: 6.0, phMax: 7.5, phOptimal: 6.5,
    ...MEDIUM_MINIMUMS,
    fertilizer: { nitrogen: [20, 15, 10], phosphorus: [8, 6, 4], potassium: [12, 8, 4] },
  },
  Rubber: {
    allowedLandTypes: ["upland"],
    minWaterSupply: "rainfed",
    preferredTextures: ["loam", "sandy"],
    phMin: 4.5, phMax: 6.0, phOptimal: 5.5,
    ...MEDIUM_MINIMUMS,
    minPhosphorusLevel: "low",
    fertilizer: STANDARD_FERTILIZER,
  },
  Durian: {
    allowedLandTypes: ["upland"],
    minWaterSupply: "year_round",
    preferredTextures: ["loam"],
    phMin: 5.5, phMax: 6.5, phOptimal: 6.0,
    ...MEDIUM_MINIMUMS,
    minOrganicMatterLevel: "high",
    fertilizer: { nitrogen: [16, 12, 8], phosphorus: [8, 6, 4], potassium: [16, 12, 8] },
  },
  Mango: {
    allowedLandTypes: ["upland"],
    minWaterSupply: "seasonal_irrigation",
    preferredTextures: ["loam", "sandy"],
    phMin: 5.5, phMax: 7.5, phOptimal: 6.5,
    ...MEDIUM_MINIMUMS,
    fertilizer: STANDARD_FERTILIZER,
  },
  Pineapple: {
    allowedLandTypes: ["upland"],
    minWaterSupply: "rainfed",
    preferredTextures: ["sandy", "loam"],
    phMin: 4.5, phMax: 6.0, phOptimal: 5.0,
    ...MEDIUM_MINIMUMS,
    minPhosphorusLevel: "low",
    fertilizer: { nitrogen: [14, 10, 6], phosphorus: [4, 3, 2], potassium: [14, 10, 6] },
  },
  Tomato: {
    allowedLandTypes: ["upland"],
    minWaterSupply: "seasonal_irrigation",
    preferredTextures: ["loam"],
    phMin: 6.0, phMax: 7.0, phOptimal: 6.5,
    ...MEDIUM_MINIMUMS,
    minOrganicMatterLevel: "high",
    fertilizer: { nitrogen: [16, 12, 8], phosphorus: [10, 8, 4], potassium: [14, 10, 6] },
  },
  Longan: {
    allowedLandTypes: ["upland"],
    minWaterSupply: "seasonal_irrigation",
    preferredTextures: ["loam"],
    phMin: 5.5, phMax: 6.5, phOptimal: 6.0,
    ...MEDIUM_MINIMUMS,
    fertilizer: STANDARD_FERTILIZER,
  },
  Chili: {
    allowedLandTypes: ["upland"],
    minWaterSupply: "seasonal_irrigation",
    preferredTextures: ["loam", "sandy"],
    phMin: 6.0, phMax: 7.0, phOptimal: 6.5,
    ...MEDIUM_MINIMUMS,
    fertilizer: { nitrogen: [14, 10, 6], phosphorus: [8, 6, 3], potassium: [10, 8, 4] },
  },
  Soybean: {
    allowedLandTypes: ["upland", "lowland"],
    minWaterSupply: "seasonal_irrigation",
    preferredTextures: ["loam", "clay"],
    phMin: 6.0, phMax: 7.0, phOptimal: 6.5,
    ...MEDIUM_MINIMUMS,
    minNitrogenLevel: "low",
    fertilizer: { nitrogen: [3, 3, 3], phosphorus: [6, 4, 2], potassium: [6, 4, 2] },
  },
}

/** Default split: basal at planting, top dressing at 30 days. */
export const SAMPLE_FERTILIZER_STAGES = [
  {
    order: 1,
    nameTh: "ใส่รองพื้นตอนปลูก",
    nameEn: "Basal at planting",
    daysAfterPlanting: 0,
    nitrogenShare: 0.5,
    phosphorusShare: 1,
    potassiumShare: 0.5,
  },
  {
    order: 2,
    nameTh: "ใส่แต่งหน้า",
    nameEn: "Top dressing",
    daysAfterPlanting: 30,
    nitrogenShare: 0.5,
    phosphorusShare: 0,
    potassiumShare: 0.5,
  },
]

export const SAMPLE_THRESHOLDS = [
  { nutrient: "organic_matter", level: "low", min: null, max: 1.5, unit: "%" },
  { nutrient: "organic_matter", level: "medium", min: 1.5, max: 3.5, unit: "%" },
  { nutrient: "organic_matter", level: "high", min: 3.5, max: null, unit: "%" },
  { nutrient: "phosphorus", level: "low", min: null, max: 10, unit: "mg/kg" },
  { nutrient: "phosphorus", level: "medium", min: 10, max: 25, unit: "mg/kg" },
  { nutrient: "phosphorus", level: "high", min: 25, max: null, unit: "mg/kg" },
  { nutrient: "potassium", level: "low", min: null, max: 60, unit: "mg/kg" },
  { nutrient: "potassium", level: "medium", min: 60, max: 120, unit: "mg/kg" },
  { nutrient: "potassium", level: "high", min: 120, max: null, unit: "mg/kg" },
] as const

/** kg CaCO₃ per rai to raise pH by 1 unit, by texture and pH band. */
export const SAMPLE_LIME_RATES = [
  { soilTexture: "clay", phFrom: 3.0, phTo: 5.0, kgCaco3PerRaiPerPhUnit: 500 },
  { soilTexture: "clay", phFrom: 5.0, phTo: 8.0, kgCaco3PerRaiPerPhUnit: 400 },
  { soilTexture: "loam", phFrom: 3.0, phTo: 5.0, kgCaco3PerRaiPerPhUnit: 350 },
  { soilTexture: "loam", phFrom: 5.0, phTo: 8.0, kgCaco3PerRaiPerPhUnit: 250 },
  { soilTexture: "sandy", phFrom: 3.0, phTo: 5.0, kgCaco3PerRaiPerPhUnit: 200 },
  { soilTexture: "sandy", phFrom: 5.0, phTo: 8.0, kgCaco3PerRaiPerPhUnit: 150 },
] as const
