// Weather / environment types. Engine types live in services/engine/types.ts.

export type ThaiRegion =
  | "Northern"
  | "Northeastern"
  | "Central"
  | "Eastern"
  | "Southern"
  | "Western"

export type SeasonType = "rainy" | "winter" | "summer"

export interface WeatherForecastDay {
  date: string
  tempMax: number
  tempMin: number
  precipitationSum: number
  conditionTh: string
}

export interface AgriculturalAlert {
  type: "drought" | "heavy_rain" | "extreme_heat" | "favorable"
  titleTh: string
  messageTh: string
  severity: "low" | "medium" | "high"
}

export interface WeatherData {
  province: string
  region: ThaiRegion
  regionTh: string
  temperature: number
  humidity: number
  precipitation: number
  condition: string
  conditionTh: string
  windSpeed: number
  season: SeasonType
  seasonLabelTh: string
  forecast: WeatherForecastDay[]
  agriculturalAlerts: AgriculturalAlert[]
}

