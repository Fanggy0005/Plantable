import { afterEach, describe, expect, it, spyOn } from "bun:test"
import { Elysia } from "elysia"
import { environmentRoutes } from "../src/routes/environment.routes"
import {
  conditionFromWeatherCode,
  evaluateAgriculturalAlerts,
  getCurrentSeason,
  getSeasonFromType,
  weatherService,
} from "../src/services/weather.service"
import type { WeatherData, WeatherForecastDay } from "../src/types"

const app = new Elysia().use(environmentRoutes)

function day(date: string, overrides: Partial<WeatherForecastDay> = {}): WeatherForecastDay {
  return { date, tempMax: 33, tempMin: 24, precipitationSum: 0, conditionTh: "", condition: "", ...overrides }
}

function openMeteoBody(precipitationSum: number[], tempMax: number[]) {
  const time = precipitationSum.map((_, i) => `2026-11-${String(10 + i).padStart(2, "0")}`)
  return {
    current: {
      time: "2026-11-09T14:00",
      temperature_2m: 31.24,
      relative_humidity_2m: 64.4,
      precipitation: 0,
      weather_code: 2,
      wind_speed_10m: 9.81,
    },
    daily: {
      time,
      weather_code: time.map(() => 61),
      temperature_2m_max: tempMax,
      temperature_2m_min: time.map(() => 23),
      precipitation_sum: precipitationSum,
    },
  }
}

function mockFetch(impl: () => Promise<Response>) {
  return spyOn(globalThis, "fetch").mockImplementation((() => impl()) as unknown as typeof fetch)
}

let fetchSpy: ReturnType<typeof mockFetch> | null = null
afterEach(() => {
  fetchSpy?.mockRestore()
  fetchSpy = null
})

describe("seasons and provinces", () => {
  it("determines seasons and labels", () => {
    expect(getSeasonFromType("rainy").labelTh).toContain("ฤดูฝน")
    expect(getSeasonFromType("winter").labelTh).toContain("ฤดูหนาว")
    expect(getSeasonFromType("summer").labelTh).toContain("ฤดูร้อน")
    expect(["rainy", "winter", "summer"]).toContain(getCurrentSeason().season)
  })

  it("resolves provinces by key, Thai name or English name, with a default", () => {
    expect(weatherService.resolveLocation("nakhon_ratchasima").region).toBe("Northeastern")
    expect(weatherService.resolveLocation("เชียงใหม่").region).toBe("Northern")
    expect(weatherService.resolveLocation("Rayong").region).toBe("Eastern")
    expect(weatherService.resolveLocation("Atlantis").name).toBe("Nakhon Ratchasima")
  })

  it("maps WMO weather codes to conditions", () => {
    expect(conditionFromWeatherCode(0).condition).toBe("Clear sky")
    expect(conditionFromWeatherCode(63).condition).toBe("Rain")
    expect(conditionFromWeatherCode(95).condition).toBe("Thunderstorm")
    expect(conditionFromWeatherCode(-1).condition).toBe("Unknown")
  })
})

