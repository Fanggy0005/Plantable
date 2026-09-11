import { Metadata } from "next"
import { AnalyticsDashboard } from "@/features/analytics/components/AnalyticsDashboard"

export const metadata: Metadata = {
  title: "สถิติและแดชบอร์ดสุขภาพดิน | Plantable",
  description: "แดชบอร์ดข้อมูลความอุดมสมบูรณ์ของดิน ปริมาณธาตุอาหารเฉลี่ย และสถิติพืชเศรษฐกิจยอดนิยมทั่วประเทศไทย",
}

export default function AnalyticsPage() {
  return (
    <div className="w-full bg-background bg-subtle-grid min-h-[calc(100vh-4rem)]">
      <div className="container max-w-6xl mx-auto py-10 px-4 sm:px-6 animate-fade-in">
        <AnalyticsDashboard />
      </div>
    </div>
  )
}
