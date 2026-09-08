"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  FileDown,
  RefreshCw,
  Sparkles,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { NPKRadarChart } from "@/components/charts/NPKRadarChart"
import { PHScaleGauge } from "@/components/charts/PHScaleGauge"
import { CropRecommendationCard } from "@/features/recommendation/components/CropRecommendationCard"
import { SoilImprovementSection } from "@/features/soil-improvement/components/SoilImprovementSection"
import { WeatherWidget } from "@/features/environment/components/WeatherWidget"
import { CropEconomicsCard } from "@/features/economics/components/CropEconomicsCard"
import { authClient } from "@/lib/auth-client"
import { fetchSoilImprovement } from "@/lib/api"
import type { AnalysisResult, RecommendedCrop, SoilImprovementPlan } from "@/types"

export default function ResultsPage() {
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [selectedCrop, setSelectedCrop] = useState<RecommendedCrop | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>("All")
  const [exporting, setExporting] = useState(false)
  const [soilPlan, setSoilPlan] = useState<SoilImprovementPlan | null>(null)

  useEffect(() => {
    const data = sessionStorage.getItem("plantResult")
    if (!data) {
      router.push("/analyze")
      return
    }

    try {
      const parsed: AnalysisResult = JSON.parse(data)
      setResult(parsed)
      if (parsed.soilImprovement) {
        setSoilPlan(parsed.soilImprovement)
      }
      if (parsed.rankings && parsed.rankings.length > 0) {
        setSelectedCrop(parsed.rankings[0]) // Select top ranked crop by default
      }
    } catch (e) {
      console.error("Failed to parse analysis results", e)
      router.push("/analyze")
    }
  }, [router])

  // Fetch or update soil improvement plan tailored to selected crop
  useEffect(() => {
    if (!result) return
    const cropId = selectedCrop?.cropId || selectedCrop?.plantId
    fetchSoilImprovement(result.soil, cropId)
      .then((plan) => setSoilPlan(plan))
      .catch((err) => console.error("Failed to fetch soil improvement plan", err))
  }, [result, selectedCrop])

  const handleExportPDF = async () => {
    if (!result) return
    setExporting(true)
    try {
      const { exportToPDF } = await import("@/lib/export-pdf")
      await exportToPDF(result as any)
    } catch (error) {
      console.error("PDF export failed:", error)
    } finally {
      setExporting(false)
    }
  }

  if (!result) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium">กำลังโหลดผลการวิเคราะห์...</p>
        </div>
      </div>
    )
  }

  // Categories list
  const categories = [
    "All",
    ...Array.from(new Set(result.rankings.map((r) => r.category).filter(Boolean))),
  ]

  const filteredRankings = result.rankings.filter((crop) => {
    if (categoryFilter === "All") return true
    return crop.category === categoryFilter
  })

  const topCrop = result.rankings[0]

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12 animate-fade-in-up space-y-8">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/analyze"
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 dark:text-emerald-400 hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              กลับไปกรอกค่าใหม่
            </Link>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date().toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            ผลการวิเคราะห์และอันดับพืชที่เหมาะสม
            <Sparkles className="h-6 w-6 text-amber-500" />
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            พืชอันดับ 1 ที่เหมาะกับดินแปลงนี้มากที่สุดคือ{" "}
            <span className="font-bold text-primary">{topCrop?.nameTh}</span> ด้วยคะแนน{" "}
            <span className="font-bold text-foreground">{topCrop?.score}/100</span>
          </p>

          {session?.user ? (
            <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-200/60">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              บันทึกในบัญชีของคุณเรียบร้อยแล้ว ({session.user.name || session.user.email})
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs border border-amber-200/60">
              <span>บันทึกผลในเครื่องนี้เรียบร้อยแล้ว</span>
              <span>•</span>
              <Link href="/login" className="font-bold underline hover:text-amber-950 dark:hover:text-amber-200">
                เข้าสู่ระบบเพื่อซิงค์ประวัติบนคลาวด์
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={handleExportPDF}
            disabled={exporting}
            variant="outline"
            size="sm"
            className="border-emerald-200 dark:border-emerald-800 text-foreground hover:bg-emerald-50 dark:hover:bg-emerald-950 font-semibold"
          >
            <FileDown className="mr-1.5 h-4 w-4 text-emerald-600" />
            {exporting ? "กำลังส่งออก..." : "บันทึกเป็น PDF"}
          </Button>
          <Link href="/analyze">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              <RefreshCw className="mr-1.5 h-4 w-4" />
              วิเคราะห์แปลงใหม่
            </Button>
          </Link>
        </div>
      </div>

      {/* Soil Parameter Overview Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-2xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            ไนโตรเจน (N)
          </span>
          <p className="text-2xl font-extrabold text-foreground mt-0.5">
            {result.soil.nitrogen}{" "}
            <span className="text-xs font-normal text-muted-foreground">mg/kg</span>
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-2xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            ฟอสฟอรัส (P)
          </span>
          <p className="text-2xl font-extrabold text-foreground mt-0.5">
            {result.soil.phosphorus}{" "}
            <span className="text-xs font-normal text-muted-foreground">mg/kg</span>
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-2xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            โพแทสเซียม (K)
          </span>
          <p className="text-2xl font-extrabold text-foreground mt-0.5">
            {result.soil.potassium}{" "}
            <span className="text-xs font-normal text-muted-foreground">mg/kg</span>
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-2xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            ความเป็นกรด-ด่าง (pH)
          </span>
          <p className="text-2xl font-extrabold text-foreground mt-0.5">
            {result.soil.ph}
          </p>
        </div>
      </div>

      {/* Visual Analytical Section (Radar + pH Gauge) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-6 flex flex-col justify-center">
          <NPKRadarChart
            soil={result.soil}
            breakdown={selectedCrop?.breakdown}
            cropName={selectedCrop?.nameTh}
            size={300}
          />
        </div>

        <div className="lg:col-span-6 flex flex-col justify-between gap-4">
          <PHScaleGauge
            currentPh={result.soil.ph}
            targetMin={selectedCrop?.cropRequirement?.phMin ?? 5.5}
            targetMax={selectedCrop?.cropRequirement?.phMax ?? 7.0}
            cropName={selectedCrop?.nameTh}
          />

          {/* Quick Summary Card */}
          <div className="bg-card rounded-2xl p-5 border border-border/60 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              สรุปภาพรวมปฐพีวิทยา
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              จากการวิเคราะห์คุณสมบัติดิน {result.soil.notes ? `(${result.soil.notes})` : ""} ค่า N={result.soil.nitrogen}, P={result.soil.phosphorus}, K={result.soil.potassium} mg/kg และ pH={result.soil.ph} ดินของคุณมีความเข้ากันได้สูงสุดกับ{" "}
              <strong className="text-foreground">{topCrop?.nameTh}</strong> (ความเหมาะสม {topCrop?.level}) โดยได้รับคะแนน {topCrop?.score}%
            </p>
            {topCrop && topCrop.improvements.length > 0 && (
              <div className="text-xs text-amber-800 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-200/60 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>คำแนะนำปรับดินเร่งด่วน: {topCrop.improvements[0]}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Real-Time Weather & Agricultural Risk Alerts (Phase 4) */}
      <WeatherWidget
        initialProvince={result.soil.province || "nakhon_ratchasima"}
      />

      {/* Smart Soil Improvement & Fertilizer Plan (Phase 3) */}
      {soilPlan && (
        <SoilImprovementSection
          plan={soilPlan}
          cropNameTh={selectedCrop?.nameTh}
        />
      )}

      {/* Crop Economics & Return on Investment (Phase 4) */}
      {selectedCrop && (
        <CropEconomicsCard
          cropId={selectedCrop.cropId || selectedCrop.plantId}
          cropNameTh={selectedCrop.nameTh}
          soil={result.soil}
        />
      )}

      {/* Category Filter Pills */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            หมวดหมู่พืช:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => {
            const isCatActive = categoryFilter === cat
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat as string)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isCatActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat === "All" ? "ทั้งหมด (12 ชนิด)" : cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* Ranked Crop List */}
      <div className="space-y-4">
        {filteredRankings.map((crop, index) => (
          <CropRecommendationCard
            key={crop.plantId || crop.cropId || index}
            crop={crop}
            rank={index + 1}
            isSelected={selectedCrop?.plantId === crop.plantId}
            onSelectForComparison={(c) => {
              setSelectedCrop(c)
              window.scrollTo({ top: 180, behavior: "smooth" })
            }}
          />
        ))}
      </div>
    </div>
  )
}