describe("evaluateAgriculturalAlerts", () => {
  it("returns no alerts, and no 'favorable' message, when nothing needs attention", () => {
    expect(evaluateAgriculturalAlerts([day("d1", { precipitationSum: 5 })], "rainy")).toEqual([])
  })

  it("alerts on heavy rain using the daily forecast total (TMD ≥ 35.1 mm)", () => {
    expect(evaluateAgriculturalAlerts([day("d1", { precipitationSum: 35 })], "rainy")).toEqual([])

    const [alert] = evaluateAgriculturalAlerts([day("d1"), day("d2", { precipitationSum: 42.5 })], "rainy")
    expect(alert).toMatchObject({ type: "heavy_rain", severity: "medium", date: "d2" })
    expect(alert?.messageTh).toContain("42.5")
  })

  it("raises very heavy rain (≥ 90.1 mm) to high severity", () => {
    const [alert] = evaluateAgriculturalAlerts([day("d1", { precipitationSum: 120 })], "rainy")
    expect(alert).toMatchObject({ type: "heavy_rain", severity: "high" })
  })

  it("alerts on extreme heat when the forecast maximum reaches 40 °C", () => {
    expect(evaluateAgriculturalAlerts([day("d1", { tempMax: 39, precipitationSum: 3 })], "summer")).toEqual([])
    const alerts = evaluateAgriculturalAlerts([day("d1", { tempMax: 41, precipitationSum: 3 })], "summer")
    expect(alerts.map((a) => a.type)).toEqual(["extreme_heat"])
  })

  it("flags a dry spell only in the hot season with no rain in the forecast", () => {
    const dry = [day("d1"), day("d2"), day("d3")]
    expect(evaluateAgriculturalAlerts(dry, "summer").map((a) => a.type)).toEqual(["drought"])
    expect(evaluateAgriculturalAlerts(dry, "winter")).toEqual([])
    expect(evaluateAgriculturalAlerts([], "summer")).toEqual([])
  })
})

describe("getWeatherData", () => {
  it("returns live data with forecast-based alerts when Open-Meteo responds", async () => {
    fetchSpy = mockFetch(async () => Response.json(openMeteoBody([0, 50, 2, 0, 0], [33, 34, 41, 33, 32])))

    const weather = await weatherService.getWeatherData("chiang_mai")
    expect(weather.source).toBe("live")
    expect(weather.observedAt).toBe("2026-11-09T14:00")
    expect(weather.temperature).toBe(31.2)
    expect(weather.condition).toBe("Partly cloudy to overcast")
    expect(weather.forecast).toHaveLength(5)
    expect(weather.forecast[1]).toMatchObject({ precipitationSum: 50, condition: "Rain" })
    expect(weather.agriculturalAlerts.map((a) => a.type).sort()).toEqual(["extreme_heat", "heavy_rain"])

    const url = String(fetchSpy.mock.calls[0]?.[0])
    expect(url).toContain("forecast_days=5")
    expect(url).toContain("precipitation_sum")
  })

  for (const [name, impl] of [
    ["the request fails", async () => Promise.reject(new Error("network down"))],
    ["the API returns an error", async () => new Response("bad", { status: 503 })],
    ["the response is malformed", async () => Response.json({ current: {} })],
  ] as const) {
    it(`falls back to labelled seasonal values with no forecast or alerts when ${name}`, async () => {
      fetchSpy = mockFetch(impl)

      const weather = await weatherService.getWeatherData("khon_kaen")
      expect(weather.source).toBe("climatology")
      expect(weather.observedAt).toBeNull()
      expect(weather.precipitation).toBeNull()
      expect(weather.windSpeed).toBeNull()
      expect(weather.forecast).toEqual([])
      expect(weather.agriculturalAlerts).toEqual([])
      expect(weather.region).toBe("Northeastern")
    })
  }
})

describe("environment endpoints", () => {
  it("GET /api/environment/provinces lists provinces and the current season", async () => {
    const res = await app.handle(new Request("http://localhost/api/environment/provinces"))
    expect(res.status).toBe(200)
    const body = (await res.json()) as { data: { provinces: unknown[]; currentSeason: unknown } }
    expect(body.data.provinces.length).toBeGreaterThanOrEqual(10)
    expect(body.data.currentSeason).toBeDefined()
  })

  it("GET /api/environment/weather reports its data source", async () => {
    fetchSpy = mockFetch(async () => Promise.reject(new Error("offline")))
    const res = await app.handle(new Request("http://localhost/api/environment/weather?province=Khon%20Kaen"))
    expect(res.status).toBe(200)
    const body = (await res.json()) as { data: WeatherData }
    expect(body.data.source).toBe("climatology")
    expect(body.data.region).toBe("Northeastern")
  })
})
