import { Elysia } from "elysia"
import { requireUserId } from "../lib/session"
import { userService } from "../services/user.service"
import { successResponse } from "../utils/response"
import { UpdateProfileSchema } from "../validators/request.schema"

export const userRoutes = new Elysia({ prefix: "/api/users" })
  .get("/me", async ({ request }) => successResponse(await userService.getProfile(await requireUserId(request))))
  .patch(
    "/me",
    async ({ request, body }) =>
      successResponse(await userService.updateProfile(await requireUserId(request), body), "Profile updated"),
    { body: UpdateProfileSchema }
  )
