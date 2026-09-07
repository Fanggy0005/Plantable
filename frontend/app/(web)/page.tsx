import Link from "next/link"
import {
  Sprout,
  ArrowRight,
  TestTube2,
  Compass,
  Sparkles,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex flex-col items-center animate-fade-in-up">
      {/* Hero Section */}
      <section className="w-full relative overflow-hidden py-16 sm:py-24 border-b bg-linear-to-b from-emerald-50/60 via-background to-background dark:from-emerald-950/20 dark:via-background dark:to-background">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300 shadow-xs">
            <Sparkles className="h-3.5 w-3.5" />
            ระบบประเมินความเหมาะสมของดินระดับมืออาชีพ (Rule-based Agronomy)
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            วิเคราะห์ดินอย่างแม่นยำ <br />
            <span className="text-primary bg-clip-text text-transparent bg-linear-to-r from-emerald-700 via-emerald-800 to-teal-900 dark:from-emerald-400 dark:to-teal-300">
              ปลูกพืชได้ผลผลิตสูงสุด
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            เปลี่ยนตัวเลขค่าแล็บ ไนโตรเจน (N), ฟอสฟอรัส (P), โพแทสเซียม (K) และ pH ให้เป็นคำแนะนำพืชที่เหมาะสมและแนวทางปรับปรุงดินตามหลักปฐพีวิทยาที่พิสูจน์ได้
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <Link href="/analyze">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-7 py-6 rounded-xl text-base shadow-md transition-all hover:scale-105"
              >
                เริ่มวิเคราะห์ดินทันที
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/crops">
              <Button
                size="lg"
                variant="outline"
                className="border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-foreground font-semibold px-6 py-6 rounded-xl text-base transition-all"
              >
                <Compass className="mr-2 h-5 w-5 text-emerald-600" />
                ดูฐานข้อมูลพืช 12 ชนิด
              </Button>
            </Link>
          </div>

          {/* Trust Metrics */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-muted-foreground border-t border-border/50 max-w-2xl mx-auto">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              เกณฑ์คำนวณตามหลักวิชาการ
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ไม่มีการสุ่ม (Deterministic)
            </span>
            <span className="flex items-center gap-1.5">
              <Sprout className="h-4 w-4 text-emerald-600" />
              แนะนำปุ๋ยและปูนปรับสภาพ
            </span>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="w-full py-16 max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            ออกแบบเพื่อการเกษตรกรรมยุคใหม่
          </h2>
          <p className="text-sm text-muted-foreground">
            3 ขั้นตอนง่ายๆ ที่ทำให้การตัดสินใจเลือกปลูกพืชมีหลักการและลดความเสี่ยง
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border bg-card p-6 shadow-xs hover-lift space-y-3">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-primary">
              <TestTube2 className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-foreground">1. กรอกค่า NPK และ pH</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              ระบุตัวเลขธาตุอาหารจากการตรวจดิน หรือกดเลือกดินตัวอย่างจำลองเพื่อทดสอบระบบได้ทันที
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-xs hover-lift space-y-3">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-primary">
              <BarChart3 className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-foreground">2. ประเมินด้วยเรดาร์กราฟ</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              แสดงภาพกราฟสมดุลธาตุอาหาร 4 มิติ และสเกลความเป็นกรด-ด่างเทียบกับความต้องการของพืช
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-xs hover-lift space-y-3">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-primary">
              <Sprout className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-foreground">3. รับผลจัดอันดับและวิธีแก้</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              พืชที่เหมาะสมจะถูกจัดอันดับคะแนน (0-100) พร้อมเหตุผลและวิธีใส่ปุ๋ย/ปูนปรับปรุงดิน
            </p>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="w-full max-w-5xl px-4 sm:px-6 pb-20">
        <div className="rounded-3xl bg-primary text-primary-foreground p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="space-y-2 max-w-lg z-10">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
              พร้อมวิเคราะห์ดินแปลงของคุณแล้วหรือยัง?
            </h3>
            <p className="text-emerald-100/80 text-sm leading-relaxed">
              กรอกค่าดินของคุณตอนนี้ ระบบประมวลผลทันทีในเสี้ยววินาที ไม่ต้องรอคิว
            </p>
          </div>

          <Link href="/analyze" className="z-10 shrink-0">
            <Button
              size="lg"
              className="bg-white hover:bg-emerald-50 text-emerald-950 font-bold px-8 py-6 rounded-xl shadow-md text-base transition-transform hover:scale-105"
            >
              เริ่มทดสอบดินฟรี
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>

          {/* Decorative background element */}
          <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-emerald-800/30 blur-2xl pointer-events-none" />
        </div>
      </section>
    </div>
  )
}
