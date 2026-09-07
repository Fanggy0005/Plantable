"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Wrench,
  Radio,
  ExternalLink,
  Tag,
} from "lucide-react"
import { SuitabilityGauge } from "@/components/charts/SuitabilityGauge"
import type { RecommendedCrop } from "@/types"

interface CropRecommendationCardProps {
  crop: RecommendedCrop
  rank: number
  isSelected?: boolean
  onSelectForComparison?: (crop: RecommendedCrop) => void
}

export function CropRecommendationCard({
  crop,
  rank,
  isSelected = false,
  onSelectForComparison,
}: CropRecommendationCardProps) {
  const [expanded, setExpanded] = useState(rank <= 2) // Auto-expand top 2

  const getRankBadgeColor = (r: number) => {
    if (r === 1) return "bg-amber-100 text-amber-900 border-amber-300 font-black"
    if (r === 2) return "bg-slate-100 text-slate-800 border-slate-300 font-bold"
    if (r === 3) return "bg-orange-100 text-orange-800 border-orange-300 font-bold"
    return "bg-muted text-muted-foreground border-border font-medium"
  }

  return (
    <div
      className={`rounded-2xl bg-card border transition-all duration-300 overflow-hidden hover-lift ${
        isSelected
          ? "border-emerald-600 ring-2 ring-emerald-600/20 shadow-md"
          : "border-border/70 hover:border-emerald-300 shadow-xs"
      }`}
    >
      {/* Header section */}
      <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          {/* Rank Badge */}
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm shadow-xs ${getRankBadgeColor(
              rank
            )}`}
          >
            #{rank}
          </span>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-bold text-foreground tracking-tight">
                {crop.nameTh}
              </h3>
              <span className="text-sm font-medium text-muted-foreground">
                ({crop.name})
              </span>
              {crop.category && (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                  <Tag className="h-3 w-3" />
                  {crop.category}
                </span>
              )}
            </div>

            {crop.scientificName && (
              <p className="text-xs italic text-muted-foreground mt-0.5 font-mono">
                {crop.scientificName}
              </p>
            )}

            <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 max-w-md">
              {crop.description}
            </p>
          </div>
        </div>

        {/* Right side: Score Gauge & Compare CTA */}
        <div className="flex sm:flex-col items-center justify-between w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0">
          <SuitabilityGauge score={crop.score} level={crop.level} size={84} strokeWidth={7} />

          {onSelectForComparison && (
            <button
              onClick={() => onSelectForComparison(crop)}
              className={`flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg transition-colors ${
                isSelected
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-muted/80 hover:bg-emerald-50 text-muted-foreground hover:text-emerald-800"
              }`}
            >
              <Radio className="h-3 w-3" />
              {isSelected ? "กำลังเปรียบเทียบ" : "ดูในเรดาร์กราฟ"}
            </button>
          )}
        </div>
      </div>

      {/* Nutrient breakdown mini-meters */}
      <div className="px-5 sm:px-6 py-3 bg-muted/25 border-y border-border/40 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <div className="flex justify-between text-muted-foreground mb-1 text-[11px]">
            <span>N ไนโตรเจน</span>
            <span className="font-semibold text-foreground">{crop.breakdown.nitrogen}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${crop.breakdown.nitrogen}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-muted-foreground mb-1 text-[11px]">
            <span>P ฟอสฟอรัส</span>
            <span className="font-semibold text-foreground">{crop.breakdown.phosphorus}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${crop.breakdown.phosphorus}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-muted-foreground mb-1 text-[11px]">
            <span>K โพแทสเซียม</span>
            <span className="font-semibold text-foreground">{crop.breakdown.potassium}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${crop.breakdown.potassium}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-muted-foreground mb-1 text-[11px]">
            <span>pH กรด-ด่าง</span>
            <span className="font-semibold text-foreground">{crop.breakdown.ph}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${crop.breakdown.ph}%` }}
            />
          </div>
        </div>
      </div>

      {/* Accordion Toggle Bar */}
      <div className="px-5 sm:px-6 py-2.5 flex items-center justify-between bg-card">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              ซ่อนเหตุผลและคำแนะนำปรับปรุงดิน
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              ดูรายละเอียดเหตุผลและคำแนะนำ ({crop.reasons.length} ข้อ)
            </>
          )}
        </button>

        <Link
          href={`/crops/${crop.plantId || crop.cropId}`}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
        >
          ข้อมูลทางเกษตร
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {/* Expanded Content (Reasons & Soil Improvement) */}
      {expanded && (
        <div className="px-5 sm:px-6 pb-5 pt-2 border-t border-border/40 space-y-4 animate-fade-in bg-muted/10">
          {/* Reasons */}
          <div>
            <h4 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              วิเคราะห์ความสอดคล้องตามเกณฑ์มาตรฐาน
            </h4>
            <ul className="space-y-1.5 pl-6 list-disc text-xs text-muted-foreground leading-relaxed">
              {crop.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>

          {/* Soil Improvements */}
          {crop.improvements && crop.improvements.length > 0 && (
            <div className="rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/40 p-3.5">
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 mb-1.5 flex items-center gap-1.5">
                <Wrench className="h-4 w-4 text-amber-600 shrink-0" />
                คำแนะนำทางปฐพีวิทยาเพื่อเพิ่มผลผลิต
              </h4>
              <ul className="space-y-1 pl-5 list-disc text-xs text-amber-800/90 dark:text-amber-200/90 leading-relaxed">
                {crop.improvements.map((imp, i) => (
                  <li key={i}>{imp}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
