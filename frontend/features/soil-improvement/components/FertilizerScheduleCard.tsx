"use client"

import { Calendar, Clock, Sprout, ShieldAlert, Sparkles } from "lucide-react"
import type { FertilizerScheduleItem } from "@/types"

interface FertilizerScheduleCardProps {
  schedule: FertilizerScheduleItem[]
  cropNameTh?: string
}

export function FertilizerScheduleCard({ schedule, cropNameTh }: FertilizerScheduleCardProps) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Sprout className="h-4 w-4 text-emerald-600" />
            ตารางการแบ่งใส่ปุ๋ยเคมีตามระยะการเจริญเติบโต
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            {cropNameTh
              ? `คำนวณสูตรและอัตราการใช้เฉพาะสำหรับ: ${cropNameTh}`
              : "คำนวณตามความต้องการฟื้นฟูดินและธาตุอาหารหลัก"}
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-200/60">
          <Sparkles className="h-3.5 w-3.5" />
          แบ่งใส่ 3 ระยะเพื่อประสิทธิภาพสูงสุด
        </div>
      </div>

      <div className="relative border-l-2 border-emerald-500/40 ml-4 sm:ml-6 space-y-6 pl-5 sm:pl-8 py-2">
        {schedule.map((step, idx) => (
          <div key={idx} className="relative group">
            {/* Step Number Dot */}
            <div className="absolute -left-[31px] sm:-left-[43px] top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold shadow-xs">
              {idx + 1}
            </div>

            <div className="rounded-2xl border bg-card p-5 shadow-2xs hover:border-emerald-500/60 transition-all space-y-3">
              {/* Header & Formula */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h5 className="text-sm font-extrabold text-foreground">{step.stage}</h5>

                <div className="inline-flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-primary text-primary-foreground shadow-2xs">
                    {step.formula}
                  </span>
                </div>
              </div>

              {/* Dosage Rate Badges */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200/60">
                  อัตรา: {step.rateKgPerRai} กิโลกรัม / ไร่
                </div>
                <div className="px-2.5 py-1 rounded-md bg-muted text-muted-foreground font-medium">
                  ({step.rateKgPerHectare} กก./เฮกตาร์)
                </div>
              </div>

              {/* Timing */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span className="font-semibold text-foreground">ช่วงเวลา:</span>
                <span>{step.timing}</span>
              </div>

              {/* Practical instructions */}
              <p className="text-xs text-muted-foreground bg-muted/40 p-3 rounded-xl leading-relaxed">
                {step.instructions}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
