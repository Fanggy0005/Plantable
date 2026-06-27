import { Elysia } from "elysia"
import { cors } from "@elysiajs/cors"

const app = new Elysia()
  .use(cors())
  .get("/health", () => ({ status: "ok" }))
  .listen(3001)

console.log("Backend running at http://localhost:3001")
