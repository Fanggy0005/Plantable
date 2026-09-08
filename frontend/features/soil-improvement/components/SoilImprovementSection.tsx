"use client"

import { useState } from "react"
import {
  Activity,
  Calendar,
  Layers,
  Sparkles,
  Leaf,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Info,
} from "lucide-react"
import { NutrientDeficiencyCard } from "./NutrientDeficiencyCard"
import { FertilizerScheduleCard } from "./FertilizerScheduleCard"
import { SoilAmendmentCard } from "./SoilAmendmentCard"
import type { SoilImprovementPlan } from "@/types"

interface SoilImprovementSectionProps {
  plan: SoilImprovementPlan
  cropNameTh?: string
}

export function SoilImprovementSection({ plan, cropNameTh }: SoilImprovementSectionProps) {
  const [activeTab, setActiveTab] = useState<"diagnostics" | "fertilizer" | "amendments">("diagnostics")

  const healthScore = plan.soilHealthScore
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800"
    if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800"
    return "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950 dark:border-rose-800"
  }

  return (
    <div className="rounded-3xl border bg-card/60 backdrop-blur-xs p-6 sm:p-8 shadow-xs space-y-6">
      {/* Top Banner: Soil Health Score & Agronomic Overview */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-200/60">
            <Sparkles className="h-3.5 w-3.5" />
            ระบบผู้เชี่ยวชาญการปรับปรุงดินและวางแผนการใส่ปุ๋ย (Smart Soil Improvement)
          </div>
          <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
            แผนการปรับปรุงและฟื้นฟูดิน
            {cropNameTh && (
              <span className="text-primary ml-2 font-bold text-xl">
                (เจาะจง: {cropNameTh})
              </span>
            )}
          </h3>
          <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
            {plan.overallConditionTh}
          </p>
        </div>

        {/* Soil Health Score Badge */}
        <div className={`p-4 rounded-2xl border flex items-center gap-3.5 shrink-0 ${getScoreColor(healthScore)}`}>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80">
              คะแนนสุขภาพดิน (Soil Health)
            </span>
            <span className="text-3xl font-black font-mono leading-none">
              {healthScore}
              <span className="text-sm font-normal opacity-70">/100</span>
            </span>
          </div>
          <ShieldCheck className="h-8 w-8 opacity-80" />
        </div>
      </div>

      {/* Feature Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("diagnostics")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "diagnostics"
              ? "bg-primary text-primary-foreground shadow-xs scale-[1.01]"
              : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>1. การตรวจวินิจฉัยธาตุอาหาร ({plan.diagnostics.length} ตัว)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("fertilizer")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "fertilizer"
              ? "bg-primary text-primary-foreground shadow-xs scale-[1.01]"
              : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>2. ตารางการใส่ปุ๋ยเคมีแบ่งระยะ ({plan.fertilizerRecommendations.length} ช่วง)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("amendments")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "amendments"
              ? "bg-primary text-primary-foreground shadow-xs scale-[1.01]"
              : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>3. ปรับสภาพดินและปุ๋ยอินทรีย์ ({plan.organicAlternatives.length} ชนิด)</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="animate-fade-in pt-2">
        {activeTab === "diagnostics" && (
          <NutrientDeficiencyCard diagnostics={plan.diagnostics} />
        )}

        {activeTab === "fertilizer" && (
          <FertilizerScheduleCard
            schedule={plan.fertilizerRecommendations}
            cropNameTh={cropNameTh}
          />
        )}

        {activeTab === "amendments" && (
          <SoilAmendmentCard
            phCorrection={plan.phCorrection}
            organicAlternatives={plan.organicAlternatives}
          />
        )}
      </div>

      {/* Practical Soil Management Best Practices */}
      {plan.generalTipsTh && plan.generalTipsTh.length > 0 && (
        <div className="pt-4 border-t">
          <h5 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider mb-2">
            <Info className="h-4 w-4 text-emerald-600" />
            ข้อแนะนำเพิ่มเติมจากนักปฐพีวิทยา
          </h5>
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
            {plan.generalTipsTh.map((tip, idx) => (
              <li
                key={idx}
                className="bg-muted/30 p-3 rounded-xl border border-border/60 leading-relaxed"
              >
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
