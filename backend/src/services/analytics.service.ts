import { prisma } from "../config/db"
import type { AnalyticsDashboardData } from "../types"

export class AnalyticsService {
  async getDashboardData(): Promise<AnalyticsDashboardData> {
    const [
      totalAnalyses,
      totalCrops,
      totalUsers,
      recentAnalyses,
      allAnalysesSummary,
      recommendationStats,
    ] = await Promise.all([
      prisma.soilAnalysis.count(),
      prisma.crop.count(),
      prisma.user.count(),
      prisma.soilAnalysis.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          recommendations: {
            take: 1,
            orderBy: { suitabilityScore: "desc" },
            include: { crop: true },
          },
        },
      }),
      prisma.soilAnalysis.findMany({
        select: {
          nitrogen: true,
          phosphorus: true,
          potassium: true,
          ph: true,
          region: true,
        },
        take: 500, // sample up to 500 records for fast aggregations
      }),
      prisma.recommendation.groupBy({
        by: ["cropId"],
        _count: { cropId: true },
        _avg: { suitabilityScore: true },
        orderBy: { _count: { cropId: "desc" } },
        take: 6,
      }),
    ])

    // 1. Average Soil Metrics
    let avgN = 0
    let avgP = 0
    let avgK = 0
    let avgPh = 0

    let optimalCount = 0
    let deficientCount = 0
    let excessCount = 0

    let phStronglyAcid = 0 // < 5.0
    let phAcid = 0 // 5.0 - 5.9
    let phOptimal = 0 // 6.0 - 7.0
    let phAlkaline = 0 // > 7.0

    const regionalCounts: Record<string, number> = {}

    const totalCount = allAnalysesSummary.length || 1

    for (const item of allAnalysesSummary) {
      avgN += item.nitrogen
      avgP += item.phosphorus
      avgK += item.potassium
      avgPh += item.ph

      // Deficiencies check
      if (item.nitrogen < 80 || item.phosphorus < 30 || item.potassium < 40) {
        deficientCount++
      } else if (item.nitrogen > 180 || item.phosphorus > 80 || item.potassium > 110) {
        excessCount++
      } else {
        optimalCount++
      }

      // pH Categorization
      if (item.ph < 5.0) phStronglyAcid++
      else if (item.ph < 6.0) phAcid++
      else if (item.ph <= 7.2) phOptimal++
      else phAlkaline++

      // Regional aggregation
      const reg = item.region || "Central"
      regionalCounts[reg] = (regionalCounts[reg] || 0) + 1
    }

    const countSafe = allAnalysesSummary.length || 1
    const averageSoilMetrics = {
      nitrogen: Number((avgN / countSafe).toFixed(1)),
      phosphorus: Number((avgP / countSafe).toFixed(1)),
      potassium: Number((avgK / countSafe).toFixed(1)),
      ph: Number((avgPh / countSafe).toFixed(2)),
    }

    const soilHealthDistribution = {
      optimalPercentage: Math.round((optimalCount / countSafe) * 100),
      deficientPercentage: Math.round((deficientCount / countSafe) * 100),
      excessPercentage: Math.round((excessCount / countSafe) * 100),
    }

    const phCategoryDistribution = [
      {
        category: "strongly_acidic",
        labelTh: "กรดจัดรุนแรง (pH < 5.0)",
        count: phStronglyAcid,
        percentage: Math.round((phStronglyAcid / countSafe) * 100),
      },
      {
        category: "moderately_acidic",
        labelTh: "กรดปานกลาง (pH 5.0 - 5.9)",
        count: phAcid,
        percentage: Math.round((phAcid / countSafe) * 100),
      },
      {
        category: "optimal",
        labelTh: "สมดุลเป็นกลาง (pH 6.0 - 7.2)",
        count: phOptimal,
        percentage: Math.round((phOptimal / countSafe) * 100),
      },
      {
        category: "alkaline",
        labelTh: "ดินด่าง (pH > 7.2)",
        count: phAlkaline,
        percentage: Math.round((phAlkaline / countSafe) * 100),
      },
    ]

    // 2. Crop Popularity Ranking
    const cropsMaster = await prisma.crop.findMany()
    const cropMap = new Map(cropsMaster.map((c) => [c.id, c]))

    const totalRecCount = recommendationStats.reduce((sum, r) => sum + r._count.cropId, 0) || 1
    const cropPopularityRanking = recommendationStats.map((stat) => {
      const c = cropMap.get(stat.cropId)
      return {
        cropId: stat.cropId,
        name: c?.name || "Unknown",
        nameTh: c?.nameTh || "พืช",
        category: c?.category || "พืชเศรษฐกิจ",
        count: stat._count.cropId,
        percentage: Math.round((stat._count.cropId / totalRecCount) * 100),
        averageScore: Math.round(stat._avg.suitabilityScore || 80),
      }
    })

    // 3. Regional Activity
    const REGION_LABELS: Record<string, string> = {
      Northeastern: "ภาคตะวันออกเฉียงเหนือ",
      Northern: "ภาคเหนือ",
      Central: "ภาคกลาง",
      Eastern: "ภาคตะวันออก",
      Southern: "ภาคใต้",
      Western: "ภาคตะวันตก",
    }

    const regionalActivity = Object.entries(regionalCounts).map(([region, count]) => ({
      region,
      regionTh: REGION_LABELS[region] || region,
      count,
    }))

    // 4. Recent Activity Timeline
    const recentActivityTimeline = recentAnalyses.map((a) => {
      const topRec = a.recommendations[0]
      return {
        id: a.id,
        createdAt: a.createdAt.toISOString(),
        cropNameTh: topRec?.crop?.nameTh || "พืชทั่วไป",
        suitabilityScore: Math.round(topRec?.suitabilityScore || 80),
        recommendationLevel: topRec?.recommendationLevel || "Good",
      }
    })

    return {
      kpis: {
        totalAnalyses,
        totalCrops,
        totalUsers,
      },
      totalAnalyses,
      totalCrops,
      totalUsers,
      averageSoilMetrics,
      soilHealthDistribution,
      phCategoryDistribution,
      cropPopularityRanking,
      regionalActivity,
      recentActivityTimeline,
      recentAnalysesTimeline: recentActivityTimeline,
    }
  }
}

export const analyticsService = new AnalyticsService()
