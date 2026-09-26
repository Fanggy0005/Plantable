import { userService } from "../services/user.service"
import { successResponse, errorFromCaught } from "../utils/response"

export class UserController {
  async getProfile(userId: string) {
    try {
      const user = await userService.getProfile(userId)
      return successResponse(user, "User profile retrieved successfully")
    } catch (err) {
      return errorFromCaught(err, "Failed to retrieve profile")
    }
  }

  async updateProfile(userId: string, data: { name?: string; image?: string }) {
    try {
      const updated = await userService.updateProfile(userId, data)
      return successResponse(updated, "User profile updated successfully")
    } catch (err) {
      return errorFromCaught(err, "Failed to update profile")
    }
  }
}

export const userController = new UserController()
