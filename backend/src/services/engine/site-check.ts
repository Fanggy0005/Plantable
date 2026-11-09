import { LAND_TYPE_TH, WATER_SUPPLY_TH } from "./labels"
import type { CropRequirementData, SiteInput, WaterSupply } from "./types"

const WATER_RANK: Record<WaterSupply, number> = {
  rainfed: 0,
  seasonal_irrigation: 1,
  year_round: 2,
}

/** Returns the reasons a crop cannot be grown on this site. Empty = eligible. */
export function checkSite(site: SiteInput, req: CropRequirementData): string[] {
  const reasons: string[] = []

  if (!req.allowedLandTypes.includes(site.landType)) {
    const allowed = req.allowedLandTypes.map((t) => LAND_TYPE_TH[t]).join(" หรือ ")
    reasons.push(`พืชนี้ต้องการพื้นที่${allowed} แต่แปลงเป็น${LAND_TYPE_TH[site.landType]}`)
  }

  if (WATER_RANK[site.waterSupply] < WATER_RANK[req.minWaterSupply]) {
    reasons.push(
      `พืชนี้ต้องการน้ำอย่างน้อยระดับ "${WATER_SUPPLY_TH[req.minWaterSupply]}" แต่แปลง${WATER_SUPPLY_TH[site.waterSupply]}`
    )
  }

  return reasons
}
