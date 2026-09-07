import { favoriteService } from "../services/favorite.service"
import { successResponse, errorResponse } from "../utils/response"

export class FavoriteController {
  async getFavorites(userId: string) {
    try {
      const favorites = await favoriteService.getUserFavorites(userId)
      return successResponse(favorites, "Favorites retrieved successfully")
    } catch (err: any) {
      return errorResponse(err.message || "Failed to retrieve favorites", [err])
    }
  }

  async addFavorite(userId: string, cropId: string) {
    try {
      const favorite = await favoriteService.addFavorite(userId, cropId)
      return successResponse(favorite, "Crop added to favorites")
    } catch (err: any) {
      return errorResponse(err.message || "Failed to add favorite", [err])
    }
  }

  async removeFavorite(userId: string, cropId: string) {
    try {
      await favoriteService.removeFavorite(userId, cropId)
      return successResponse({ success: true }, "Crop removed from favorites")
    } catch (err: any) {
      return errorResponse(err.message || "Failed to remove favorite", [err])
    }
  }
}

export const favoriteController = new FavoriteController()
