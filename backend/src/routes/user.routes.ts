import { Elysia, t } from "elysia"
import { userController } from "../controllers/user.controller"
import { auth } from "../lib/auth"
import { errorResponse } from "../utils/response"

export const userRoutes = new Elysia({ prefix: "/api/users" })
  .get(
    "/me",
    async ({ request, set }) => {
      const session = await auth.api.getSession({ headers: request.headers })
      if (!session?.user?.id) {
        set.status = 401
        return errorResponse("Unauthorized: Please log in to view your profile")
      }
      return userController.getProfile(session.user.id)
    }
  )
  .patch(
    "/me",
    async ({ request, body, set }) => {
      const session = await auth.api.getSession({ headers: request.headers })
      if (!session?.user?.id) {
        set.status = 401
        return errorResponse("Unauthorized: Please log in to update your profile")
      }
      return userController.updateProfile(session.user.id, body)
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        image: t.Optional(t.String()),
      }),
    }
  )
