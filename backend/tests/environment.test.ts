import { describe, expect, it } from "bun:test"
import { Elysia } from "elysia"
import { environmentRoutes } from "../src/routes/environment.routes"
import {
  weatherService,
  getCurrentSeason,
  getSeasonFromType,
  THAI_PROVINCES,
} from "../src/services/weather.service"

const app = new Elysia()
  .use(environmentRoutes)

describe("Environment (weather) Test Suite", () => {
  // ==========================================
  // 1. Pure Unit Tests: Weather & Environment
  // ==========================================
  describe("Weather & Environment Service - Pure Logic", () => {
    it("should accurately determine seasons and labels", () => {
      const rainy = getSeasonFromType("rainy")
      expect(rainy.season).toBe("rainy")
      expect(rainy.labelTh).toContain("ฤดูฝน")

      const winter = getSeasonFromType("winter")
      expect(winter.season).toBe("winter")
      expect(winter.labelTh).toContain("ฤดูหนาว")

      const summer = getSeasonFromType("summer")
      expect(summer.season).toBe("summer")
      expect(summer.labelTh).toContain("ฤดูร้อน")

      const current = getCurrentSeason()
      expect(["rainy", "winter", "summer"]).toContain(current.season)
      expect(current.labelTh.length).toBeGreaterThan(5)
    })

    it("should resolve province locations correctly with fallback to default", () => {
      const korat = weatherService.resolveLocation("nakhon_ratchasima")
      expect(korat.name).toBe("Nakhon Ratchasima")
      expect(korat.region).toBe("Northeastern")

      const chiangMai = weatherService.resolveLocation("เชียงใหม่")
      expect(chiangMai.region).toBe("Northern")

      const rayong = weatherService.resolveLocation("Rayong")
      expect(rayong.region).toBe("Eastern")

      const unknown = weatherService.resolveLocation("Atlantis")
      expect(unknown.name).toBe("Nakhon Ratchasima")
    })

    it("should generate agricultural alerts for extreme weather conditions", () => {
      // Heavy rain test
      const rainAlerts = weatherService.evaluateAgriculturalAlerts(28, 85, 35, "rainy")
      expect(rainAlerts.some((a) => a.type === "heavy_rain")).toBe(true)
      expect(rainAlerts.find((a) => a.type === "heavy_rain")?.severity).toBe("high")

      // Extreme heat test
      const heatAlerts = weatherService.evaluateAgriculturalAlerts(39, 45, 0, "summer")
      expect(heatAlerts.some((a) => a.type === "extreme_heat")).toBe(true)

      // Summer drought test
      const droughtAlerts = weatherService.evaluateAgriculturalAlerts(35, 40, 0, "summer")
      expect(droughtAlerts.some((a) => a.type === "drought")).toBe(true)

      // Favorable weather test
      const favorableAlerts = weatherService.evaluateAgriculturalAlerts(28, 65, 2, "winter")
      expect(favorableAlerts.some((a) => a.type === "favorable")).toBe(true)
      expect(favorableAlerts[0].severity).toBe("low")
    })


    it("should fetch weather data with forecast and province metadata", async () => {
      const weather = await weatherService.getWeatherData("chiang_mai")
      expect(weather.province).toBeDefined()
      expect(weather.region).toBe("Northern")
      expect(weather.temperature).toBeGreaterThan(0)
      expect(weather.forecast.length).toBeGreaterThanOrEqual(5)
      expect(weather.agriculturalAlerts.length).toBeGreaterThanOrEqual(1)
    })
  })

  // ==========================================
  // 2. HTTP API Endpoint Integration Tests
  // ==========================================
  describe("Environment HTTP endpoints", () => {
    it("GET /api/environment/provinces returns 6 Thai agricultural regions", async () => {
      const res = await app.handle(
        new Request("http://localhost:3001/api/environment/provinces")
      )
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(body.data.provinces.length).toBeGreaterThanOrEqual(10)
      expect(body.data.currentSeason).toBeDefined()
    })

    it("GET /api/environment/weather returns real-time weather & alerts", async () => {
      const res = await app.handle(
        new Request("http://localhost:3001/api/environment/weather?province=Khon%20Kaen")
      )
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(body.data.region).toBe("Northeastern")
      expect(body.data.temperature).toBeDefined()
      expect(Array.isArray(body.data.agriculturalAlerts)).toBe(true)
    })
  })
})

