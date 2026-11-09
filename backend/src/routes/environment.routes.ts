import { Elysia, t } from "elysia"
import { THAI_PROVINCES, getCurrentSeason, weatherService } from "../services/weather.service"
import { successResponse } from "../utils/response"

export const environmentRoutes = new Elysia({ prefix: "/api/environment" })
  .get("/weather", async ({ query }) => successResponse(await weatherService.getWeatherData(query.province)), {
    query: t.Object({ province: t.Optional(t.String({ maxLength: 100 })) }),
  })
  .get("/provinces", () => {
    const provinces = Object.entries(THAI_PROVINCES).map(([key, loc]) => ({
      key,
      name: loc.name,
      nameTh: loc.nameTh,
      region: loc.region,
      regionTh: loc.regionTh,
      lat: loc.lat,
      lon: loc.lon,
    }))
    return successResponse({ provinces, currentSeason: getCurrentSeason() })
  })
