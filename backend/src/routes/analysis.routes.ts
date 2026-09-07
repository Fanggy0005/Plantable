import { Elysia, t } from "elysia"
import { analysisController } from "../controllers/analysis.controller"
import { SoilInputSchema } from "../validators/analysis.schema"
import { auth } from "../lib/auth"
import { errorResponse } from "../utils/response"

export const analysisRoutes = new Elysia({ prefix: "/api" })
  // RESTful standard endpoints as per docs/api-spec.md
  .post(
    "/analyses",
    async ({ body, request }) => {
      const session = await auth.api.getSession({ headers: request.headers })
      const userId = session?.user?.id
      return analysisController.createAnalysis(body, userId)
    },
    {
      body: SoilInputSchema,
    }
  )
  .get(
    "/analyses/history",
    async ({ request }) => {
      const session = await auth.api.getSession({ headers: request.headers })
      if (!session?.user?.id) {
        return errorResponse("Unauthorized: Please log in to view analysis history")
      }
      return analysisController.getUserHistory(session.user.id)
    }
  )
  .get(
    "/analyses/:id",
    async ({ params: { id } }) => {
      return analysisController.getAnalysisById(id)
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )
  .delete(
    "/analyses/:id",
    async ({ request, params: { id }, set }) => {
      const session = await auth.api.getSession({ headers: request.headers })
      if (!session?.user?.id) {
        set.status = 401
        return errorResponse("Unauthorized: Please log in to delete analysis")
      }
      return analysisController.deleteAnalysis(id, session.user.id)
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )
  .post(
    "/analyses/:id/claim",
    async ({ request, params: { id }, set }) => {
      const session = await auth.api.getSession({ headers: request.headers })
      if (!session?.user?.id) {
        set.status = 401
        return errorResponse("Unauthorized: Please log in to save analysis to your account")
      }
      return analysisController.claimAnalysis(id, session.user.id)
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )
  // Real-time calculation endpoint
  .post(
    "/recommendations",
    async ({ body }) => {
      return analysisController.computeInstantRecommendation(body)
    },
    {
      body: SoilInputSchema,
    }
  )
  // Backward compatibility for existing endpoints
  .post(
    "/analysis/recommend",
    async ({ body, request }) => {
      const session = await auth.api.getSession({ headers: request.headers })
      const userId = session?.user?.id
      const res = await analysisController.createAnalysis(body, userId)
      if (res.success && res.data) {
        return {
          soil: res.data.soil,
          analysisId: res.data.analysisId,
          rankings: res.data.recommendations.map((r: any) => ({
            plantId: r.cropId,
            name: r.cropName,
            nameTh: r.cropNameTh,
            scientificName: r.scientificName,
            category: r.category,
            description: r.description,
            imageUrl: r.imageUrl,
            score: r.score,
            level: r.level,
            breakdown: r.breakdown,
            reasons: r.reasons,
            improvements: r.improvementSuggestions,
            cropRequirement: r.cropRequirement,
          })),
        }
      }
      return res
    },
    {
      body: SoilInputSchema,
    }
  )
  .get(
    "/analysis/history",
    async ({ request }) => {
      const session = await auth.api.getSession({ headers: request.headers })
      if (!session?.user?.id) {
        return { error: "Unauthorized" }
      }
      const history = await analysisController.getUserHistory(session.user.id)
      return history.data || []
    }
  )
