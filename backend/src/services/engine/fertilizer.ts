import type { FertilizerProduct, NutrientAmounts } from "./types"

// Nutrient fractions of the straight fertilizers (แม่ปุ๋ย). These are the grade on the bag.
const DAP_N = 0.18 // 18-46-0
const DAP_P2O5 = 0.46
const UREA_N = 0.46 // 46-0-0
const MOP_K2O = 0.6 // 0-0-60

export const round1 = (value: number) => Math.round(value * 10) / 10

export interface FertilizerMix {
  products: FertilizerProduct[]
  /** N supplied beyond the target, when 18-46-0 alone already exceeds the N need. */
  excessN: number
}

/**
 * Convert nutrient targets (kg/rai) into straight fertilizers.
 * P₂O₅ comes from 18-46-0 first (it also supplies N), the remaining N from 46-0-0,
 * and K₂O from 0-0-60.
 */
export function toStraightFertilizers(target: NutrientAmounts, areaRai: number): FertilizerMix {
  const dapKg = target.p2o5 / DAP_P2O5
  const nFromDap = dapKg * DAP_N
  const ureaKg = Math.max(0, target.n - nFromDap) / UREA_N
  const mopKg = target.k2o / MOP_K2O

  const candidates: Array<[FertilizerProduct["formula"], number]> = [
    ["18-46-0", dapKg],
    ["46-0-0", ureaKg],
    ["0-0-60", mopKg],
  ]

  const products = candidates
    .filter(([, kgPerRai]) => round1(kgPerRai) > 0)
    .map(([formula, kgPerRai]) => ({
      formula,
      kgPerRai: round1(kgPerRai),
      kgTotal: round1(kgPerRai * areaRai),
    }))

  return { products, excessN: round1(Math.max(0, nFromDap - target.n)) }
}
