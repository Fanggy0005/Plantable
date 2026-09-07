import { prisma } from "../config/db"

export class UserRepository {
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            analyses: true,
            favorites: true,
          },
        },
      },
    })
  }

  async update(id: string, data: { name?: string; image?: string }) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        updatedAt: true,
      },
    })
  }
}

export const userRepository = new UserRepository()
