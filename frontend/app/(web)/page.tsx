import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center px-4 space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">🌱 Plantable</h1>
        <p className="text-lg text-muted-foreground max-w-md">
          วิเคราะห์คุณภาพดินและค้นหาพืชที่เหมาะสมที่สุดสำหรับการเพาะปลูกของคุณ
        </p>
      </div>

      <div className="flex gap-4">
        <Link href="/analyze">
          <Button>เริ่มวิเคราะห์ดิน</Button>
        </Link>
        <Link href="/login">
          <Button variant="outline">เข้าสู่ระบบ</Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6 max-w-lg mt-8">
        <div className="space-y-1">
          <p className="text-2xl">🧪</p>
          <p className="font-medium text-sm">วิเคราะห์ NPK & pH</p>
          <p className="text-xs text-muted-foreground">กรอกค่าดินแล้วรับผลทันที</p>
        </div>
        <div className="space-y-1">
          <p className="text-2xl">🌾</p>
          <p className="font-medium text-sm">แนะนำพืช 10 ชนิด</p>
          <p className="text-xs text-muted-foreground">จัดอันดับตามความเหมาะสม</p>
        </div>
        <div className="space-y-1">
          <p className="text-2xl">📋</p>
          <p className="font-medium text-sm">บันทึกประวัติ</p>
          <p className="text-xs text-muted-foreground">ดูผลวิเคราะห์ย้อนหลัง</p>
        </div>
      </div>
    </div>
  )
}
