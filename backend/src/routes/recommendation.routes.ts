import { Elysia } from "elysia"
import { recommendationService } from "../services/recommendation.service"
import { soilPlanService } from "../services/soil-plan.service"
import { successResponse } from "../utils/response"
import { RecommendationRequestSchema, SoilPlanRequestSchema } from "../validators/request.schema"

// Stateless calculations: used by guests and the what-if simulator. Nothing is stored.
export const recommendationRoutes = new Elysia({ prefix: "/api" })
  .post(
    "/recommendations",
    async ({ body }) => successResponse(await recommendationService.recommend(body.site, body.soil)),
    { body: RecommendationRequestSchema }
  )
  .post("/soil-plans", async ({ body }) => successResponse(await soilPlanService.build(body)), {
    body: SoilPlanRequestSchema,
  })
