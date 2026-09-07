import { Elysia, t } from "elysia"
import { favoriteController } from "../controllers/favorite.controller"
import { auth } from "../lib/auth"
import { errorResponse } from "../utils/response"

export const favoriteRoutes = new Elysia({ prefix: "/api/favorites" })
  .get(
    "/",
    async ({ request, set }) => {
      const session = await auth.api.getSession({ headers: request.headers })
      if (!session?.user?.id) {
        set.status = 401
        return errorResponse("Unauthorized: Please log in to view favorite crops")
      }
      return favoriteController.getFavorites(session.user.id)
    }
  )
  .post(
    "/",
    async ({ request, body, set }) => {
      const session = await auth.api.getSession({ headers: request.headers })
      if (!session?.user?.id) {
        set.status = 401
        return errorResponse("Unauthorized: Please log in to add favorite crop")
      }
      return favoriteController.addFavorite(session.user.id, body.cropId)
    },
    {
      body: t.Object({
        cropId: t.String(),
      }),
    }
  )
  .delete(
    "/:cropId",
    async ({ request, params: { cropId }, set }) => {
      const session = await auth.api.getSession({ headers: request.headers })
      if (!session?.user?.id) {
        set.status = 401
        return errorResponse("Unauthorized: Please log in to remove favorite crop")
      }
      return favoriteController.removeFavorite(session.user.id, cropId)
    },
    {
      params: t.Object({
        cropId: t.String(),
      }),
    }
  )
