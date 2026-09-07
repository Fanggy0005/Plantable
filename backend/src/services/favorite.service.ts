import { favoriteRepository } from "../repositories/favorite.repository"
import { cropRepository } from "../repositories/crop.repository"

export class FavoriteService {
  async getUserFavorites(userId: string) {
    return favoriteRepository.findUserFavorites(userId)
  }

  async addFavorite(userId: string, cropId: string) {
    const crop = await cropRepository.findById(cropId)
    if (!crop) {
      throw new Error("Crop not found")
    }
    return favoriteRepository.addFavorite(userId, cropId)
  }

  async removeFavorite(userId: string, cropId: string) {
    return favoriteRepository.removeFavorite(userId, cropId)
  }
}

export const favoriteService = new FavoriteService()
