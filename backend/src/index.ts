import { Elysia } from "elysia"
import { cors } from "@elysiajs/cors"
import { auth } from "./lib/auth"

const app = new Elysia()
  .use(cors({
    origin: "http://localhost:3000",
    credentials: true,
  }))
  .all("/api/auth/*", async (context) => {
    return auth.handler(context.request)
  })
  .get("/health", () => ({ status: "ok" }))
  .listen(3001)

console.log("Backend running at http://localhost:3001")
