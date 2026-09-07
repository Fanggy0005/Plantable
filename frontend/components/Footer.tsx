import Link from "next/link"
import { Sprout, ShieldCheck } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-card text-card-foreground py-10 mt-auto">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white">
                <Sprout className="h-4 w-4" />
              </div>
              <span className="font-bold text-base text-foreground">Plantable</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              ระบบแนะนำพืชตามค่าวิเคราะห์ดินทางวิทยาศาสตร์ ประมวลผลด้วยเกณฑ์เกษตรกรรมมาตรฐานแม่นยำ (Deterministic Rule-based) ปราศจากการสุ่ม
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3 text-foreground">เมนูลัด</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/analyze" className="hover:text-primary transition-colors">
                  วิเคราะห์ผลทดสอบดิน (NPK & pH)
                </Link>
              </li>
              <li>
                <Link href="/crops" className="hover:text-primary transition-colors">
                  ฐานข้อมูลความต้องการของพืช 12 ชนิด
                </Link>
              </li>
              <li>
                <Link href="/history" className="hover:text-primary transition-colors">
                  ประวัติการทดสอบดินย้อนหลัง
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3 text-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              หลักการทำงาน
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              เครื่องมือประเมินระดับความเหมาะสม (Suitability Score 0-100) คำนวณจากน้ำหนัก ไนโตรเจน (30%), ฟอสฟอรัส (20%), โพแทสเซียม (20%), และ pH (30%) พร้อมคำแนะนำการปรับปรุงดินตามหลักปฐพีวิทยา
            </p>
          </div>
        </div>

        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-2">
          <p>© 2026 Plantable. Soil Recommendation System. Phase 1 MVP.</p>
          <div className="flex items-center gap-4">
            <span>Next.js 16</span>
            <span>•</span>
            <span>ElysiaJS</span>
            <span>•</span>
            <span>PostgreSQL</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
