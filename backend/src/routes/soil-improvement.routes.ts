import { Elysia, t } from "elysia"
import { soilImprovementController } from "../controllers/soil-improvement.controller"

export const soilImprovementRoutes = new Elysia({ prefix: "/api" })
  .post(
    "/soil-improvement",
    async ({ body }) => {
      const { cropId, ...soil } = body
      return soilImprovementController.getPlanForSoil(soil, cropId)
    },
    {
      body: t.Object({
        nitrogen: t.Numeric({ minimum: 0 }),
        phosphorus: t.Numeric({ minimum: 0 }),
        potassium: t.Numeric({ minimum: 0 }),
        ph: t.Numeric({ minimum: 0, maximum: 14 }),
        organicMatter: t.Optional(t.Nullable(t.Numeric())),
        moisture: t.Optional(t.Nullable(t.Numeric())),
        notes: t.Optional(t.Nullable(t.String())),
        cropId: t.Optional(t.String()),
      }),
    }
  )
  .get(
    "/analyses/:id/soil-improvement",
    async ({ params: { id }, query: { cropId } }) => {
      return soilImprovementController.getPlanForAnalysis(id, cropId)
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      query: t.Object({
        cropId: t.Optional(t.String()),
      }),
    }
  )
