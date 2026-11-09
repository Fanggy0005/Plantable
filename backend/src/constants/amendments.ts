import type { NutrientLevel } from "../services/engine/types"

// Liming materials and their calcium carbonate equivalent (CCE).
// Values are the theoretical CCE of the pure compound. Real products vary: tell the
// farmer to check the CCE on the bag label.
export const LIMING_MATERIALS = {
  dolomite: { nameTh: "โดโลไมต์", nameEn: "Dolomite", caco3Equivalent: 1.09 },
  calcium_carbonate: { nameTh: "ปูนหินบด (แคลเซียมคาร์บอเนต)", nameEn: "Ground limestone", caco3Equivalent: 1.0 },
} as const

export type LimingMaterial = keyof typeof LIMING_MATERIALS

export const DEFAULT_LIMING_MATERIAL: LimingMaterial = "dolomite"

// ------------------------------------------------------------------
// SAMPLE VALUES: not verified against LDD/DOA. Replace with cited
// values before production (docs/roadmap.md 1.1).
// ------------------------------------------------------------------

export const AMENDMENT_SOURCE = "SAMPLE DATA: not verified, do not use in production"

/** Days before planting to apply lime (negative = before planting). */
export const LIME_DAYS_AFTER_PLANTING = -28

/** Days before planting to incorporate compost/manure. */
export const ORGANIC_MATTER_DAYS_AFTER_PLANTING = -14

/** Compost or well-rotted manure, kg per rai, by organic matter level. */
export const ORGANIC_MATTER_KG_PER_RAI: Record<NutrientLevel, number> = {
  low: 2000,
  medium: 1000,
  high: 0,
}
