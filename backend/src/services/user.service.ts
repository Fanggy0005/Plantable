import { userRepository } from "../repositories/user.repository"

export class UserService {
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId)
    if (!user) {
      throw new Error("User not found")
    }
    return user
  }

  async updateProfile(userId: string, data: { name?: string; image?: string }) {
    return userRepository.update(userId, data)
  }
}

export const userService = new UserService()
