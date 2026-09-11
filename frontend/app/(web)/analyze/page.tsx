import { SoilInputForm } from "@/features/soil-analysis/components/SoilInputForm"
import { TestTube2 } from "lucide-react"

export default function AnalyzePage() {
  return (
    <div className="w-full bg-background bg-subtle-grid min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 sm:py-14 animate-fade-in">
        <div className="mb-8 space-y-2.5 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-3 py-1 text-xs font-bold text-emerald-900 shadow-xs">
            <TestTube2 className="h-3.5 w-3.5 text-emerald-700" />
            <span>SOIL NUTRITION ANALYSIS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            วิเคราะห์ธาตุอาหารและพืชที่เหมาะสม
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
            กรอกผลการตรวจตัวอย่างดินจากห้องปฏิบัติการ หรือใช้ชุดตรวจดินพกพา (Test Kit) เพื่อค้นหาชนิดพืชที่ให้ผลผลิตสูงสุดในสภาพดินปัจจุบันของคุณ
          </p>
        </div>

        <SoilInputForm />
      </div>
    </div>
  )
}
