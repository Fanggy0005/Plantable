import { prisma } from "../config/db"

const profileSelect = {
  id: true,
  email: true,
  name: true,
  image: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { plots: true } },
} as const

export class UserRepository {
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id }, select: profileSelect })
  }

  async update(id: string, data: { name: string }) {
    return prisma.user.update({ where: { id }, data, select: profileSelect })
  }
}

export const userRepository = new UserRepository()
