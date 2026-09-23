import { Metadata } from "next"
import { AnalyticsDashboard } from "@/features/analytics/components/AnalyticsDashboard"

export const metadata: Metadata = {
  title: "สถิติและแดชบอร์ดสุขภาพดิน | Plantable",
  description: "แดชบอร์ดข้อมูลความอุดมสมบูรณ์ของดิน ปริมาณธาตุอาหารเฉลี่ย และสถิติพืชเศรษฐกิจยอดนิยมทั่วประเทศไทย",
}

export default function AnalyticsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <AnalyticsDashboard />
    </div>
  )
}
