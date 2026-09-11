import Link from "next/link"
import { Sprout, ShieldCheck } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-emerald-950/80 bg-[#071e12] text-white py-14 mt-auto">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-900/90 border border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                <Sprout className="h-4 w-4 text-emerald-300" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">Plantable</span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-100/70 leading-relaxed max-w-sm">
              ระบบแนะนำพืชตามค่าวิเคราะห์ดินทางวิทยาศาสตร์ ประมวลผลด้วยเกณฑ์เกษตรกรรมมาตรฐานแม่นยำ (Deterministic Rule-based) ปราศจากการสุ่ม
            </p>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-3.5 text-white tracking-wide uppercase text-xs text-emerald-400">
              เมนูลัด & บริการ
            </h4>
            <ul className="space-y-2.5 text-sm text-emerald-100/75">
              <li>
                <Link href="/analyze" className="hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500 text-xs">›</span> วิเคราะห์ผลทดสอบดิน (NPK & pH)
                </Link>
              </li>
              <li>
                <Link href="/crops" className="hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500 text-xs">›</span> ฐานข้อมูลความต้องการของพืช 12 ชนิด
                </Link>
              </li>
              <li>
                <Link href="/history" className="hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500 text-xs">›</span> ประวัติการทดสอบดินย้อนหลัง
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500 text-xs">›</span> แดชบอร์ดสถิติ & กราฟ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-3.5 text-white flex items-center gap-1.5 uppercase text-xs text-emerald-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              หลักการทำงาน
            </h4>
            <p className="text-xs text-emerald-100/70 leading-relaxed">
              เครื่องมือประเมินระดับความเหมาะสม (Suitability Score 0-100) คำนวณจากน้ำหนัก ไนโตรเจน (30%), ฟอสฟอรัส (20%), โพแทสเซียม (20%), และ pH (30%) พร้อมคำแนะนำการปรับปรุงดินตามหลักปฐพีวิทยา
            </p>
          </div>
        </div>

        <div className="border-t border-emerald-900/60 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-200/60 gap-3">
          <p>© 2026 Plantable. Soil Recommendation System. Designed for modern agriculture.</p>
          <div className="flex items-center gap-4 text-emerald-300/80 font-mono text-[11px]">
            <span>Next.js 16</span>
            <span>•</span>
            <span>Tailwind v4</span>
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
