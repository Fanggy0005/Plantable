import type {
  WeatherData,
  RegionalCropSuitability,
  ThaiRegion,
  SeasonType,
  AgriculturalAlert,
  WeatherForecastDay,
} from "../types"
import type { Crop } from "../generated/prisma"

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

export class WeatherService {
  /**
   * Resolve province key or return default (Nakhon Ratchasima - Central/Isan hub)
   */
  resolveLocation(provinceQuery?: string | null): ProvinceLocation {
    if (!provinceQuery) return THAI_PROVINCES.nakhon_ratchasima

    const query = provinceQuery.toLowerCase().trim()
    for (const [key, loc] of Object.entries(THAI_PROVINCES)) {
      if (
        key === query ||
        loc.name.toLowerCase().includes(query) ||
        loc.nameTh.includes(query)
      ) {
        return loc
      }
    }

    return THAI_PROVINCES.nakhon_ratchasima
  }

  /**
   * Fetch live weather data from Open-Meteo or use climatological fallback
   */
  async getWeatherData(provinceQuery?: string | null): Promise<WeatherData> {
    const loc = this.resolveLocation(provinceQuery)
    const { season, labelTh: seasonLabelTh } = getCurrentSeason()

    try {
      // 5-second timeout for Open-Meteo API
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 4000)

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia%2FBangkok`
      const res = await fetch(url, { signal: controller.signal })
      clearTimeout(timeout)

      if (res.ok) {
        const json = await res.json()
        const current = json.current
        const daily = json.daily

        const alerts = this.evaluateAgriculturalAlerts(
          current.temperature_2m,
          current.relative_humidity_2m,
          current.precipitation,
          season
        )

        const forecast: WeatherForecastDay[] = (daily.time || []).slice(0, 5).map((date: string, idx: number) => ({
          date,
          tempMax: Math.round(daily.temperature_2m_max[idx] || 32),
          tempMin: Math.round(daily.temperature_2m_min[idx] || 24),
          precipitationSum: Number((daily.precipitation_sum[idx] || 0).toFixed(1)),
          conditionTh: daily.precipitation_sum[idx] > 5 ? "มีฝนตกชุก" : "ท้องฟ้าโปร่งถึงมีเมฆบางส่วน",
        }))

        return {
          province: loc.nameTh,
          region: loc.region,
          regionTh: loc.regionTh,
          temperature: Math.round(current.temperature_2m),
          humidity: Math.round(current.relative_humidity_2m),
          precipitation: current.precipitation || 0,
          condition: current.precipitation > 2 ? "Rainy" : "Fair / Partly Cloudy",
          conditionTh: current.precipitation > 2 ? "มีฝนตก" : "สภาพอากาศโปร่ง เหมาะแก่การทำการเกษตร",
          windSpeed: Number((current.wind_speed_10m || 8).toFixed(1)),
          season,
          seasonLabelTh,
          forecast,
          agriculturalAlerts: alerts,
        }
      }
    } catch {
      // Fall through to fallback
    }

    // Climatological normal fallback
    return this.getClimatologicalFallback(loc, season, seasonLabelTh)
  }

  private getClimatologicalFallback(
    loc: ProvinceLocation,
    season: SeasonType,
    seasonLabelTh: string
  ): WeatherData {
    let temp = 30
    let humidity = 70
    let precipitation = 0

    if (season === "rainy") {
      temp = 29
      humidity = 82
      precipitation = 4.5
    } else if (season === "winter") {
      temp = 25
      humidity = 60
      precipitation = 0.2
    } else {
      // summer
      temp = 36
      humidity = 55
      precipitation = 0.5
    }

    const alerts = this.evaluateAgriculturalAlerts(temp, humidity, precipitation, season)
    const today = new Date()

    const forecast: WeatherForecastDay[] = Array.from({ length: 5 }, (_, i) => {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      return {
        date: d.toISOString().split("T")[0],
        tempMax: temp + 2,
        tempMin: temp - 5,
        precipitationSum: precipitation,
        conditionTh: precipitation > 2 ? "โอกาสเกิดฝนตกปานกลาง" : "อากาศแจ่มใส ทัศนวิสัยดี",
      }
    })

    return {
      province: loc.nameTh,
      region: loc.region,
      regionTh: loc.regionTh,
      temperature: temp,
      humidity,
      precipitation,
      condition: precipitation > 0 ? "Scattered Showers" : "Clear Sky",
      conditionTh: precipitation > 0 ? "มีฝนกระจายบางพื้นที่" : "สภาพอากาศแจ่มใสปกติ",
      windSpeed: 10.5,
      season,
      seasonLabelTh,
      forecast,
      agriculturalAlerts: alerts,
    }
  }

  /**
   * Evaluate weather risks and generate agricultural warnings
   */
  evaluateAgriculturalAlerts(
    temperature: number,
    humidity: number,
    precipitation: number,
    season: SeasonType
  ): AgriculturalAlert[] {
    const alerts: AgriculturalAlert[] = []

    if (precipitation > 25) {
      alerts.push({
        type: "heavy_rain",
        titleTh: "แจ้งเตือน: ฝนตกหนักเสี่ยงน้ำท่วมขัง",
        messageTh: "ปริมาณน้ำฝนสะสมสูง ควรตรวจระบบระบายน้ำในร่องแปลงเพื่อป้องกันโรครากเน่าและโคนเน่า",
        severity: "high",
      })
    }

    if (temperature > 37) {
      alerts.push({
        type: "extreme_heat",
        titleTh: "แจ้งเตือน: สภาพอากาศร้อนจัด (Heat Stress)",
        messageTh: "อุณหภูมิสูงกว่า 37°C พืชอาจคายน้ำรวดเร็วและดอกร่วง ควรให้น้ำเพิ่มขึ้นในช่วงเช้าตรู่หรือเย็น",
        severity: "medium",
      })
    }

    if (season === "summer" && precipitation < 1 && humidity < 50) {
      alerts.push({
        type: "drought",
        titleTh: "ข้อควรระวัง: สภาวะฝนทิ้งช่วงและแล้ง",
        messageTh: "ความชื้นในบรรยากาศต่ำ ควรรักษาหน้าดินด้วยฟางข้าวหรือหญ้าแห้งเพื่อลดการระเหยของน้ำ",
        severity: "medium",
      })
    }

    if (alerts.length === 0) {
      alerts.push({
        type: "favorable",
        titleTh: "สภาพอากาศเอื้ออำนวยต่อการเพาะปลูก",
        messageTh: "อุณหภูมิและความชื้นสัมพัทธ์อยู่ในเกณฑ์สมดุล พืชสามารถสังเคราะห์แสงและดูดซึมปุ๋ยได้ดีเยี่ยม",
        severity: "low",
      })
    }

    return alerts
  }

  /**
   * Evaluate regional and seasonal compatibility for a crop
   */
  evaluateRegionalSuitability(
    crop: { id: string; name: string; nameTh: string; category: string },
    provinceQuery?: string | null,
    seasonQuery?: string | null
  ): RegionalCropSuitability {
    const loc = this.resolveLocation(provinceQuery)
    const { season, labelTh: seasonLabelTh } = getSeasonFromType(seasonQuery)

    let climateScore = 85
    let regionalFit: "highly_suitable" | "moderately_suitable" | "poorly_suitable" = "highly_suitable"
    let regionalFitLabelTh = "เหมาะสมสูงมากกับสภาพภูมิภาค"
    let regionalReasonTh = `สภาพอากาศและระดับความสูงของ${loc.regionTh} (${loc.nameTh}) สอดคล้องกับพืชชนิดนี้`
    let bestMonthsTh = "พฤษภาคม - กรกฎาคม"
    let waterAvailability: "high" | "moderate" | "low" = "moderate"

    const name = crop.name.toLowerCase()

    // 1. Rice (ข้าว)
    if (name.includes("rice")) {
      waterAvailability = season === "rainy" ? "high" : "moderate"
      if (season === "rainy") {
        climateScore = 95
        regionalFit = "highly_suitable"
        regionalFitLabelTh = "เหมาะสมสูงสุดในฤดูทำนาปี"
        regionalReasonTh = `ช่วงฤดูฝนใน${loc.regionTh} มีปริมาณน้ำเพียงพอต่อการเจริญเติบโตและการแตกกอของข้าว`
        bestMonthsTh = "พฤษภาคม - สิงหาคม (นาปี), มกราคม - มีนาคม (นาปรังในเขตชลประทาน)"
      } else {
        climateScore = 70
        regionalFit = "moderately_suitable"
        regionalFitLabelTh = "เหมาะสมปานกลาง (ต้องมีแหล่งน้ำชลประทาน)"
        regionalReasonTh = "การปลูกข้าวนอกฤดูฝนจำเป็นต้องอาศัยคลองส่งน้ำชลประทานหรือบ่อบาดาลประจำแปลง"
      }
    }
    // 2. Corn (ข้าวโพด)
    else if (name.includes("corn") || name.includes("maize")) {
      waterAvailability = "moderate"
      if (loc.region === "Northern" || loc.region === "Northeastern" || loc.region === "Central") {
        climateScore = 92
        regionalFit = "highly_suitable"
        bestMonthsTh = "ต้นฤดูฝน (พ.ค. - มิ.ย.) หรือ ข้าวโพดหลังนา (พ.ย. - ธ.ค.)"
        regionalReasonTh = `${loc.regionTh} เป็นแหล่งเพาะปลูกข้าวโพดหลัก มีแสงแดดเพียงพอและระบายน้ำได้ดี`
      } else {
        climateScore = 75
        regionalFit = "moderately_suitable"
      }
    }
    // 3. Cassava & Sugarcane (มันสำปะหลัง / อ้อย)
    else if (name.includes("cassava") || name.includes("sugarcane")) {
      waterAvailability = "low"
      if (loc.region === "Northeastern" || loc.region === "Western" || loc.region === "Central") {
        climateScore = 95
        regionalFit = "highly_suitable"
        bestMonthsTh = "มีนาคม - พฤษภาคม (ต้นฝน) หรือ ตุลาคม - พฤศจิกายน (ปลายฝน)"
        regionalReasonTh = `ดินร่วนปนทรายและภูมิอากาศของ${loc.nameTh} ทนแล้งได้ดีเยี่ยม เหมาะสมกับการสะสมแป้งและน้ำตาล`
      }
    }
    // 4. Durian / Fruits (ทุเรียน / มังคุด / ยางพารา)
    else if (name.includes("durian") || name.includes("rubber") || name.includes("palm")) {
      if (loc.region === "Eastern" || loc.region === "Southern") {
        climateScore = 95
        regionalFit = "highly_suitable"
        waterAvailability = "high"
        bestMonthsTh = "พฤษภาคม - สิงหาคม"
        regionalReasonTh = `${loc.regionTh} มีปริมาณฝนชุกและความชื้นในอากาศสูง สอดคล้องกับพืชเศรษฐกิจเขตร้อนชื้น`
      } else {
        climateScore = 60
        regionalFit = "poorly_suitable"
        regionalFitLabelTh = "ต้องมีระบบน้ำและปรับสภาพแวดล้อมเป็นพิเศษ"
        regionalReasonTh = `อากาศใน${loc.regionTh} อาจแห้งแล้งเกินไป ต้องมีแหล่งน้ำสปริงเกอร์สม่ำเสมอตลอดปี`
      }
    }
    // 5. Cold-season vegetables / Tomato (มะเขือเทศ / กะหล่ำปลี / ผักเมืองหนาว)
    else if (name.includes("tomato") || crop.category.toLowerCase().includes("vegetable")) {
      if (season === "winter" || loc.region === "Northern") {
        climateScore = 94
        regionalFit = "highly_suitable"
        bestMonthsTh = "ตุลาคม - กุมภาพันธ์ (ผลผลิตสมบูรณ์ ผิวสวย ไม่แตก)"
        regionalReasonTh = `อากาศเย็นของฤดูหนาวช่วยให้ผักสะสมสารอาหาร ลดการเกิดโรคราและแมลงศัตรูพืช`
      } else if (season === "summer") {
        climateScore = 65
        regionalFit = "moderately_suitable"
        regionalReasonTh = "อากาศร้อนจัดอาจทำให้ดอกฝ่อและติดผลน้อย ควรพรางแสงด้วยซาแรน 50%"
      }
    }

    return {
      cropId: crop.id,
      cropName: crop.name,
      cropNameTh: crop.nameTh,
      province: loc.nameTh,
      region: loc.region,
      regionTh: loc.regionTh,
      season,
      seasonLabelTh,
      waterAvailability,
      climateScore,
      regionalFit,
      regionalFitLabelTh,
      regionalReasonTh,
      bestPlantingMonthsTh: bestMonthsTh,
    }
  }
}

export const weatherService = new WeatherService()
