import { prisma } from "../config/db"
import type { SoilInput, CropEvaluationResult } from "../types"

export class AnalysisRepository {
  async createWithRecommendations(
    soil: SoilInput,
    recommendations: CropEvaluationResult[],
    userId?: string
  ) {
    return prisma.soilAnalysis.create({
      data: {
        userId: userId || null,
        nitrogen: soil.nitrogen,
        phosphorus: soil.phosphorus,
        potassium: soil.potassium,
        ph: soil.ph,
        organicMatter: soil.organicMatter ?? null,
        moisture: soil.moisture ?? null,
        notes: soil.notes ?? null,
        recommendations: {
          create: recommendations.map((rec) => ({
            cropId: rec.cropId,
            suitabilityScore: rec.score,
            recommendationLevel: rec.level,
            nitrogenScore: rec.breakdown.nitrogen,
            phosphorusScore: rec.breakdown.phosphorus,
            potassiumScore: rec.breakdown.potassium,
            phScore: rec.breakdown.ph,
            reasons: rec.reasons,
            improvementSuggestions: rec.improvementSuggestions,
          })),
        },
      },
      include: {
        recommendations: {
          include: {
            crop: {
              include: {
                requirement: true,
              },
            },
          },
          orderBy: {
            suitabilityScore: "desc",
          },
        },
      },
    })
  }

  async findById(id: string) {
    return prisma.soilAnalysis.findUnique({
      where: { id },
      include: {
        recommendations: {
          include: {
            crop: {
              include: {
                requirement: true,
              },
            },
          },
          orderBy: {
            suitabilityScore: "desc",
          },
        },
      },
    })
  }

  async findByUserId(userId: string, limit = 20) {
    return prisma.soilAnalysis.findMany({
      where: { userId },
      include: {
        recommendations: {
          include: {
            crop: true,
          },
          orderBy: {
            suitabilityScore: "desc",
          },
          take: 3, // preview top 3
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    })
  }

  async deleteById(id: string, userId: string) {
    return prisma.soilAnalysis.deleteMany({
      where: {
        id,
        userId,
      },
    })
  }

  async assignUser(id: string, userId: string) {
    return prisma.soilAnalysis.update({
      where: { id },
      data: { userId },
    })
  }
}

export const analysisRepository = new AnalysisRepository()
