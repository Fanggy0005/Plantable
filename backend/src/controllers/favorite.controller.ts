import { favoriteService } from "../services/favorite.service"
import { successResponse, errorFromCaught } from "../utils/response"

export class FavoriteController {
  async getFavorites(userId: string) {
    try {
      const favorites = await favoriteService.getUserFavorites(userId)
      return successResponse(favorites, "Favorites retrieved successfully")
    } catch (err) {
      return errorFromCaught(err, "Failed to retrieve favorites")
    }
  }

  async addFavorite(userId: string, cropId: string) {
    try {
      const favorite = await favoriteService.addFavorite(userId, cropId)
      return successResponse(favorite, "Crop added to favorites")
    } catch (err) {
      return errorFromCaught(err, "Failed to add favorite")
    }
  }

  async removeFavorite(userId: string, cropId: string) {
    try {
      await favoriteService.removeFavorite(userId, cropId)
      return successResponse({ success: true }, "Crop removed from favorites")
    } catch (err) {
      return errorFromCaught(err, "Failed to remove favorite")
    }
  }
}

export const favoriteController = new FavoriteController()
