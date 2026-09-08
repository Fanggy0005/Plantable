import type { CropEconomics, CostBreakdownItem } from "../types"
import { calculateFertilizerPlan } from "./soil-improvement.service"
import type { SoilInput } from "../types"
import type { Crop, CropRequirement } from "../generated/prisma"

export interface CropEconomicBenchmark {
  yieldKgPerRai: number
  priceThbPerKg: number
  landPrepLaborCostThb: number
  seedsCostThb: number
  protectionCostThb: number
  harvestTransportCostThb: number
}

// Economic data based on Thai Office of Agricultural Economics (OAE - สศก.) benchmarks
export const CROP_ECONOMIC_BENCHMARKS: Record<string, CropEconomicBenchmark> = {
  rice: {
    yieldKgPerRai: 850,
    priceThbPerKg: 11.5,
    landPrepLaborCostThb: 1600,
    seedsCostThb: 550,
    protectionCostThb: 650,
    harvestTransportCostThb: 1100,
  },
  corn: {
    yieldKgPerRai: 1150,
    priceThbPerKg: 9.8,
    landPrepLaborCostThb: 1750,
    seedsCostThb: 700,
    protectionCostThb: 600,
    harvestTransportCostThb: 1250,
  },
  cassava: {
    yieldKgPerRai: 4200,
    priceThbPerKg: 3.2,
    landPrepLaborCostThb: 1900,
    seedsCostThb: 500,
    protectionCostThb: 450,
    harvestTransportCostThb: 2200,
  },
  sugarcane: {
    yieldKgPerRai: 12000,
    priceThbPerKg: 1.35,
    landPrepLaborCostThb: 2400,
    seedsCostThb: 900,
    protectionCostThb: 800,
    harvestTransportCostThb: 3800,
  },
  tomato: {
    yieldKgPerRai: 3800,
    priceThbPerKg: 18.0,
    landPrepLaborCostThb: 3200,
    seedsCostThb: 1500,
    protectionCostThb: 2200,
    harvestTransportCostThb: 2800,
  },
  chili: {
    yieldKgPerRai: 1600,
    priceThbPerKg: 45.0,
    landPrepLaborCostThb: 3500,
    seedsCostThb: 1200,
    protectionCostThb: 2500,
    harvestTransportCostThb: 3000,
  },
  lettuce: {
    yieldKgPerRai: 2200,
    priceThbPerKg: 28.0,
    landPrepLaborCostThb: 2200,
    seedsCostThb: 800,
    protectionCostThb: 1200,
    harvestTransportCostThb: 1600,
  },
  durian: {
    yieldKgPerRai: 1800,
    priceThbPerKg: 120.0,
    landPrepLaborCostThb: 8000,
    seedsCostThb: 4000,
    protectionCostThb: 6500,
    harvestTransportCostThb: 7500,
  },
  mango: {
    yieldKgPerRai: 1400,
    priceThbPerKg: 35.0,
    landPrepLaborCostThb: 4000,
    seedsCostThb: 2000,
    protectionCostThb: 3200,
    harvestTransportCostThb: 3000,
  },
  pineapple: {
    yieldKgPerRai: 5500,
    priceThbPerKg: 6.8,
    landPrepLaborCostThb: 2200,
    seedsCostThb: 1100,
    protectionCostThb: 900,
    harvestTransportCostThb: 2500,
  },
  oil_palm: {
    yieldKgPerRai: 3200,
    priceThbPerKg: 5.5,
    landPrepLaborCostThb: 2500,
    seedsCostThb: 1500,
    protectionCostThb: 1200,
    harvestTransportCostThb: 2200,
  },
  rubber: {
    yieldKgPerRai: 260, // dry rubber sheet / cup lump
    priceThbPerKg: 68.0,
    landPrepLaborCostThb: 3000,
    seedsCostThb: 1800,
    protectionCostThb: 1000,
    harvestTransportCostThb: 2500,
  },
}

// Commercial fertilizer unit costs in Thailand (THB per kg)
const FERTILIZER_UNIT_PRICES_THB: Record<string, number> = {
  "46-0-0": 18.5, // ~925 THB / 50kg
  "16-16-16": 24.0, // ~1,200 THB / 50kg
  "15-15-15": 23.0, // ~1,150 THB / 50kg
  "18-46-0": 26.5, // ~1,325 THB / 50kg
  "0-46-0": 24.5,
  "0-0-60": 27.0, // ~1,350 THB / 50kg
  "13-13-21": 25.5,
  "16-8-8": 20.0,
  "8-24-24": 26.0,
  default: 22.0,
}

