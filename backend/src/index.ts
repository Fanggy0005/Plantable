import "dotenv/config"
import { Elysia } from "elysia"
import { cors } from "@elysiajs/cors"
import { auth } from "./lib/auth"
import { errorHandler } from "./lib/error-handler"
import { analysisRoutes } from "./routes/analysis.routes"
import { cropRoutes } from "./routes/crop.routes"
import { environmentRoutes } from "./routes/environment.routes"
import { plotRoutes } from "./routes/plot.routes"
import { recommendationRoutes } from "./routes/recommendation.routes"
import { userRoutes } from "./routes/user.routes"

const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:3000"
const PORT = Number(process.env.PORT ?? 3001)

// normalize: false makes unknown body fields a 422 instead of silently dropping them
export const app = new Elysia({ normalize: false })
  .use(errorHandler)
  .use(cors({ origin: FRONTEND_URL, credentials: true }))
  .all("/api/auth/*", ({ request }) => auth.handler(request))
  .use(cropRoutes)
  .use(recommendationRoutes)
  .use(plotRoutes)
  .use(analysisRoutes)
  .use(userRoutes)
  .use(environmentRoutes)
  .get("/health", () => ({ status: "ok" }))

if (import.meta.main) {
  app.listen(PORT)
  console.log(`Backend running at http://localhost:${PORT}`)
}
