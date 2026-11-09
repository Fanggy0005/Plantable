import { Elysia } from "elysia"
import { requireUserId } from "../lib/session"
import { analysisService } from "../services/analysis.service"
import { successResponse } from "../utils/response"
import { IdParamSchema, SoilPlanQuerySchema } from "../validators/request.schema"

export const analysisRoutes = new Elysia({ prefix: "/api/analyses" })
  .get(
    "/:id",
    async ({ request, params }) => successResponse(await analysisService.get(await requireUserId(request), params.id)),
    { params: IdParamSchema }
  )
  .delete(
    "/:id",
    async ({ request, params }) => {
      await analysisService.delete(await requireUserId(request), params.id)
      return successResponse(null, "Soil analysis deleted")
    },
    { params: IdParamSchema }
  )
  .get(
    "/:id/soil-plan",
    async ({ request, params, query }) =>
      successResponse(await analysisService.getSoilPlan(await requireUserId(request), params.id, query)),
    { params: IdParamSchema, query: SoilPlanQuerySchema }
  )
