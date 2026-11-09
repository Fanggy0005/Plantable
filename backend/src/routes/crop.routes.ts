import { Elysia } from "elysia"
import { cropService } from "../services/crop.service"
import { successResponse } from "../utils/response"
import { CropQuerySchema, IdParamSchema } from "../validators/request.schema"

export const cropRoutes = new Elysia({ prefix: "/api/crops" })
  .get("/", async ({ query }) => successResponse(await cropService.list(query)), {
    query: CropQuerySchema,
  })
  .get("/:id", async ({ params }) => successResponse(await cropService.get(params.id)), {
    params: IdParamSchema,
  })
