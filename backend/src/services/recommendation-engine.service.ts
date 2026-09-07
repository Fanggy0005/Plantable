import type { Crop, CropRequirement } from "../generated/prisma"
import type {
  SoilInput,
  CropEvaluationResult,
  RecommendationLevel,
  RecommendationEngineOutput,
} from "../types"

export interface CropWithRequirement extends Crop {
  requirement: CropRequirement | null
}

/**
 * Calculates a 0-100 score for a single nutrient based on agronomic tolerance ranges.
 */
export function scoreNutrient(
  value: number,
  min: number,
  max: number,
  optimal: number
): { score: number; status: "optimal" | "low" | "high" } {
  if (value >= min && value <= max) {
    const halfRange = Math.max((max - min) / 2, 0.001)
    const distanceFromOptimal = Math.abs(value - optimal)
    // Within tolerance range: scores between 80 and 100 depending on closeness to optimal
    const score = Math.round(100 - Math.min(distanceFromOptimal / halfRange, 1) * 20)
    return { score: Math.max(80, Math.min(100, score)), status: "optimal" }
  }

  if (value < min) {
    const deficit = min - value
    const normalizedDeficit = min > 0 ? deficit / min : 1
    const score = Math.max(0, Math.round(80 - Math.min(normalizedDeficit, 1) * 80))
    return { score, status: "low" }
  }

  // value > max
  const excess = value - max
  const normalizedExcess = max > 0 ? excess / max : 1
  const score = Math.max(0, Math.round(80 - Math.min(normalizedExcess, 1) * 80))
  return { score, status: "high" }
}

/**
 * Maps numeric score to standard RecommendationLevel as defined in context.md
 */
export function getRecommendationLevel(score: number): RecommendationLevel {
  if (score >= 90) return "Excellent"
  if (score >= 75) return "Good"
  if (score >= 60) return "Fair"
  if (score >= 40) return "Poor"
  return "Not Recommended"
}

/**
 * Evaluates a single crop against given soil inputs using deterministic agronomic rules.
 */
