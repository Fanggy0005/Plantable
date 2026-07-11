import Elysia, { t } from "elysia"
import { recommend } from "../services/recommendation"

export const analysisRoutes = new Elysia({ prefix: "/api/analysis" })
  .post(
    "/recommend",
    ({ body }) => {
      const result = recommend(body)
      return result
    },
    {
      body: t.Object({
        nitrogen: t.Number(),
        phosphorus: t.Number(),
        potassium: t.Number(),
        ph: t.Number(),
      }),
    }
  )
  