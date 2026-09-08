"use client"

import {
  TestTube,
  Leaf,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react"
import type { PhCorrectionPlan, OrganicAlternative } from "@/types"

interface SoilAmendmentCardProps {
  phCorrection: PhCorrectionPlan
  organicAlternatives: OrganicAlternative[]
}

export function SoilAmendmentCard({
  phCorrection,
  organicAlternatives,
}: SoilAmendmentCardProps) {
  const isOptimalPh = phCorrection.dosageKgPerRai === 0

  return (
    <div className="space-y-6">
      {/* 1. pH Amendment Section */}
      <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-start justify-between gap-3 border-b pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <TestTube className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-foreground">
                การปรับปรุงค่าความเป็นกรด-ด่างของดิน (Soil pH Amendment)
              </h4>
              <p className="text-xs text-muted-foreground">
                ระดับ pH ปัจจุบัน: <strong className="text-foreground">{phCorrection.currentPh}</strong> ({phCorrection.categoryTh})
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-lg text-xs font-bold ${
              isOptimalPh
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
            }`}
          >
            {isOptimalPh ? "ไม่ต้องใส่ปูนปรับสภาพ" : "จำเป็นต้องปรับสภาพดิน"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-muted/50 border space-y-1.5">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              วัสดุปรับปรุงดินที่แนะนำ
            </span>
            <p className="text-sm font-extrabold text-foreground">
              {phCorrection.recommendedMaterial}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-muted/50 border space-y-1.5">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              อัตราการใส่ต่อพื้นที่
            </span>
            <p className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
              {phCorrection.dosageKgPerRai} กก. / ไร่{" "}
              <span className="text-xs font-normal text-muted-foreground">
                ({phCorrection.dosageKgPerHectare} กก./เฮกตาร์)
              </span>
            </p>
          </div>
        </div>

        <div className="bg-muted/30 p-3.5 rounded-xl text-xs text-muted-foreground leading-relaxed border">
          <strong className="text-foreground">วิธีปฏิบัติและระยะเวลา: </strong>
          {phCorrection.applicationMethodTh}
        </div>
      </div>

      {/* 2. Organic and Biological Alternatives */}
      <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="border-b pb-4">
          <h4 className="text-sm font-extrabold text-foreground flex items-center gap-2">
            <Leaf className="h-4 w-4 text-emerald-600" />
            ทางเลือกการบำรุงด้วยปุ๋ยอินทรีย์และวัสดุชีวภาพธรรมชาติ
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            เสริมสุขภาพดินในระยะยาว ลดการพึ่งพาปุ๋ยเคมี และเพิ่มจุลินทรีย์ที่มีประโยชน์
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {organicAlternatives.map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl border p-4 bg-card/60 hover:bg-muted/30 hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-2.5"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h5 className="text-xs font-extrabold text-foreground">{item.nameTh}</h5>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {item.targetNutrient}
                  </span>
                </div>

                <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mt-1.5">
                  อัตราการใช้: {item.rateTh}
                </p>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed pt-2 border-t">
                {item.benefitTh}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
