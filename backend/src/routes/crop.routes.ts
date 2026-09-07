import { Elysia, t } from "elysia"
import { cropController } from "../controllers/crop.controller"
import { CropQuerySchema } from "../validators/analysis.schema"

export const cropRoutes = new Elysia({ prefix: "/api/crops" })
  .get(
    "/",
    async ({ query }) => {
      return cropController.getAllCrops(query)
    },
    {
      query: CropQuerySchema,
    }
  )
  .get(
    "/:id",
    async ({ params: { id } }) => {
      return cropController.getCropById(id)
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )
