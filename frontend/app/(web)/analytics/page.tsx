import { Metadata } from "next"
import { AnalyticsDashboard } from "@/features/analytics/components/AnalyticsDashboard"

export const metadata: Metadata = {
  title: "สถิติและแดชบอร์ดสุขภาพดิน | Plantable",
  description: "แดชบอร์ดข้อมูลความอุดมสมบูรณ์ของดิน ปริมาณธาตุอาหารเฉลี่ย และสถิติพืชเศรษฐกิจยอดนิยมทั่วประเทศไทย",
}

export default function AnalyticsPage() {
  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 sm:px-6">
      <AnalyticsDashboard />
    </div>
  )
}
