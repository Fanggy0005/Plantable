import type { PlantRequirement } from "../data/plants"

export interface SoilInput {
  nitrogen: number
  phosphorus: number
  potassium: number
  ph: number
}

export interface ScoreResult {
  plantId: string
  score: number        // 0-100
  breakdown: {
    nitrogen: number
    phosphorus: number
    potassium: number
    ph: number
  }
  reasons: string[]
  improvements: string[]
}

function scoreNutrient(value: number, req: { min: number; max: number; optimal: number }): number {
  if (value >= req.min && value <= req.max) {
    // อยู่ในช่วง — ยิ่งใกล้ optimal ยิ่งได้คะแนนสูง
    const distanceFromOptimal = Math.abs(value - req.optimal)
    const range = (req.max - req.min) / 2
    return Math.round(100 - (distanceFromOptimal / range) * 20)
  }
  if (value < req.min) {
    // ต่ำกว่า min — คะแนนลดตามระยะห่าง
    const deficit = req.min - value
    return Math.max(0, Math.round(80 - (deficit / req.min) * 80))
  }
  // สูงกว่า max
  const excess = value - req.max
  return Math.max(0, Math.round(80 - (excess / req.max) * 80))
}

export function calculateScore(soil: SoilInput, plant: PlantRequirement): ScoreResult {
  const nScore  = scoreNutrient(soil.nitrogen,   plant.nitrogen)
  const pScore  = scoreNutrient(soil.phosphorus,  plant.phosphorus)
  const kScore  = scoreNutrient(soil.potassium,   plant.potassium)
  const phScore = scoreNutrient(soil.ph,          plant.ph)

  // weighted average: N=30%, P=20%, K=20%, pH=30%
  const total = Math.round(nScore * 0.3 + pScore * 0.2 + kScore * 0.2 + phScore * 0.3)

  const reasons: string[] = []
  const improvements: string[] = []

  if (nScore >= 80)  reasons.push(`ไนโตรเจนอยู่ในช่วงที่เหมาะสม`)
  else if (soil.nitrogen < plant.nitrogen.min) {
    reasons.push(`ไนโตรเจนต่ำเกินไป (${soil.nitrogen} < ${plant.nitrogen.min})`)
    improvements.push(`เพิ่มปุ๋ยไนโตรเจน เช่น ยูเรีย (46-0-0) หรือแอมโมเนียมซัลเฟต`)
  } else {
    reasons.push(`ไนโตรเจนสูงเกินไป (${soil.nitrogen} > ${plant.nitrogen.max})`)
    improvements.push(`ลดการใส่ปุ๋ยไนโตรเจน และเพิ่มการระบายน้ำ`)
  }

  if (pScore >= 80)  reasons.push(`ฟอสฟอรัสอยู่ในช่วงที่เหมาะสม`)
  else if (soil.phosphorus < plant.phosphorus.min) {
    reasons.push(`ฟอสฟอรัสต่ำเกินไป (${soil.phosphorus} < ${plant.phosphorus.min})`)
    improvements.push(`เพิ่มปุ๋ยฟอสฟอรัส เช่น ซุปเปอร์ฟอสเฟต (0-46-0)`)
  } else {
    reasons.push(`ฟอสฟอรัสสูงเกินไป (${soil.phosphorus} > ${plant.phosphorus.max})`)
    improvements.push(`หยุดใส่ปุ๋ยฟอสฟอรัสชั่วคราว`)
  }

  if (kScore >= 80)  reasons.push(`โพแทสเซียมอยู่ในช่วงที่เหมาะสม`)
  else if (soil.potassium < plant.potassium.min) {
    reasons.push(`โพแทสเซียมต่ำเกินไป (${soil.potassium} < ${plant.potassium.min})`)
    improvements.push(`เพิ่มปุ๋ยโพแทสเซียม เช่น โพแทสเซียมคลอไรด์ (0-0-60)`)
  } else {
    reasons.push(`โพแทสเซียมสูงเกินไป (${soil.potassium} > ${plant.potassium.max})`)
    improvements.push(`ลดปุ๋ยโพแทสเซียม และเพิ่มการชะล้างดิน`)
  }

  if (phScore >= 80) reasons.push(`ค่า pH อยู่ในช่วงที่เหมาะสม`)
  else if (soil.ph < plant.ph.min) {
    reasons.push(`ค่า pH ต่ำเกินไป ดินเป็นกรดมาก (${soil.ph} < ${plant.ph.min})`)
    improvements.push(`ใส่ปูนขาว (Calcium Carbonate) เพื่อเพิ่ม pH`)
  } else {
    reasons.push(`ค่า pH สูงเกินไป ดินเป็นด่างมาก (${soil.ph} > ${plant.ph.max})`)
    improvements.push(`ใส่กำมะถัน (Sulfur) หรือปุ๋ยอินทรีย์เพื่อลด pH`)
  }

  return {
    plantId: plant.id,
    score: total,
    breakdown: { nitrogen: nScore, phosphorus: pScore, potassium: kScore, ph: phScore },
    reasons,
    improvements,
  }
}
