import { Elysia, t } from "elysia"
import { environmentController } from "../controllers/environment.controller"

export const environmentRoutes = new Elysia({ prefix: "/api/environment" })
  .get(
    "/weather",
    async ({ query: { province } }) => {
      return environmentController.getWeather(province)
    },
    {
      query: t.Object({
        province: t.Optional(t.String()),
      }),
    }
  )
  .get(
    "/regional-suitability",
    async ({ query: { cropId, province, season } }) => {
      return environmentController.getRegionalSuitability(cropId, province, season)
    },
    {
      query: t.Object({
        cropId: t.String(),
        province: t.Optional(t.String()),
        season: t.Optional(t.String()),
      }),
    }
  )
  .get("/provinces", async () => {
    return environmentController.getProvinces()
  })
