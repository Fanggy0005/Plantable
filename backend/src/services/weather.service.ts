import {
  DRY_SPELL_MAX_TOTAL_MM,
  EXTREME_HEAT_MAX_C,
  FORECAST_DAYS,
  HEAVY_RAIN_MM_PER_DAY,
  VERY_HEAVY_RAIN_MM_PER_DAY,
  WEATHER_TIMEOUT_MS,
} from "../constants/weather"
import type { AgriculturalAlert, SeasonType, ThaiRegion, WeatherData, WeatherForecastDay } from "../types"

export interface ProvinceLocation {
  name: string
  nameTh: string
  region: ThaiRegion
  regionTh: string
  lat: number
  lon: number
}

// Major agricultural provinces representing all 6 Thai regions
export const THAI_PROVINCES: Record<string, ProvinceLocation> = {
  nakhon_ratchasima: {
    name: "Nakhon Ratchasima",
    nameTh: "นครราชสีมา (โคราช)",
    region: "Northeastern",
    regionTh: "ภาคตะวันออกเฉียงเหนือ",
    lat: 14.97,
    lon: 102.1,
  },
  khon_kaen: {
    name: "Khon Kaen",
    nameTh: "ขอนแก่น",
    region: "Northeastern",
    regionTh: "ภาคตะวันออกเฉียงเหนือ",
    lat: 16.44,
    lon: 102.83,
  },
  chiang_mai: {
    name: "Chiang Mai",
    nameTh: "เชียงใหม่",
    region: "Northern",
    regionTh: "ภาคเหนือ",
    lat: 18.79,
    lon: 98.98,
  },
  nan: {
    name: "Nan",
    nameTh: "น่าน",
    region: "Northern",
    regionTh: "ภาคเหนือ",
    lat: 18.78,
    lon: 100.77,
  },
  suphan_buri: {
    name: "Suphan Buri",
    nameTh: "สุพรรณบุรี",
    region: "Central",
    regionTh: "ภาคกลาง",
    lat: 14.47,
    lon: 100.12,
  },
  ayutthaya: {
    name: "Phra Nakhon Si Ayutthaya",
    nameTh: "พระนครศรีอยุธยา",
    region: "Central",
    regionTh: "ภาคกลาง",
    lat: 14.35,
    lon: 100.57,
  },
  rayong: {
    name: "Rayong",
    nameTh: "ระยอง",
    region: "Eastern",
    regionTh: "ภาคตะวันออก",
    lat: 12.68,
    lon: 101.28,
  },
  chanthaburi: {
    name: "Chanthaburi",
    nameTh: "จันทบุรี",
    region: "Eastern",
    regionTh: "ภาคตะวันออก",
    lat: 12.61,
    lon: 102.1,
  },
  surat_thani: {
    name: "Surat Thani",
    nameTh: "สุราษฎร์ธานี",
    region: "Southern",
    regionTh: "ภาคใต้",
    lat: 9.14,
    lon: 99.33,
  },
  songkhla: {
    name: "Songkhla",
    nameTh: "สงขลา",
    region: "Southern",
    regionTh: "ภาคใต้",
    lat: 7.2,
    lon: 100.6,
  },
  kanchanaburi: {
    name: "Kanchanaburi",
    nameTh: "กาญจนบุรี",
    region: "Western",
    regionTh: "ภาคตะวันตก",
    lat: 14.02,
    lon: 99.53,
  },
}

export function getCurrentSeason(): { season: SeasonType; labelTh: string } {
  const month = new Date().getMonth() + 1 // 1 - 12
  // Thailand seasons:
  // May (5) to Oct (10) = Rainy (ฤดูฝน)
  // Nov (11) to Feb (2) = Winter / Cool (ฤดูหนาว)
  // Mar (3) to Apr (4) = Summer / Hot Dry (ฤดูร้อน)
  if (month >= 5 && month <= 10) {
    return { season: "rainy", labelTh: "ฤดูฝน (ความชื้นและน้ำสมบูรณ์)" }
  }
  if (month >= 11 || month <= 2) {
    return { season: "winter", labelTh: "ฤดูหนาว (อากาศเย็น แห้ง ฝนน้อย)" }
  }
  return { season: "summer", labelTh: "ฤดูร้อน (แดดจัด เสี่ยงแล้ง)" }
}

export function getSeasonFromType(type?: string | null): { season: SeasonType; labelTh: string } {
  if (type === "rainy") return { season: "rainy", labelTh: "ฤดูฝน (ความชื้นและน้ำสมบูรณ์)" }
  if (type === "winter") return { season: "winter", labelTh: "ฤดูหนาว (อากาศเย็น แห้ง ฝนน้อย)" }
  if (type === "summer") return { season: "summer", labelTh: "ฤดูร้อน (แดดจัด เสี่ยงแล้ง)" }
  return getCurrentSeason()
}

