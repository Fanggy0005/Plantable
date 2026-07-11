import Elysia, { t } from "elysia"
import { recommend } from "../services/recommendation"
import { PrismaClient } from "../generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"
import { auth } from "../lib/auth"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

export const analysisRoutes = new Elysia({ prefix: "/api/analysis" })
  .post(
    "/recommend",
    async ({ body, request }) => {
      const result = recommend(body)

      // เช็ค session — ถ้า login อยู่ให้ save
      const session = await auth.api.getSession({ headers: request.headers })
      if (session?.user?.id) {
        await prisma.analysis.create({
          data: {
            nitrogen: body.nitrogen,
            phosphorus: body.phosphorus,
            potassium: body.potassium,
            ph: body.ph,
            result: JSON.parse(JSON.stringify(result.rankings)),
            userId: session.user.id,
          },
        })
      }

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
  .get(
    "/history",
    async ({ request }) => {
      const session = await auth.api.getSession({ headers: request.headers })
      if (!session?.user?.id) {
        return { error: "Unauthorized" }
      }

      const analyses = await prisma.analysis.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      })

      return analyses
    }
  )
