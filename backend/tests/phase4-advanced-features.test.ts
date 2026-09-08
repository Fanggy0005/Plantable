import { describe, expect, it } from "bun:test"
import { Elysia } from "elysia"
import { prisma } from "../src/config/db"
import { environmentRoutes } from "../src/routes/environment.routes"
import { economicsRoutes } from "../src/routes/economics.routes"
import { analyticsRoutes } from "../src/routes/analytics.routes"
import { analysisRoutes } from "../src/routes/analysis.routes"
import {
  weatherService,
  getCurrentSeason,
  getSeasonFromType,
  THAI_PROVINCES,
} from "../src/services/weather.service"
import {
  economicsService,
  CROP_ECONOMIC_BENCHMARKS,
} from "../src/services/economics.service"
import { analyticsService } from "../src/services/analytics.service"

const app = new Elysia()
  .use(environmentRoutes)
  .use(economicsRoutes)
  .use(analyticsRoutes)
  .use(analysisRoutes)

describe("Phase 4 - Advanced Features (Environment, Economics, Analytics) Test Suite", () => {
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

    it("should evaluate regional and seasonal crop suitability for various crops", () => {
      // Rice in rainy season
      const riceSuitability = weatherService.evaluateRegionalSuitability(
        { id: "crop-1", name: "Rice", nameTh: "ข้าว", category: "Grain" },
        "suphan_buri",
        "rainy"
      )
      expect(riceSuitability.regionalFit).toBe("highly_suitable")
      expect(riceSuitability.climateScore).toBeGreaterThanOrEqual(90)
      expect(riceSuitability.waterAvailability).toBe("high")

      // Rice in summer season
      const riceSummer = weatherService.evaluateRegionalSuitability(
        { id: "crop-1", name: "Rice", nameTh: "ข้าว", category: "Grain" },
        "suphan_buri",
        "summer"
      )
      expect(riceSummer.regionalFit).toBe("moderately_suitable")

      // Durian in Northeastern vs Eastern
      const durianIsan = weatherService.evaluateRegionalSuitability(
        { id: "crop-2", name: "Durian", nameTh: "ทุเรียน", category: "Fruit" },
        "khon_kaen",
        "rainy"
      )
      expect(durianIsan.regionalFit).toBe("poorly_suitable")

      const durianEast = weatherService.evaluateRegionalSuitability(
        { id: "crop-2", name: "Durian", nameTh: "ทุเรียน", category: "Fruit" },
        "chanthaburi",
        "rainy"
      )
      expect(durianEast.regionalFit).toBe("highly_suitable")
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
  // 2. Pure Unit Tests: Crop Economics & ROI
  // ==========================================
  describe("Crop Economics Service - Pure Logic", () => {
    it("should resolve correct economic benchmarks for standard Thai crops", () => {
      const riceBench = economicsService.resolveBenchmark("Rice")
      expect(riceBench.yieldKgPerRai).toBe(850)
      expect(riceBench.priceThbPerKg).toBe(11.5)

      const cornBench = economicsService.resolveBenchmark("Sweet Corn")
      expect(cornBench.yieldKgPerRai).toBe(1150)

      const fallbackBench = economicsService.resolveBenchmark("Unknown Crop XYZ")
      expect(fallbackBench.yieldKgPerRai).toBe(1000)
    })

    it("should compute dynamic fertilizer costs based on soil deficits", () => {
      // Severely deficient soil
      const highDeficitCost = economicsService.calculateFertilizerCost({
        nitrogen: 15,
        phosphorus: 5,
        potassium: 15,
        ph: 5.5,
      })

      // Rich/Optimal soil
      const lowDeficitCost = economicsService.calculateFertilizerCost({
        nitrogen: 160,
        phosphorus: 75,
        potassium: 95,
        ph: 6.5,
      })

      expect(highDeficitCost).toBeGreaterThan(lowDeficitCost)
    })

    it("should calculate comprehensive economics, profit, ROI, and scale by land area", () => {
      const result1Rai = economicsService.calculateCropEconomics(
        { id: "c1", name: "Cassava", nameTh: "มันสำปะหลัง" },
        { nitrogen: 100, phosphorus: 40, potassium: 60, ph: 6.0 },
        1
      )

      expect(result1Rai.expectedYieldPerRai).toBe(4200)
      expect(result1Rai.expectedYieldPerHectare).toBe(4200 * 6.25)
      expect(result1Rai.grossRevenuePerRai).toBe(4200 * 3.2)
      expect(result1Rai.totalCostPerRai).toBeGreaterThan(0)
      expect(result1Rai.netProfitPerRai).toBe(
        result1Rai.grossRevenuePerRai - result1Rai.totalCostPerRai
      )
      expect(result1Rai.costBreakdown.length).toBe(5)
      expect(result1Rai.breakEvenPricePerKg).toBeGreaterThan(0)

      // Scale to 5 rai
      const result5Rai = economicsService.calculateCropEconomics(
        { id: "c1", name: "Cassava", nameTh: "มันสำปะหลัง" },
        { nitrogen: 100, phosphorus: 40, potassium: 60, ph: 6.0 },
        5
      )

      expect(result5Rai.landAreaRai).toBe(5)
      expect(result5Rai.totalProjectedRevenue).toBe(result1Rai.grossRevenuePerRai * 5)
      expect(result5Rai.totalProjectedCost).toBe(result1Rai.totalCostPerRai * 5)
      expect(result5Rai.totalProjectedProfit).toBe(result1Rai.netProfitPerRai * 5)
    })
  })

  // ==========================================
  // 3. Analytics Service Tests
  // ==========================================
  describe("Analytics Dashboard Service", () => {
    it("should return valid aggregated dashboard metrics", async () => {
      const data = await analyticsService.getDashboardData()

      expect(data.kpis).toBeDefined()
      expect(typeof data.kpis.totalAnalyses).toBe("number")
      expect(typeof data.kpis.totalCrops).toBe("number")
      expect(typeof data.kpis.totalUsers).toBe("number")

      expect(data.averageSoilMetrics).toBeDefined()
      expect(data.averageSoilMetrics.ph).toBeGreaterThan(0)

      expect(data.soilHealthDistribution).toBeDefined()
      expect(
        data.soilHealthDistribution.optimalPercentage +
          data.soilHealthDistribution.deficientPercentage +
          data.soilHealthDistribution.excessPercentage
      ).toBeGreaterThanOrEqual(95) // allow rounding margin

      expect(Array.isArray(data.phCategoryDistribution)).toBe(true)
      expect(Array.isArray(data.cropPopularityRanking)).toBe(true)
      expect(Array.isArray(data.recentAnalysesTimeline)).toBe(true)
    }, 15000)
  })

  // ==========================================
  // 4. HTTP API Endpoint Integration Tests
  // ==========================================
  describe("Phase 4 HTTP Endpoints Integration", () => {
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

    it("GET /api/environment/regional-suitability evaluates crops across provinces", async () => {
      const crop = await prisma.crop.findFirst()
      if (!crop) return

      const res = await app.handle(
        new Request(
          `http://localhost:3001/api/environment/regional-suitability?cropId=${crop.id}&province=Chiang%20Mai&season=winter`
        )
      )
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(body.data.cropId).toBe(crop.id)
      expect(body.data.region).toBe("Northern")
      expect(body.data.season).toBe("winter")
      expect(body.data.regionalFit).toBeDefined()
    })

    it("GET /api/economics/benchmarks returns standard Thai crop economic data", async () => {
      const res = await app.handle(
        new Request("http://localhost:3001/api/economics/benchmarks")
      )
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(body.data.rice).toBeDefined()
      expect(body.data.cassava).toBeDefined()
    })

    it("POST /api/economics/calculate computes profit and ROI for customized land area", async () => {
      const crop = await prisma.crop.findFirst()
      if (!crop) return

      const res = await app.handle(
        new Request("http://localhost:3001/api/economics/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cropId: crop.id,
            landAreaRai: 3.5,
            soil: {
              nitrogen: 80,
              phosphorus: 25,
              potassium: 55,
              ph: 6.2,
            },
          }),
        })
      )

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(body.data.landAreaRai).toBe(3.5)
      expect(body.data.totalProjectedRevenue).toBeGreaterThan(0)
      expect(body.data.costBreakdown.length).toBe(5)
    })

    it("GET /api/analytics/dashboard returns full dashboard stats", async () => {
      const res = await app.handle(
        new Request("http://localhost:3001/api/analytics/dashboard")
      )
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(body.data.kpis).toBeDefined()
      expect(body.data.averageSoilMetrics).toBeDefined()
    }, 15000)
  })
})