export class EconomicsService {
  /**
   * Resolve crop key to benchmark table
   */
  resolveBenchmark(cropName: string): CropEconomicBenchmark {
    const key = cropName.toLowerCase().replace(/[^a-z]/g, "")
    for (const [benchKey, data] of Object.entries(CROP_ECONOMIC_BENCHMARKS)) {
      if (key.includes(benchKey)) {
        return data
      }
    }

    // Default fallback benchmark for general field crops
    return {
      yieldKgPerRai: 1000,
      priceThbPerKg: 15.0,
      landPrepLaborCostThb: 2000,
      seedsCostThb: 800,
      protectionCostThb: 1000,
      harvestTransportCostThb: 1500,
    }
  }

  /**
   * Calculate precise fertilizer cost from soil deficiency and schedule
   */
  calculateFertilizerCost(soil?: SoilInput, cropReq?: CropRequirement | null): number {
    if (!soil) return 1250 // default baseline

    const schedule = calculateFertilizerPlan(soil, cropReq)
    let totalThb = 0

    for (const item of schedule) {
      let pricePerKg = FERTILIZER_UNIT_PRICES_THB.default
      for (const [formulaKey, price] of Object.entries(FERTILIZER_UNIT_PRICES_THB)) {
        if (item.formula.includes(formulaKey)) {
          pricePerKg = price
          break
        }
      }
      totalThb += item.rateKgPerRai * pricePerKg
    }

    return Math.round(Math.max(totalThb, 650))
  }

  /**
   * Calculate comprehensive crop economics, expected yield, and ROI
   */
  calculateCropEconomics(
    crop: { id: string; name: string; nameTh: string; requirement?: CropRequirement | null },
    soil?: SoilInput,
    landAreaRai = 1
  ): CropEconomics {
    const area = Math.max(0.1, Number(landAreaRai) || 1)
    const bench = this.resolveBenchmark(crop.name)
    const fertilizerCostPerRai = this.calculateFertilizerCost(soil, crop.requirement)

    const otherCostPerRai =
      bench.landPrepLaborCostThb +
      bench.seedsCostThb +
      bench.protectionCostThb +
      bench.harvestTransportCostThb

    const totalCostPerRai = fertilizerCostPerRai + otherCostPerRai
    const grossRevenuePerRai = Math.round(bench.yieldKgPerRai * bench.priceThbPerKg)
    const netProfitPerRai = grossRevenuePerRai - totalCostPerRai
    const roiPercentage = Number(((netProfitPerRai / totalCostPerRai) * 100).toFixed(1))
    const breakEvenPricePerKg = Number((totalCostPerRai / bench.yieldKgPerRai).toFixed(2))

    // Cost Breakdown Items
    const costBreakdown: CostBreakdownItem[] = [
      {
        category: "fertilizer",
        categoryTh: "ค่าปุ๋ยเคมีและปรับปรุงดิน",
        amountThb: fertilizerCostPerRai,
        percentage: Math.round((fertilizerCostPerRai / totalCostPerRai) * 100),
      },
      {
        category: "land_prep_labor",
        categoryTh: "ค่าไถเตรียมดินและแรงงาน",
        amountThb: bench.landPrepLaborCostThb,
        percentage: Math.round((bench.landPrepLaborCostThb / totalCostPerRai) * 100),
      },
      {
        category: "seeds",
        categoryTh: "เมล็ดพันธุ์ / ท่อนพันธุ์",
        amountThb: bench.seedsCostThb,
        percentage: Math.round((bench.seedsCostThb / totalCostPerRai) * 100),
      },
      {
        category: "protection",
        categoryTh: "สารกำจัดศัตรูพืชและฮอร์โมน",
        amountThb: bench.protectionCostThb,
        percentage: Math.round((bench.protectionCostThb / totalCostPerRai) * 100),
      },
      {
        category: "harvest_transport",
        categoryTh: "ค่าเก็บเกี่ยวและขนส่งผลผลิต",
        amountThb: bench.harvestTransportCostThb,
        percentage: Math.round((bench.harvestTransportCostThb / totalCostPerRai) * 100),
      },
    ]

    return {
      cropId: crop.id,
      cropName: crop.name,
      cropNameTh: crop.nameTh,
      expectedYieldPerRai: bench.yieldKgPerRai,
      expectedYieldPerHectare: Math.round(bench.yieldKgPerRai * 6.25), // 1 ha = 6.25 rai
      marketPricePerKg: bench.priceThbPerKg,
      grossRevenuePerRai,
      fertilizerCostPerRai,
      otherProductionCostPerRai: otherCostPerRai,
      totalCostPerRai,
      netProfitPerRai,
      roiPercentage,
      breakEvenPricePerKg,
      landAreaRai: area,
      totalProjectedRevenue: Math.round(grossRevenuePerRai * area),
      totalProjectedCost: Math.round(totalCostPerRai * area),
      totalProjectedProfit: Math.round(netProfitPerRai * area),
      costBreakdown,
    }
  }
}

export const economicsService = new EconomicsService()