export function evaluateCropSuitability(
  soil: SoilInput,
  crop: CropWithRequirement
): CropEvaluationResult {
  const req = crop.requirement
  if (!req) {
    return {
      cropId: crop.id,
      cropName: crop.name,
      cropNameTh: crop.nameTh,
      scientificName: crop.scientificName,
      category: crop.category,
      description: crop.description,
      imageUrl: crop.imageUrl,
      score: 0,
      level: "Not Recommended",
      breakdown: { nitrogen: 0, phosphorus: 0, potassium: 0, ph: 0 },
      reasons: ["ยังไม่มีข้อมูลความต้องการธาตุอาหารสำหรับพืชชนิดนี้"],
      improvementSuggestions: [],
    }
  }

  const nResult = scoreNutrient(soil.nitrogen, req.nitrogenMin, req.nitrogenMax, req.nitrogenOptimal)
  const pResult = scoreNutrient(soil.phosphorus, req.phosphorusMin, req.phosphorusMax, req.phosphorusOptimal)
  const kResult = scoreNutrient(soil.potassium, req.potassiumMin, req.potassiumMax, req.potassiumOptimal)
  const phResult = scoreNutrient(soil.ph, req.phMin, req.phMax, req.phOptimal)

  // Weighted formula: N=30%, P=20%, K=20%, pH=30%
  const totalScore = Math.round(
    nResult.score * 0.3 +
    pResult.score * 0.2 +
    kResult.score * 0.2 +
    phResult.score * 0.3
  )

  const level = getRecommendationLevel(totalScore)
  const reasons: string[] = []
  const improvementSuggestions: string[] = []

  // Nitrogen evaluation
  if (nResult.status === "optimal") {
    reasons.push(`ไนโตรเจน (${soil.nitrogen} mg/kg) อยู่ในช่วงที่เหมาะสม (${req.nitrogenMin}-${req.nitrogenMax} mg/kg)`)
  } else if (nResult.status === "low") {
    reasons.push(`ไนโตรเจนต่ำกว่าเกณฑ์ (${soil.nitrogen} < ${req.nitrogenMin} mg/kg)`)
    improvementSuggestions.push(`เพิ่มปุ๋ยไนโตรเจน เช่น ยูเรีย (46-0-0) หรือปุ๋ยหมักมูลสัตว์ เพื่อกระตุ้นการเจริญเติบโตของใบและลำต้น`)
  } else {
    reasons.push(`ไนโตรเจนสูงเกินไป (${soil.nitrogen} > ${req.nitrogenMax} mg/kg) ซึ่งอาจทำให้พืชบ้าใบและเสี่ยงต่อโรค`)
    improvementSuggestions.push(`งดใส่ปุ๋ยไนโตรเจนเพิ่มเติม และให้น้ำเพื่อช่วยชะล้างหรือปลูกพืชดูดซับธาตุอาหาร`)
  }

  // Phosphorus evaluation
  if (pResult.status === "optimal") {
    reasons.push(`ฟอสฟอรัส (${soil.phosphorus} mg/kg) อยู่ในช่วงที่เหมาะสม (${req.phosphorusMin}-${req.phosphorusMax} mg/kg)`)
  } else if (pResult.status === "low") {
    reasons.push(`ฟอสฟอรัสต่ำกว่าเกณฑ์ (${soil.phosphorus} < ${req.phosphorusMin} mg/kg) อาจส่งผลต่อระบบรากและการออกดอก`)
    improvementSuggestions.push(`เสริมปุ๋ยฟอสฟอรัส เช่น ไตรเปิลซุปเปอร์ฟอสเฟต (0-46-0) หรือหินฟอสเฟตบด`)
  } else {
    reasons.push(`ฟอสฟอรัสสูงเกินเกณฑ์ (${soil.phosphorus} > ${req.phosphorusMax} mg/kg)`)
    improvementSuggestions.push(`งดการให้ปุ๋ยที่มีส่วนผสมของฟอสฟอรัสชั่วคราว`)
  }

  // Potassium evaluation
  if (kResult.status === "optimal") {
    reasons.push(`โพแทสเซียม (${soil.potassium} mg/kg) อยู่ในช่วงที่เหมาะสม (${req.potassiumMin}-${req.potassiumMax} mg/kg)`)
  } else if (kResult.status === "low") {
    reasons.push(`โพแทสเซียมต่ำกว่าเกณฑ์ (${soil.potassium} < ${req.potassiumMin} mg/kg) อาจทำให้ผลผลิตสะสมแป้งและน้ำตาลไม่ดี`)
    improvementSuggestions.push(`เติมปุ๋ยโพแทสเซียม เช่น โพแทสเซียมคลอไรด์ (0-0-60) หรือโพแทสเซียมซัลเฟต (0-0-50)`)
  } else {
    reasons.push(`โพแทสเซียมสูงเกินเกณฑ์ (${soil.potassium} > ${req.potassiumMax} mg/kg)`)
    improvementSuggestions.push(`ลดการใส่ปุ๋ยโพแทสเซียมเพื่อป้องกันการขัดขวางการดูดซึมแคลเซียมและแมกนีเซียม`)
  }

  // pH evaluation
  if (phResult.status === "optimal") {
    reasons.push(`ค่าความเป็นกรด-ด่าง pH (${soil.ph}) อยู่ในช่วงเหมาะสม (${req.phMin}-${req.phMax})`)
  } else if (phResult.status === "low") {
    reasons.push(`ดินเป็นกรดมากเกินไป (pH ${soil.ph} < ${req.phMin}) อาจทำให้ธาตุอาหารบางตัวไม่ละลาย`)
    improvementSuggestions.push(`หว่านปูนขาว โดโลไมท์ หรือปูนมาร์ล (แคลเซียมคาร์บอเนต) เพื่อปรับสภาพกรดและเพิ่มค่า pH ของดิน`)
  } else {
    reasons.push(`ดินเป็นด่างมากเกินไป (pH ${soil.ph} > ${req.phMax})`)
    improvementSuggestions.push(`ใช้อินทรียวัตถุ ปุ๋ยคอกหมัก หรือกำมะถันผงเพื่อช่วยปรับลดค่า pH ของดินให้อยู่ในเกณฑ์เหมาะสม`)
  }

  return {
    cropId: crop.id,
    cropName: crop.name,
    cropNameTh: crop.nameTh,
    scientificName: crop.scientificName,
    category: crop.category,
    description: crop.description,
    imageUrl: crop.imageUrl,
    score: totalScore,
    level,
    breakdown: {
      nitrogen: nResult.score,
      phosphorus: pResult.score,
      potassium: kResult.score,
      ph: phResult.score,
    },
    reasons,
    improvementSuggestions,
  }
}

/**
 * Evaluates all available crops, calculates suitability scores,
 * and returns ranked results sorted by score in descending order.
 */
export function rankCropsForSoil(
  soil: SoilInput,
  crops: CropWithRequirement[]
): RecommendationEngineOutput {
  const recommendations = crops
    .map((crop) => evaluateCropSuitability(soil, crop))
    .sort((a, b) => b.score - a.score)

  return {
    soil,
    recommendations,
  }
}
