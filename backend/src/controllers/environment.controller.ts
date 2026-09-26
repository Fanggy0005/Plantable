import { weatherService, THAI_PROVINCES, getCurrentSeason } from "../services/weather.service"
import { cropRepository } from "../repositories/crop.repository"
import { successResponse, errorResponse, errorFromCaught } from "../utils/response"

export class EnvironmentController {
  async getWeather(province?: string) {
    try {
      const data = await weatherService.getWeatherData(province)
      return successResponse(data, "Weather data retrieved successfully")
    } catch (err) {
      return errorFromCaught(err, "Failed to retrieve weather data")
    }
  }

  async getRegionalSuitability(cropId: string, province?: string, season?: string) {
    try {
      const crop = await cropRepository.findById(cropId)
      if (!crop) {
        return errorResponse("Crop not found")
      }

      const suitability = weatherService.evaluateRegionalSuitability(crop, province, season)
      return successResponse(suitability, "Regional crop suitability evaluated successfully")
    } catch (err) {
      return errorFromCaught(err, "Failed to evaluate regional suitability")
    }
  }

  getProvinces() {
    try {
      const currentSeason = getCurrentSeason()
      const provinces = Object.entries(THAI_PROVINCES).map(([key, loc]) => ({
        key,
        name: loc.name,
        nameTh: loc.nameTh,
        region: loc.region,
        regionTh: loc.regionTh,
        lat: loc.lat,
        lon: loc.lon,
      }))
      return successResponse({ provinces, currentSeason }, "Provinces retrieved successfully")
    } catch (err) {
      return errorFromCaught(err, "Failed to retrieve provinces")
    }
  }
}

export const environmentController = new EnvironmentController()
