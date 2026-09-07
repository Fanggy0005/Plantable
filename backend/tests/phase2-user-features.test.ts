import { describe, expect, it } from "bun:test"
import { Elysia } from "elysia"
import { prisma } from "../src/config/db"
import { userRoutes } from "../src/routes/user.routes"
import { favoriteRoutes } from "../src/routes/favorite.routes"
import { analysisRoutes } from "../src/routes/analysis.routes"
import { userRepository } from "../src/repositories/user.repository"
import { favoriteRepository } from "../src/repositories/favorite.repository"
import { analysisRepository } from "../src/repositories/analysis.repository"
import { cropRepository } from "../src/repositories/crop.repository"

const app = new Elysia()
  .use(userRoutes)
  .use(favoriteRoutes)
  .use(analysisRoutes)

describe("Phase 2 - User Features Test Suite", () => {
  let testUserId: string
  let testCropId: string

  it("should enforce authorization on protected endpoints", async () => {
    // 1. GET /api/users/me without session should return 401
    const resProfile = await app.handle(new Request("http://localhost/api/users/me"))
    expect(resProfile.status).toBe(401)
    const jsonProfile = await resProfile.json()
    expect(jsonProfile.success).toBe(false)

    // 2. GET /api/favorites without session should return 401
    const resFav = await app.handle(new Request("http://localhost/api/favorites"))
    expect(resFav.status).toBe(401)

    // 3. GET /api/analyses/history without session should return error
    const resHist = await app.handle(new Request("http://localhost/api/analyses/history"))
    const jsonHist = await resHist.json()
    expect(jsonHist.success).toBe(false)
  })

  it("should create test user and retrieve profile data via UserRepository", async () => {
    const testEmail = `test-farmer-${Date.now()}@example.com`
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        name: "นายทดสอบ เกษตรกร",
      },
    })
    testUserId = user.id

    const profile = await userRepository.findById(testUserId)
    expect(profile).toBeDefined()
    expect(profile?.email).toBe(testEmail)
    expect(profile?.name).toBe("นายทดสอบ เกษตรกร")
    expect(profile?._count).toBeDefined()
  })

  it("should update user profile display name", async () => {
    const updated = await userRepository.update(testUserId, {
      name: "นายสมเกียรติ พัฒนาดิน",
    })
    expect(updated.name).toBe("นายสมเกียรติ พัฒนาดิน")

    const recheck = await userRepository.findById(testUserId)
    expect(recheck?.name).toBe("นายสมเกียรติ พัฒนาดิน")
  })

  it("should manage favorite crops (add, check, list, remove)", async () => {
    // Get an existing seeded crop
    const crops = await cropRepository.findAll()
    expect(crops.length).toBeGreaterThan(0)
    testCropId = crops[0].id

    // 1. Add to favorites
    await favoriteRepository.addFavorite(testUserId, testCropId)

    // 2. Check isFavorite
    const isFav = await favoriteRepository.isFavorite(testUserId, testCropId)
    expect(isFav).toBe(true)

    // 3. List user favorites
    const favList = await favoriteRepository.findUserFavorites(testUserId)
    expect(favList.some((c) => c.id === testCropId)).toBe(true)

    // 4. Remove from favorites
    await favoriteRepository.removeFavorite(testUserId, testCropId)
    const isFavAfter = await favoriteRepository.isFavorite(testUserId, testCropId)
    expect(isFavAfter).toBe(false)
  })

  it("should associate analysis with user and retrieve history", async () => {
    const testSoil = {
      nitrogen: 120,
      phosphorus: 45,
      potassium: 45,
      ph: 6.0,
    }

    const testRecommendations = [
      {
        cropId: testCropId,
        cropName: "Rice",
        cropNameTh: "ข้าว",
        category: "Grain",
        score: 95,
        level: "Excellent" as const,
        breakdown: { nitrogen: 95, phosphorus: 95, potassium: 95, ph: 95 },
        reasons: ["Optimal conditions"],
        improvementSuggestions: [],
      },
    ]

    // 1. Save analysis linked to user
    const analysis = await analysisRepository.createWithRecommendations(
      testSoil,
      testRecommendations,
      testUserId
    )
    expect(analysis.userId).toBe(testUserId)
    expect(analysis.recommendations.length).toBe(1)

    // 2. Query user history
    const history = await analysisRepository.findByUserId(testUserId)
    expect(history.length).toBeGreaterThanOrEqual(1)
    expect(history[0].userId).toBe(testUserId)

    // 3. Delete analysis
    await analysisRepository.deleteById(analysis.id, testUserId)
    const afterDelete = await analysisRepository.findById(analysis.id)
    expect(afterDelete).toBeNull()
  })

  it("should allow claiming an unassigned guest analysis to a user account", async () => {
    // Guest analysis created with no user
    const guestAnalysis = await analysisRepository.createWithRecommendations(
      { nitrogen: 100, phosphorus: 50, potassium: 50, ph: 6.5 },
      [
        {
          cropId: testCropId,
          cropName: "Corn",
          cropNameTh: "ข้าวโพด",
          category: "Grain",
          score: 90,
          level: "Excellent" as const,
          breakdown: { nitrogen: 90, phosphorus: 90, potassium: 90, ph: 90 },
          reasons: ["Good"],
          improvementSuggestions: [],
        },
      ],
      undefined
    )
    expect(guestAnalysis.userId).toBeNull()

    // Claim to user
    await analysisRepository.assignUser(guestAnalysis.id, testUserId)
    const claimed = await analysisRepository.findById(guestAnalysis.id)
    expect(claimed?.userId).toBe(testUserId)

    // Cleanup
    await analysisRepository.deleteById(guestAnalysis.id, testUserId)
    await prisma.user.delete({ where: { id: testUserId } })
  })
})
