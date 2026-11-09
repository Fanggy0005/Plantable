import { Elysia } from "elysia"
import { requireUserId } from "../lib/session"
import { analysisService } from "../services/analysis.service"
import { plotService } from "../services/plot.service"
import { successResponse } from "../utils/response"
import {
  AnalysisListQuerySchema,
  CreateAnalysisSchema,
  CreatePlotSchema,
  IdParamSchema,
  UpdatePlotSchema,
} from "../validators/request.schema"

export const plotRoutes = new Elysia({ prefix: "/api/plots" })
  .get("/", async ({ request }) => successResponse(await plotService.list(await requireUserId(request))))
  .post(
    "/",
    async ({ request, body, set }) => {
      const plot = await plotService.create(await requireUserId(request), body)
      set.status = 201
      return successResponse(plot, "Plot created")
    },
    { body: CreatePlotSchema }
  )
  .get(
    "/:id",
    async ({ request, params }) => successResponse(await plotService.get(await requireUserId(request), params.id)),
    { params: IdParamSchema }
  )
  .patch(
    "/:id",
    async ({ request, params, body }) =>
      successResponse(await plotService.update(await requireUserId(request), params.id, body), "Plot updated"),
    { params: IdParamSchema, body: UpdatePlotSchema }
  )
  .delete(
    "/:id",
    async ({ request, params }) => {
      await plotService.delete(await requireUserId(request), params.id)
      return successResponse(null, "Plot deleted")
    },
    { params: IdParamSchema }
  )
  .get(
    "/:id/analyses",
    async ({ request, params, query }) =>
      successResponse(await analysisService.listByPlot(await requireUserId(request), params.id, query.limit)),
    { params: IdParamSchema, query: AnalysisListQuerySchema }
  )
  .post(
    "/:id/analyses",
    async ({ request, params, body, set }) => {
      const analysis = await analysisService.create(await requireUserId(request), params.id, body)
      set.status = 201
      return successResponse(analysis, "Soil analysis saved")
    },
    { params: IdParamSchema, body: CreateAnalysisSchema }
  )
