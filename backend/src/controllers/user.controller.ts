import { userService } from "../services/user.service"
import { successResponse, errorResponse } from "../utils/response"

export class UserController {
  async getProfile(userId: string) {
    try {
      const user = await userService.getProfile(userId)
      return successResponse(user, "User profile retrieved successfully")
    } catch (err: any) {
      return errorResponse(err.message || "Failed to retrieve profile", [err])
    }
  }

  async updateProfile(userId: string, data: { name?: string; image?: string }) {
    try {
      const updated = await userService.updateProfile(userId, data)
      return successResponse(updated, "User profile updated successfully")
    } catch (err: any) {
      return errorResponse(err.message || "Failed to update profile", [err])
    }
  }
}

export const userController = new UserController()
