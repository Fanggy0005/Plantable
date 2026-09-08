import "dotenv/config"
import { Elysia } from "elysia"
import { cors } from "@elysiajs/cors"
import { auth } from "./lib/auth"
import { analysisRoutes } from "./routes/analysis.routes"
import { cropRoutes } from "./routes/crop.routes"
import { userRoutes } from "./routes/user.routes"
import { favoriteRoutes } from "./routes/favorite.routes"
import { soilImprovementRoutes } from "./routes/soil-improvement.routes"
import { uploadRoutes } from "./routes/upload.routes"
import { environmentRoutes } from "./routes/environment.routes"
import { economicsRoutes } from "./routes/economics.routes"
import { analyticsRoutes } from "./routes/analytics.routes"

const app = new Elysia()
  .use(cors({
    origin: "http://localhost:3000",
    credentials: true,
  }))
  .all("/api/auth/*", async (context) => {
    return auth.handler(context.request)
  })
  .use(analysisRoutes)
  .use(cropRoutes)
  .use(userRoutes)
  .use(favoriteRoutes)
  .use(soilImprovementRoutes)
  .use(uploadRoutes)
  .use(environmentRoutes)
  .use(economicsRoutes)
  .use(analyticsRoutes)
  .get("/health", () => ({ status: "ok" }))
  .listen(3001)

console.log("Backend running at http://localhost:3001")
