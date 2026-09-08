import { Elysia } from "elysia"
import { analyticsController } from "../controllers/analytics.controller"

export const analyticsRoutes = new Elysia({ prefix: "/api/analytics" })
  .get("/dashboard", async () => {
    return analyticsController.getDashboard()
  })
