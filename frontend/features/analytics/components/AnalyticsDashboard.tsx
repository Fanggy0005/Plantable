"use client"

import { useState, useEffect } from "react"
import {
  BarChart3,
  TrendingUp,
  Activity,
  Users,
  Sprout,
  TestTubes,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Clock,
  Award,
  RefreshCw,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { AnalyticsDashboardData } from "@/types"
import { fetchAnalyticsDashboard } from "@/lib/api"

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetchAnalyticsDashboard()
      setData(res)
    } catch (err: any) {
      setError(err.message || "ไม่สามารถดึงข้อมูลแดชบอร์ดสถิติได้")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-primary mb-3" />
        <p className="text-sm font-medium text-muted-foreground">กำลังประมวลผลข้อมูลสถิติระดับประเทศ...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <Card className="border-destructive/20 bg-destructive/5 text-center p-8">
        <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
        <p className="text-sm font-bold text-destructive">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
        <p className="text-xs text-muted-foreground mt-1 mb-4">{error}</p>
        <Button variant="outline" size="sm" onClick={loadData}>
          ลองใหม่อีกครั้ง
        </Button>
      </Card>
    )
  }

  const kpis = data.kpis || {
    totalAnalyses: data.totalAnalyses,
    totalCrops: data.totalCrops,
    totalUsers: data.totalUsers,
  }

  const timeline = data.recentActivityTimeline || data.recentAnalysesTimeline || []

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <BarChart3 className="h-7 w-7 text-primary" />
            แดชบอร์ดข้อมูลสุขภาพดิน & สถิติการเกษตร
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            สรุปแนวโน้มความอุดมสมบูรณ์ของดิน ปริมาณธาตุอาหาร และพืชเศรษฐกิจยอดนิยมทั่วไทย
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          disabled={loading}
          className="self-start sm:self-auto gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          อัปเดตข้อมูล
        </Button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/60 shadow-xs hover-lift transition-smooth animate-fade-in-up stagger-1">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">การตรวจวิเคราะห์ดินสะสม</p>
              <p className="text-3xl font-black text-foreground mt-1">{kpis.totalAnalyses}</p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                ครอบคลุม 6 ภูมิภาคการเกษตร
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              <TestTubes className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs hover-lift transition-smooth animate-fade-in-up stagger-2">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">ฐานข้อมูลพืชเศรษฐกิจ</p>
              <p className="text-3xl font-black text-foreground mt-1">{kpis.totalCrops}</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                พืชไร่ พืชสวน ไม้ผล และผักเมืองหนาว
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
              <Sprout className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs hover-lift transition-smooth animate-fade-in-up stagger-3">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">เกษตรกรและผู้ใช้งาน</p>
              <p className="text-3xl font-black text-foreground mt-1">{kpis.totalUsers}</p>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-1 flex items-center gap-1">
                <Users className="h-3 w-3" />
                สมาชิกชุมชนเกษตรอัจฉริยะ
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Soil Health Distribution & Nutrient Averages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Soil Health Status */}
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              ภาพรวมความสมบูรณ์ของดินที่นำมาตรวจ
            </CardTitle>
            <CardDescription className="text-xs">
              สัดส่วนดินที่มีธาตุอาหารสมดุล เทียบกับดินที่ขาดแคลนหรือตกค้าง
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Visual Health Bar */}
            <div className="h-4 w-full rounded-full bg-muted overflow-hidden flex shadow-inner">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${data.soilHealthDistribution.optimalPercentage}%` }}
                title={`สมดุล: ${data.soilHealthDistribution.optimalPercentage}%`}
              />
              <div
                className="bg-amber-500 h-full transition-all duration-500"
                style={{ width: `${data.soilHealthDistribution.deficientPercentage}%` }}
                title={`ขาดแคลน: ${data.soilHealthDistribution.deficientPercentage}%`}
              />
              <div
                className="bg-purple-500 h-full transition-all duration-500"
                style={{ width: `${data.soilHealthDistribution.excessPercentage}%` }}
                title={`ตกค้างเกินเกณฑ์: ${data.soilHealthDistribution.excessPercentage}%`}
              />
            </div>

            {/* Health Legend */}
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2.5 rounded-xl border bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50">
                <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">สมดุลพอดี</p>
                <p className="text-xl font-bold text-emerald-800 dark:text-emerald-200 mt-0.5">
                  {data.soilHealthDistribution.optimalPercentage}%
                </p>
              </div>

              <div className="p-2.5 rounded-xl border bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/50">
                <p className="text-[11px] font-medium text-amber-700 dark:text-amber-300">ขาดแคลน</p>
                <p className="text-xl font-bold text-amber-800 dark:text-amber-200 mt-0.5">
                  {data.soilHealthDistribution.deficientPercentage}%
                </p>
              </div>

              <div className="p-2.5 rounded-xl border bg-purple-50/50 dark:bg-purple-950/20 border-purple-200/50">
                <p className="text-[11px] font-medium text-purple-700 dark:text-purple-300">ตกค้างสะสม</p>
                <p className="text-xl font-bold text-purple-800 dark:text-purple-200 mt-0.5">
                  {data.soilHealthDistribution.excessPercentage}%
                </p>
              </div>
            </div>

            {/* pH Distribution Levels */}
            <div className="space-y-2 pt-2 border-t">
              <p className="text-xs font-semibold text-foreground">การกระจายตัวของค่าความเป็นกรด-ด่าง (pH)</p>
              <div className="space-y-2">
                {data.phCategoryDistribution.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{item.labelTh}</span>
                      <span className="font-bold">{item.percentage}% ({item.count} ตัวอย่าง)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.category === "strongly_acidic"
                            ? "bg-red-500"
                            : item.category === "moderately_acidic"
                            ? "bg-amber-500"
                            : item.category === "optimal"
                            ? "bg-emerald-500"
                            : "bg-blue-500"
                        }`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Soil Metrics */}
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              ค่าเฉลี่ยธาตุอาหารในดินทั่วประเทศ
            </CardTitle>
            <CardDescription className="text-xs">
              คำนวณจากผลตรวจวิเคราะห์ตัวอย่างดินจริงในระบบ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {/* Nitrogen */}
              <div className="p-3.5 rounded-xl border bg-card">
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>ไนโตรเจน (N)</span>
                  <span className="text-[10px] text-emerald-600 font-medium">เป้าหมาย: 100-160</span>
                </div>
                <p className="text-2xl font-black text-foreground mt-1">
                  {data.averageSoilMetrics.nitrogen} <span className="text-xs font-normal text-muted-foreground">มก./กก.</span>
                </p>
                <div className="h-1.5 w-full bg-muted rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, (data.averageSoilMetrics.nitrogen / 200) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Phosphorus */}
              <div className="p-3.5 rounded-xl border bg-card">
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>ฟอสฟอรัส (P)</span>
                  <span className="text-[10px] text-emerald-600 font-medium">เป้าหมาย: 30-60</span>
                </div>
                <p className="text-2xl font-black text-foreground mt-1">
                  {data.averageSoilMetrics.phosphorus} <span className="text-xs font-normal text-muted-foreground">มก./กก.</span>
                </p>
                <div className="h-1.5 w-full bg-muted rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, (data.averageSoilMetrics.phosphorus / 100) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Potassium */}
              <div className="p-3.5 rounded-xl border bg-card">
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>โพแทสเซียม (K)</span>
                  <span className="text-[10px] text-emerald-600 font-medium">เป้าหมาย: 60-120</span>
                </div>
                <p className="text-2xl font-black text-foreground mt-1">
                  {data.averageSoilMetrics.potassium} <span className="text-xs font-normal text-muted-foreground">มก./กก.</span>
                </p>
                <div className="h-1.5 w-full bg-muted rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-purple-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, (data.averageSoilMetrics.potassium / 150) * 100)}%` }}
                  />
                </div>
              </div>

              {/* pH */}
              <div className="p-3.5 rounded-xl border bg-card">
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>กรด-ด่าง (pH)</span>
                  <span className="text-[10px] text-emerald-600 font-medium">สมดุล: 6.0-7.0</span>
                </div>
                <p className="text-2xl font-black text-foreground mt-1">
                  {data.averageSoilMetrics.ph} <span className="text-xs font-normal text-muted-foreground">pH</span>
                </p>
                <div className="h-1.5 w-full bg-muted rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, (data.averageSoilMetrics.ph / 10) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Regional Activity Breakdown */}
            <div className="space-y-2 pt-2 border-t">
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                สัดส่วนการตรวจวิเคราะห์จำแนกตามภูมิภาค
              </p>
              <div className="flex flex-wrap gap-2">
                {data.regionalActivity.map((reg, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs px-2.5 py-1">
                    {reg.regionTh}: <span className="font-bold ml-1">{reg.count} ครั้ง</span>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Crop Popularity Leaderboard & Live Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Recommended Crops */}
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" />
              พืชที่ได้รับการแนะนำสูงสุด (Most Recommended)
            </CardTitle>
            <CardDescription className="text-xs">
              อันดับพืชที่ระบบประเมินว่าเหมาะสมกับดินของเกษตรกรบ่อยครั้งที่สุด
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {data.cropPopularityRanking.map((crop, idx) => (
              <div
                key={crop.cropId}
                className="p-3 rounded-xl border bg-card flex items-center justify-between hover-lift transition-smooth hover:border-primary/40"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-7 w-7 rounded-lg flex items-center justify-center font-black text-xs ${
                      idx === 0
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        : idx === 1
                        ? "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                        : idx === 2
                        ? "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    #{idx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{crop.nameTh}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {crop.name} · {crop.category}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <Badge variant="secondary" className="font-bold text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    เฉลี่ย {crop.averageScore}%
                  </Badge>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    แนะนำแล้ว {crop.count} ครั้ง
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Live Testing Timeline */}
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              การตรวจวิเคราะห์ล่าสุด (Real-time Activity)
            </CardTitle>
            <CardDescription className="text-xs">
              บันทึกกิจกรรมการตรวจและแนะนำพืชล่าสุดในระบบ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {timeline.length > 0 ? (
              timeline.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border bg-muted/20 flex items-center justify-between text-xs hover-lift transition-smooth hover:border-primary/40"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <p className="font-bold text-foreground">{item.cropNameTh}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      item.suitabilityScore >= 85
                        ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "border-blue-300 bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                    }`}
                  >
                    ความเข้ากัน {item.suitabilityScore}%
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground py-6 text-center">
                ยังไม่มีข้อมูลกิจกรรมล่าสุด
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
