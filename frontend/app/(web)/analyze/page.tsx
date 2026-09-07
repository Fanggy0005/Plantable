import { SoilInputForm } from "@/features/soil-analysis/components/SoilInputForm"
import { TestTube2 } from "lucide-react"

export default function AnalyzePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 sm:py-14 animate-fade-in-up">
      <div className="mb-8 space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
          <TestTube2 className="h-3.5 w-3.5" />
          ระบบวิเคราะห์คุณภาพดิน
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          วิเคราะห์ธาตุอาหารและพืชที่เหมาะสม
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          กรอกผลการตรวจตัวอย่างดินจากห้องปฏิบัติการ หรือใช้ชุดตรวจดินพกพา (Test Kit) เพื่อค้นหาชนิดพืชที่ให้ผลผลิตสูงสุดในสภาพดินปัจจุบันของคุณ
        </p>
      </div>

      <SoilInputForm />
    </div>
  )
}
