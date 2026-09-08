"use client"

import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Leaf,
  Activity,
} from "lucide-react"
import type { NutrientDiagnostic, NutrientDeficiencyStatus } from "@/types"

interface NutrientDeficiencyCardProps {
  diagnostics: NutrientDiagnostic[]
}

function getStatusBadge(status: NutrientDeficiencyStatus, labelTh: string) {
  switch (status) {
    case "optimal":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          {labelTh}
        </span>
      )
    case "mild_deficiency":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
          {labelTh}
        </span>
      )
    case "severe_deficiency":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
          {labelTh}
        </span>
      )
    case "mild_excess":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          <Activity className="h-3.5 w-3.5 text-blue-600" />
          {labelTh}
        </span>
      )
    case "severe_excess":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          <AlertCircle className="h-3.5 w-3.5 text-purple-600" />
          {labelTh}
        </span>
      )
    default:
      return null
  }
}

export function NutrientDeficiencyCard({ diagnostics }: NutrientDeficiencyCardProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {diagnostics.map((item) => {
          const isPh = item.nutrient === "ph"
          const unit = isPh ? "" : "mg/kg"
          const min = item.optimalRange.min
          const max = item.optimalRange.max
          const optimal = item.optimalRange.optimal

          // Calculate percentage for visual gauge
          const rangeSpan = Math.max(max * 1.5, 1)
          const pct = Math.min(Math.max((item.currentValue / rangeSpan) * 100, 5), 100)

          return (
            <div
              key={item.nutrient}
              className="rounded-2xl bg-card border p-5 shadow-2xs hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-4"
            >
              {/* Header */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-emerald-600" />
                      {item.nameTh} ({item.name})
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      ช่วงเหมาะสม: {min} - {max} {unit} (เหมาะสมที่สุด: {optimal} {unit})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-extrabold text-foreground font-mono">
                      {item.currentValue}
                    </span>
                    <span className="text-[11px] text-muted-foreground ml-1">{unit}</span>
                  </div>
                </div>

                <div className="mt-1">{getStatusBadge(item.status, item.statusLabelTh)}</div>
              </div>

              {/* Visual Scale Bar */}
              <div className="space-y-1">
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden flex">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      item.status === "optimal"
                        ? "bg-emerald-500"
                        : item.status.includes("deficiency")
                        ? "bg-amber-500"
                        : "bg-blue-500"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>ต่ำ</span>
                  <span>ช่วงเป้าหมาย ({min}-{max})</span>
                  <span>สูง</span>
                </div>
              </div>

              {/* Symptoms & Agronomic Impact */}
              <div className="space-y-2 pt-3 border-t text-xs">
                <div className="flex items-start gap-2 text-muted-foreground">
                  <span className="font-bold text-foreground shrink-0 mt-0.5">อาการที่ใบ/พืช:</span>
                  <span className="leading-relaxed">{item.symptomsTh}</span>
                </div>
                <div className="flex items-start gap-2 text-muted-foreground">
                  <span className="font-bold text-foreground shrink-0 mt-0.5">ผลกระทบ:</span>
                  <span className="leading-relaxed">{item.impactTh}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
