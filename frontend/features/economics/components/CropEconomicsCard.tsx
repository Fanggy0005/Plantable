"use client"

import { useState, useEffect } from "react"
import {
  Coins,
  TrendingUp,
  Scale,
  PieChart,
  Layers,
  ArrowUpRight,
  Calculator,
  RefreshCw,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { CropEconomics, SoilInput } from "@/types"
import { calculateCropEconomics, fetchCropEconomics } from "@/lib/api"

interface CropEconomicsCardProps {
  cropId: string
  cropNameTh?: string
  soil?: SoilInput
  initialAreaRai?: number
}

export function CropEconomicsCard({
  cropId,
  cropNameTh,
  soil,
  initialAreaRai = 1,
}: CropEconomicsCardProps) {
  const [landArea, setLandArea] = useState<number>(initialAreaRai)
  const [economics, setEconomics] = useState<CropEconomics | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadEconomics = async (area: number) => {
    try {
      setLoading(true)
      setError(null)
      const data = await calculateCropEconomics({
        cropId,
        landAreaRai: area,
        soil,
      })
      setEconomics(data)
    } catch {
      // Fallback to fetchCropEconomics without soil if calculate fails
      try {
        const fallback = await fetchCropEconomics(cropId, area)
        setEconomics(fallback)
      } catch (err: any) {
        setError(err.message || "ไม่สามารถคำนวณความคุ้มค่าทางเศรษฐกิจได้")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEconomics(landArea)
  }, [cropId, landArea])

  const handleAreaChange = (val: number) => {
    if (val >= 0.5 && val <= 500) {
      setLandArea(val)
    }
  }

  const formatNumber = (n: number) => n.toLocaleString("th-TH")

  const COST_COLORS: Record<string, string> = {
    fertilizer: "bg-emerald-500",
    land_prep_labor: "bg-blue-500",
    seeds: "bg-amber-500",
    protection: "bg-purple-500",
    harvest_transport: "bg-rose-500",
  }

  return (
    <Card className="border-border/60 shadow-sm overflow-hidden">
      <CardHeader className="bg-muted/30 border-b pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <CardTitle className="text-lg font-bold">
                การประเมินต้นทุนและผลตอบแทนทางเศรษฐกิจ
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              อ้างอิงข้อมูลสถิติสำนักงานเศรษฐกิจการเกษตร (สศก.) และค่าปรับปรุงดินเฉพาะแปลงของคุณ
            </CardDescription>
          </div>

          {/* Area Controls */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
              ขนาดพื้นที่เพาะปลูก:
            </span>
            <div className="flex items-center gap-1.5 bg-background border rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-xs font-bold"
                onClick={() => handleAreaChange(Math.max(1, landArea - 1))}
              >
                -
              </Button>
              <input
                type="number"
                min="0.5"
                max="500"
                step="0.5"
                value={landArea}
                onChange={(e) => handleAreaChange(parseFloat(e.target.value) || 1)}
                className="w-12 text-center text-xs font-bold bg-transparent focus:outline-none"
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-xs font-bold"
                onClick={() => handleAreaChange(landArea + 1)}
              >
                +
              </Button>
              <span className="text-xs text-muted-foreground pr-1">ไร่</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {loading && !economics ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            <RefreshCw className="h-5 w-5 animate-spin mr-2" />
            กำลังคำนวณต้นทุนและความคุ้มค่า...
          </div>
        ) : economics ? (
          <>
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Gross Revenue */}
              <div className="p-4 rounded-xl border bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/40">
                <p className="text-[11px] font-medium text-muted-foreground">รายได้รวมคาดการณ์</p>
                <p className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">
                  ฿{formatNumber(economics.totalProjectedRevenue)}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  (฿{formatNumber(economics.grossRevenuePerRai)} / ไร่)
                </p>
              </div>

              {/* Total Costs */}
              <div className="p-4 rounded-xl border bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/50 dark:border-rose-800/40">
                <p className="text-[11px] font-medium text-muted-foreground">ต้นทุนรวมทั้งหมด</p>
                <p className="text-xl font-extrabold text-rose-700 dark:text-rose-400 mt-1">
                  ฿{formatNumber(economics.totalProjectedCost)}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  (฿{formatNumber(economics.totalCostPerRai)} / ไร่)
                </p>
              </div>

              {/* Net Profit */}
              <div className="p-4 rounded-xl border bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/40">
                <p className="text-[11px] font-medium text-muted-foreground">กำไรสุทธิคาดหมาย</p>
                <p
                  className={`text-xl font-extrabold mt-1 ${
                    economics.totalProjectedProfit >= 0
                      ? "text-blue-700 dark:text-blue-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  ฿{formatNumber(economics.totalProjectedProfit)}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  (฿{formatNumber(economics.netProfitPerRai)} / ไร่)
                </p>
              </div>

              {/* ROI & Break-even */}
              <div className="p-4 rounded-xl border bg-muted/40 flex flex-col justify-between">
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground">ผลตอบแทนการลงทุน (ROI)</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-2xl font-black ${
                        economics.roiPercentage >= 20
                          ? "text-emerald-600 dark:text-emerald-400"
                          : economics.roiPercentage > 0
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-red-600"
                      }`}
                    >
                      {economics.roiPercentage > 0 ? `+${economics.roiPercentage}%` : `${economics.roiPercentage}%`}
                    </span>
                    <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <div className="pt-2 border-t mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>จุดคุ้มทุน:</span>
                  <span className="font-bold text-foreground">฿{economics.breakEvenPricePerKg} / กก.</span>
                </div>
              </div>
            </div>

            {/* Quick Benchmark Comparison Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-muted/30 border text-xs">
              <div className="flex items-center justify-between sm:justify-start sm:gap-2">
                <span className="text-muted-foreground">ผลผลิตเฉลี่ย:</span>
                <span className="font-bold">
                  {formatNumber(economics.expectedYieldPerRai)} กก./ไร่
                </span>
                <span className="text-[10px] text-muted-foreground">
                  ({formatNumber(economics.expectedYieldPerHectare)} กก./เฮกตาร์)
                </span>
              </div>
              <div className="flex items-center justify-between sm:justify-start sm:gap-2">
                <span className="text-muted-foreground">ราคาจำหน่ายหน้าสวน:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  ฿{economics.marketPricePerKg} / กก.
                </span>
              </div>
              <div className="flex items-center justify-between sm:justify-start sm:gap-2">
                <span className="text-muted-foreground">ค่าปุ๋ยเคมีปรับดิน:</span>
                <span className="font-bold text-foreground">
                  ฿{formatNumber(economics.fertilizerCostPerRai)} / ไร่
                </span>
              </div>
            </div>

            {/* Production Cost Breakdown Bar & List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <PieChart className="h-3.5 w-3.5 text-primary" />
                  โครงสร้างสัดส่วนต้นทุนการผลิต (ต่อไร่)
                </p>
                <span className="text-xs text-muted-foreground">
                  รวม ฿{formatNumber(economics.totalCostPerRai)} / ไร่
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex shadow-inner">
                {economics.costBreakdown.map((item, idx) => (
                  <div
                    key={idx}
                    className={`${COST_COLORS[item.category] || "bg-gray-400"} h-full transition-all duration-300`}
                    style={{ width: `${item.percentage}%` }}
                    title={`${item.categoryTh}: ${item.percentage}%`}
                  />
                ))}
              </div>

              {/* Legend & Breakdown Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                {economics.costBreakdown.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border bg-card/60 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${COST_COLORS[item.category] || "bg-gray-400"}`}
                      />
                      <span className="text-muted-foreground text-[11px]">{item.categoryTh}</span>
                    </div>
                    <div className="text-right font-medium">
                      <span>฿{formatNumber(item.amountThb)}</span>
                      <span className="text-[10px] text-muted-foreground ml-1">({item.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : error ? (
          <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-center text-xs text-destructive">
            {error}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
