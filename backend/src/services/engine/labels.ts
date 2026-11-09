import type { FertilizerNutrient, LandType, NutrientLevel, SoilTexture, WaterSupply } from "./types"

export const NUTRIENT_TH: Record<FertilizerNutrient, string> = {
  nitrogen: "ไนโตรเจน",
  phosphorus: "ฟอสฟอรัส",
  potassium: "โพแทสเซียม",
}

export const LAND_TYPE_TH: Record<LandType, string> = {
  lowland: "ที่ลุ่ม",
  upland: "ที่ดอน",
}

export const WATER_SUPPLY_TH: Record<WaterSupply, string> = {
  rainfed: "อาศัยน้ำฝน",
  seasonal_irrigation: "มีน้ำชลประทานบางฤดู",
  year_round: "มีน้ำตลอดปี",
}

export const SOIL_TEXTURE_TH: Record<SoilTexture, string> = {
  clay: "ดินเหนียว",
  loam: "ดินร่วน",
  sandy: "ดินทราย",
}

export const LEVEL_TH: Record<NutrientLevel, string> = {
  low: "ต่ำ",
  medium: "ปานกลาง",
  high: "สูง",
}