interface Condition {
  conditionTh: string
  condition: string
}

/** WMO weather interpretation codes, as used by Open-Meteo. */
export function conditionFromWeatherCode(code: number): Condition {
  if (code === 0) return { conditionTh: "ท้องฟ้าแจ่มใส", condition: "Clear sky" }
  if (code >= 1 && code <= 3) return { conditionTh: "มีเมฆบางส่วนถึงเมฆมาก", condition: "Partly cloudy to overcast" }
  if (code === 45 || code === 48) return { conditionTh: "มีหมอก", condition: "Fog" }
  if (code >= 51 && code <= 57) return { conditionTh: "ฝนปรอย", condition: "Drizzle" }
  if (code >= 61 && code <= 67) return { conditionTh: "ฝนตก", condition: "Rain" }
  if (code >= 80 && code <= 82) return { conditionTh: "ฝนตกเป็นช่วง ๆ", condition: "Rain showers" }
  if (code >= 95 && code <= 99) return { conditionTh: "พายุฝนฟ้าคะนอง", condition: "Thunderstorm" }
  return { conditionTh: "ไม่ทราบสภาพอากาศ", condition: "Unknown" }
}

interface OpenMeteoResponse {
  current: {
    time: string
    temperature_2m: number
    relative_humidity_2m: number
    precipitation: number
    weather_code: number
    wind_speed_10m: number
  }
  daily: {
    time: string[]
    weather_code: number[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    precipitation_sum: number[]
  }
}

function isOpenMeteoResponse(json: unknown): json is OpenMeteoResponse {
  const j = json as Partial<OpenMeteoResponse> | null
  return (
    typeof j?.current?.temperature_2m === "number" &&
    typeof j.current.relative_humidity_2m === "number" &&
    Array.isArray(j.daily?.time) &&
    Array.isArray(j.daily.precipitation_sum) &&
    Array.isArray(j.daily.temperature_2m_max) &&
    Array.isArray(j.daily.temperature_2m_min) &&
    Array.isArray(j.daily.weather_code)
  )
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

/**
 * Builds field alerts from the daily forecast. Returns an empty list when nothing
 * needs attention: the app never claims the weather is "good for crops".
 */
export function evaluateAgriculturalAlerts(forecast: WeatherForecastDay[], season: SeasonType): AgriculturalAlert[] {
  const alerts: AgriculturalAlert[] = []

  const rainDay = forecast.find((d) => d.precipitationSum >= HEAVY_RAIN_MM_PER_DAY)
  if (rainDay) {
    const veryHeavy = rainDay.precipitationSum >= VERY_HEAVY_RAIN_MM_PER_DAY
    alerts.push({
      type: "heavy_rain",
      date: rainDay.date,
      severity: veryHeavy ? "high" : "medium",
      titleTh: veryHeavy ? "พยากรณ์ฝนตกหนักมาก" : "พยากรณ์ฝนตกหนัก",
      titleEn: veryHeavy ? "Very heavy rain forecast" : "Heavy rain forecast",
      messageTh: `คาดว่าฝนจะตกประมาณ ${rainDay.precipitationSum} มม. ภายในวันเดียว ควรเปิดทางระบายน้ำในแปลง และเลื่อนการใส่ปุ๋ยออกไปจนกว่าฝนจะหยุด`,
      messageEn: `About ${rainDay.precipitationSum} mm of rain is expected in one day. Clear the field drains and hold off on fertilizer until the rain stops.`,
    })
  }

  const hotDay = forecast.find((d) => d.tempMax >= EXTREME_HEAT_MAX_C)
  if (hotDay) {
    alerts.push({
      type: "extreme_heat",
      date: hotDay.date,
      severity: "medium",
      titleTh: "พยากรณ์อากาศร้อนจัด",
      titleEn: "Extreme heat forecast",
      messageTh: `คาดว่าอุณหภูมิสูงสุดจะถึง ${hotDay.tempMax}°C ควรให้น้ำช่วงเช้าตรู่หรือเย็น และคลุมหน้าดินเพื่อลดการระเหยของน้ำ`,
      messageEn: `The maximum temperature is expected to reach ${hotDay.tempMax}°C. Water early in the morning or in the evening, and mulch to reduce evaporation.`,
    })
  }

  const totalRain = forecast.reduce((sum, d) => sum + d.precipitationSum, 0)
  if (season === "summer" && forecast.length > 0 && totalRain < DRY_SPELL_MAX_TOTAL_MM) {
    alerts.push({
      type: "drought",
      severity: "medium",
      titleTh: "ไม่มีฝนในช่วงพยากรณ์",
      titleEn: "No rain in the forecast",
      messageTh: `พยากรณ์ ${forecast.length} วันข้างหน้าแทบไม่มีฝน ควรวางแผนให้น้ำ และคลุมหน้าดินด้วยฟางหรือหญ้าแห้ง`,
      messageEn: `Almost no rain is forecast for the next ${forecast.length} days. Plan irrigation and mulch the soil with straw or dry grass.`,
    })
  }

  return alerts
}

/** Typical conditions by season. Used only when live data is unavailable, and labelled as such. */
const SEASONAL_TYPICAL: Record<SeasonType, { temperature: number; humidity: number }> = {
  rainy: { temperature: 29, humidity: 82 },
  winter: { temperature: 25, humidity: 60 },
  summer: { temperature: 36, humidity: 55 },
}

type WeatherBase = Pick<WeatherData, "province" | "region" | "regionTh" | "season" | "seasonLabelTh">

export class WeatherService {
  /** Resolve a province key or name, or return the default (Nakhon Ratchasima). */
  resolveLocation(provinceQuery?: string | null): ProvinceLocation {
    const fallback = THAI_PROVINCES.nakhon_ratchasima as ProvinceLocation
    if (!provinceQuery) return fallback

    const query = provinceQuery.toLowerCase().trim()
    for (const [key, loc] of Object.entries(THAI_PROVINCES)) {
      if (key === query || loc.name.toLowerCase().includes(query) || loc.nameTh.includes(query)) {
        return loc
      }
    }
    return fallback
  }

  /** Live weather from Open-Meteo, or seasonal typical values (`source: "climatology"`) if that fails. */
  async getWeatherData(provinceQuery?: string | null): Promise<WeatherData> {
    const loc = this.resolveLocation(provinceQuery)
    const { season, labelTh: seasonLabelTh } = getCurrentSeason()
    const base: WeatherBase = { province: loc.nameTh, region: loc.region, regionTh: loc.regionTh, season, seasonLabelTh }

    const live = await this.fetchOpenMeteo(loc)
    if (!live) return this.getClimatologicalFallback(base)

    const { current, daily } = live
    const forecast: WeatherForecastDay[] = daily.time.slice(0, FORECAST_DAYS).map((date, i) => ({
      date,
      tempMax: Math.round(daily.temperature_2m_max[i] ?? 0),
      tempMin: Math.round(daily.temperature_2m_min[i] ?? 0),
      precipitationSum: round1(daily.precipitation_sum[i] ?? 0),
      ...conditionFromWeatherCode(daily.weather_code[i] ?? -1),
    }))

    return {
      ...base,
      source: "live",
      observedAt: current.time ?? null,
      temperature: round1(current.temperature_2m),
      humidity: Math.round(current.relative_humidity_2m),
      precipitation: round1(current.precipitation ?? 0),
      windSpeed: round1(current.wind_speed_10m ?? 0),
      ...conditionFromWeatherCode(current.weather_code ?? -1),
      forecast,
      agriculturalAlerts: evaluateAgriculturalAlerts(forecast, season),
    }
  }

  private async fetchOpenMeteo(loc: ProvinceLocation): Promise<OpenMeteoResponse | null> {
    const params = new URLSearchParams({
      latitude: String(loc.lat),
      longitude: String(loc.lon),
      current: "temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m",
      daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum",
      forecast_days: String(FORECAST_DAYS),
      timezone: "Asia/Bangkok",
    })
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
        signal: AbortSignal.timeout(WEATHER_TIMEOUT_MS),
      })
      if (!res.ok) return null
      const json: unknown = await res.json()
      return isOpenMeteoResponse(json) ? json : null
    } catch {
      return null
    }
  }

  /**
   * Typical values for the season, not a measurement. No forecast, alerts, rain or wind
   * are returned: they would be invented.
   */
  private getClimatologicalFallback(base: WeatherBase): WeatherData {
    const typical = SEASONAL_TYPICAL[base.season]
    return {
      ...base,
      source: "climatology",
      observedAt: null,
      temperature: typical.temperature,
      humidity: typical.humidity,
      precipitation: null,
      windSpeed: null,
      conditionTh: "ค่าทั่วไปของฤดูกาล ไม่ใช่ข้อมูลจริง",
      condition: "Typical for the season, not live data",
      forecast: [],
      agriculturalAlerts: [],
    }
  }
}

export const weatherService = new WeatherService()
