import { notFound } from "../lib/http-error"
import { userRepository } from "../repositories/user.repository"

export class UserService {
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId)
    if (!user) throw notFound("User")
    return user
  }

  async updateProfile(userId: string, data: { name: string }) {
    return userRepository.update(userId, data)
  }
}

export const userService = new UserService()
