import { Elysia, t } from "elysia"
import { economicsController } from "../controllers/economics.controller"

export const economicsRoutes = new Elysia({ prefix: "/api" })
  .post(
    "/economics/calculate",
    async ({ body }) => {
      const { cropId, landAreaRai, soil } = body
      return economicsController.calculateForCrop(cropId, landAreaRai, soil)
    },
    {
      body: t.Object({
        cropId: t.String(),
        landAreaRai: t.Optional(t.Numeric({ minimum: 0.1 })),
        soil: t.Optional(
          t.Object({
            nitrogen: t.Numeric({ minimum: 0 }),
            phosphorus: t.Numeric({ minimum: 0 }),
            potassium: t.Numeric({ minimum: 0 }),
            ph: t.Numeric({ minimum: 0, maximum: 14 }),
            organicMatter: t.Optional(t.Nullable(t.Numeric())),
            moisture: t.Optional(t.Nullable(t.Numeric())),
          })
        ),
      }),
    }
  )
  .get(
    "/crops/:id/economics",
    async ({ params: { id }, query: { landAreaRai } }) => {
      const area = landAreaRai ? Number(landAreaRai) : 1
      return economicsController.calculateForCrop(id, area)
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      query: t.Object({
        landAreaRai: t.Optional(t.String()),
      }),
    }
  )
  .get(
    "/analyses/:id/economics",
    async ({ params: { id }, query: { cropId, landAreaRai } }) => {
      const area = landAreaRai ? Number(landAreaRai) : 1
      return economicsController.calculateForAnalysis(id, cropId, area)
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      query: t.Object({
        cropId: t.Optional(t.String()),
        landAreaRai: t.Optional(t.String()),
      }),
    }
  )
  .get("/economics/benchmarks", async () => {
    return economicsController.getBenchmarks()
  })
