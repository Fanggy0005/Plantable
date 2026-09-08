"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Sprout,
  Tag,
  FlaskConical,
  CheckCircle2,
  Calendar,
  Sparkles,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { PHScaleGauge } from "@/components/charts/PHScaleGauge"
import { FavoriteButton } from "@/features/crop/components/FavoriteButton"
import { FertilizerScheduleCard } from "@/features/soil-improvement/components/FertilizerScheduleCard"
import { SoilAmendmentCard } from "@/features/soil-improvement/components/SoilAmendmentCard"
import { CropEconomicsCard } from "@/features/economics/components/CropEconomicsCard"
import { fetchCropById, fetchSoilImprovement } from "@/lib/api"
import type { Crop, SoilImprovementPlan } from "@/types"

export default function CropDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [crop, setCrop] = useState<Crop | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [soilPlan, setSoilPlan] = useState<SoilImprovementPlan | null>(null)

  useEffect(() => {
    async function loadCrop() {
      if (!id) return
      setLoading(true)
      try {
        const data = await fetchCropById(id)
        setCrop(data)
        if (data.requirement) {
          const plan = await fetchSoilImprovement(
            {
              nitrogen: data.requirement.nitrogenOptimal,
              phosphorus: data.requirement.phosphorusOptimal,
              potassium: data.requirement.potassiumOptimal,
              ph: data.requirement.phOptimal,
            },
            data.id
          )
          setSoilPlan(plan)
        }
      } catch (err: any) {
        setError(err.message || "Failed to load crop details")
      } finally {
        setLoading(false)
      }
    }
    loadCrop()
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="text-xs">กำลังโหลดข้อมูลพืช...</p>
        </div>
      </div>
    )
  }

  if (error || !crop) {
    return (
      <div className="mx-auto max-w-xl py-20 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-foreground">ไม่พบข้อมูลพืช</h2>
        <p className="text-sm text-muted-foreground">
          {error || "ไม่พบรหัสพืชที่ระบุในระบบ"}
        </p>
        <Link href="/crops">
          <Button variant="outline">กลับสู่หน้ารายการพืช</Button>
        </Link>
      </div>
    )
  }

  const req = crop.requirement

  const handleTestThisCrop = () => {
    if (!req) return
    // Pre-fill optimal values in sessionStorage
    router.push("/analyze")
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 sm:py-14 animate-fade-in-up space-y-8">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          href="/crops"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-400 hover:underline mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          ย้อนกลับไปฐานข้อมูลพืช
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                {crop.nameTh}
              </h1>
              <span className="text-xl font-medium text-muted-foreground">
                ({crop.name})
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-200/60">
                <Tag className="h-3 w-3" />
                {crop.category}
              </span>
              <FavoriteButton cropId={crop.id} />
            </div>

            {crop.scientificName && (
              <p className="text-sm italic text-muted-foreground font-mono">
                ชื่อวิทยาศาสตร์: {crop.scientificName}
              </p>
            )}
          </div>

          <Link href="/analyze">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs">
              <FlaskConical className="mr-1.5 h-4 w-4" />
              ตรวจดินเพื่อปลูก {crop.nameTh}
            </Button>
          </Link>
        </div>
      </div>

      {/* Description */}
      <div className="bg-card rounded-2xl p-6 border border-border/80 shadow-xs space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          ลักษณะและความต้องการทั่วไป
        </h3>
        <p className="text-sm text-foreground leading-relaxed">
          {crop.description}
        </p>
      </div>

      {/* Agronomic Requirements Matrix */}
      {req && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              เกณฑ์ธาตุอาหารที่เหมาะสมที่สุด (Optimal Nutrient Requirements)
            </h2>
            <span className="text-xs text-muted-foreground">
              หน่วย: mg/kg (ppm) ในดิน
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Nitrogen */}
            <div className="rounded-2xl border bg-card p-5 shadow-2xs space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase">
                ไนโตรเจน (N)
              </span>
              <div className="text-2xl font-black text-foreground">
                {req.nitrogenOptimal}{" "}
                <span className="text-xs font-normal text-muted-foreground">mg/kg</span>
              </div>
              <div className="text-xs text-muted-foreground pt-2 border-t flex justify-between">
                <span>ช่วงยอมรับได้:</span>
                <span className="font-semibold text-foreground">
                  {req.nitrogenMin} - {req.nitrogenMax}
                </span>
              </div>
            </div>

            {/* Phosphorus */}
            <div className="rounded-2xl border bg-card p-5 shadow-2xs space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase">
                ฟอสฟอรัส (P)
              </span>
              <div className="text-2xl font-black text-foreground">
                {req.phosphorusOptimal}{" "}
                <span className="text-xs font-normal text-muted-foreground">mg/kg</span>
              </div>
              <div className="text-xs text-muted-foreground pt-2 border-t flex justify-between">
                <span>ช่วงยอมรับได้:</span>
                <span className="font-semibold text-foreground">
                  {req.phosphorusMin} - {req.phosphorusMax}
                </span>
              </div>
            </div>

            {/* Potassium */}
            <div className="rounded-2xl border bg-card p-5 shadow-2xs space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase">
                โพแทสเซียม (K)
              </span>
              <div className="text-2xl font-black text-foreground">
                {req.potassiumOptimal}{" "}
                <span className="text-xs font-normal text-muted-foreground">mg/kg</span>
              </div>
              <div className="text-xs text-muted-foreground pt-2 border-t flex justify-between">
                <span>ช่วงยอมรับได้:</span>
                <span className="font-semibold text-foreground">
                  {req.potassiumMin} - {req.potassiumMax}
                </span>
              </div>
            </div>

            {/* pH */}
            <div className="rounded-2xl border bg-card p-5 shadow-2xs space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase">
                ความเป็นกรด-ด่าง (pH)
              </span>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                {req.phOptimal}
              </div>
              <div className="text-xs text-muted-foreground pt-2 border-t flex justify-between">
                <span>ช่วงยอมรับได้:</span>
                <span className="font-semibold text-foreground">
                  {req.phMin} - {req.phMax}
                </span>
              </div>
            </div>
          </div>

          {/* pH Gauge Comparison for this crop */}
          <PHScaleGauge
            currentPh={req.phOptimal}
            targetMin={req.phMin}
            targetMax={req.phMax}
            cropName={crop.nameTh}
          />

          {/* Targeted Fertilizer & Soil Management Guide (Phase 3) */}
          {soilPlan && (
            <div className="pt-6 border-t space-y-6">
              <FertilizerScheduleCard
                schedule={soilPlan.fertilizerRecommendations}
                cropNameTh={crop.nameTh}
              />
              <SoilAmendmentCard
                phCorrection={soilPlan.phCorrection}
                organicAlternatives={soilPlan.organicAlternatives}
              />
            </div>
          )}

          {/* Crop Economics & Return on Investment (Phase 4) */}
          <div className="pt-6 border-t">
            <CropEconomicsCard
              cropId={crop.id}
              cropNameTh={crop.nameTh}
            />
          </div>
        </div>
      )}
    </div>
  )
}
