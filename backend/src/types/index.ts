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
  condition: string
}

/** Calculated by Plantable from the forecast. Not an official warning. */
export interface AgriculturalAlert {
  type: "drought" | "heavy_rain" | "extreme_heat"
  /** Forecast day the alert is about, when it concerns a single day. */
  date?: string
  titleTh: string
  titleEn: string
  messageTh: string
  messageEn: string
  severity: "medium" | "high"
}

/**
 * `live`: Open-Meteo data. `climatology`: typical values for the season because live
 * data was unavailable. It has no forecast, no alerts, and no rain or wind values.
 */
export type WeatherSource = "live" | "climatology"

export interface WeatherData {
  source: WeatherSource
  /** Time of the current observation (Asia/Bangkok); null for climatology. */
  observedAt: string | null
  province: string
  region: ThaiRegion
  regionTh: string
  temperature: number
  humidity: number
  precipitation: number | null
  condition: string
  conditionTh: string
  windSpeed: number | null
  season: SeasonType
  seasonLabelTh: string
  forecast: WeatherForecastDay[]
  agriculturalAlerts: AgriculturalAlert[]
}

