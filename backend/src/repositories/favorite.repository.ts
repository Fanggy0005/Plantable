import { prisma } from "../config/db"

export class FavoriteRepository {
  async findUserFavorites(userId: string) {
    const favorites = await prisma.favoriteCrop.findMany({
      where: { userId },
      include: {
        crop: {
          include: {
            requirement: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    return favorites.map((f) => f.crop)
  }

  async addFavorite(userId: string, cropId: string) {
    return prisma.favoriteCrop.upsert({
      where: {
        userId_cropId: {
          userId,
          cropId,
        },
      },
      update: {},
      create: {
        userId,
        cropId,
      },
      include: {
        crop: true,
      },
    })
  }

  async removeFavorite(userId: string, cropId: string) {
    return prisma.favoriteCrop.deleteMany({
      where: {
        userId,
        cropId,
      },
    })
  }

  async isFavorite(userId: string, cropId: string): Promise<boolean> {
    const count = await prisma.favoriteCrop.count({
      where: {
        userId,
        cropId,
      },
    })
    return count > 0
  }
}

export const favoriteRepository = new FavoriteRepository()
