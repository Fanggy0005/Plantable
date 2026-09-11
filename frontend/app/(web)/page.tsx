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
    <div className="flex flex-col items-center w-full animate-fade-in">
      {/* Inverted Deep Forest Hero Section */}
      <section className="w-full relative overflow-hidden py-20 sm:py-28 bg-[#071e12] bg-forest-gradient text-white border-b border-emerald-950/80">
        {/* Ambient subtle light glow & grid background */}
        <div className="absolute inset-0 bg-subtle-grid-dark opacity-30 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 text-center space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/70 px-4 py-1.5 text-xs font-semibold text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)] backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>ระบบประเมินความเหมาะสมของดินระดับมืออาชีพ (Rule-based Agronomy)</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.12]">
            วิเคราะห์ดินอย่างแม่นยำ <br />
            <span className="bg-clip-text text-transparent bg-linear-to-r from-emerald-300 via-teal-200 to-emerald-400 drop-shadow-xs">
              ปลูกพืชได้ผลผลิตสูงสุด
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-emerald-100/80 leading-relaxed font-normal">
            เปลี่ยนตัวเลขค่าแล็บ ไนโตรเจน (N), ฟอสฟอรัส (P), โพแทสเซียม (K) และ pH ให้เป็นคำแนะนำพืชที่เหมาะสมและแนวทางปรับปรุงดินตามหลักปฐพีวิทยาที่พิสูจน์ได้
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/analyze">
              <Button
                size="lg"
                className="bg-white hover:bg-emerald-50 text-[#071e12] font-extrabold px-8 py-6 rounded-2xl text-base shadow-[0_4px_24px_rgba(255,255,255,0.22)] transition-all hover:scale-105 active:scale-98"
              >
                เริ่มวิเคราะห์ดินทันที
                <ArrowRight className="ml-2 h-5 w-5 text-emerald-800" />
              </Button>
            </Link>
            <Link href="/crops">
              <Button
                size="lg"
                variant="outline"
                className="border-emerald-500/40 bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-100 font-semibold px-7 py-6 rounded-2xl text-base transition-all backdrop-blur-xs hover:text-white hover:border-emerald-400"
              >
                <Compass className="mr-2 h-5 w-5 text-emerald-400" />
                ดูฐานข้อมูลพืช 12 ชนิด
              </Button>
            </Link>
          </div>

          {/* Trust Metrics Pill Bar */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-emerald-200/70 border-t border-emerald-900/60 max-w-3xl mx-auto">
            <span className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-900/80 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="h-3 w-3" />
              </div>
              เกณฑ์คำนวณตามหลักวิชาการ
            </span>
            <span className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-900/80 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="h-3 w-3" />
              </div>
              ไม่มีการสุ่ม (Deterministic)
            </span>
            <span className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-900/80 text-emerald-300 border border-emerald-500/30">
                <Sprout className="h-3 w-3" />
              </div>
              แนะนำปุ๋ยและปูนปรับสภาพ
            </span>
          </div>
        </div>
      </section>

      {/* Crisp White Canvas Body with Bento Grid Layout */}
      <section className="w-full py-20 bg-background bg-subtle-grid">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-3 py-1 text-xs font-bold text-emerald-900">
              <Sprout className="h-3.5 w-3.5 text-emerald-700" />
              WORKFLOW OVERVIEW
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              ออกแบบเพื่อการเกษตรกรรมยุคใหม่
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              3 ขั้นตอนง่ายๆ ที่ทำให้การตัดสินใจเลือกปลูกพืชมีหลักการทางวิทยาศาสตร์และลดความเสี่ยงการลงทุน
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bento-card p-7 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-primary shadow-xs">
                <TestTube2 className="h-6 w-6 text-emerald-700" />
              </div>
              <h3 className="text-xl font-bold text-foreground tracking-tight">1. กรอกค่า NPK และ pH</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                ระบุตัวเลขธาตุอาหารจากการตรวจดิน สแกนใบผลตรวจด้วย Smart OCR หรือคลิกเลือกตัวอย่างดินจำลองเพื่อทดสอบระบบได้ทันที
              </p>
              <div className="pt-2 text-xs font-bold text-emerald-800 flex items-center gap-1">
                รองรับผลแล็บ & ชุดตรวจพกพา →
              </div>
            </div>

            <div className="bento-card p-7 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-primary shadow-xs">
                <BarChart3 className="h-6 w-6 text-emerald-700" />
              </div>
              <h3 className="text-xl font-bold text-foreground tracking-tight">2. ประเมินด้วยเรดาร์กราฟ</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                แสดงภาพกราฟสมดุลธาตุอาหาร 4 มิติ และสเกลความเป็นกรด-ด่างแบบละเอียด เทียบกับระดับความต้องการจำเพาะของพืช
              </p>
              <div className="pt-2 text-xs font-bold text-emerald-800 flex items-center gap-1">
                สูตรคำนวณมาตรฐาน NPK-pH →
              </div>
            </div>

            <div className="bento-card p-7 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-primary shadow-xs">
                <Sprout className="h-6 w-6 text-emerald-700" />
              </div>
              <h3 className="text-xl font-bold text-foreground tracking-tight">3. รับผลจัดอันดับและวิธีแก้</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                พืชที่เหมาะสมจะถูกจัดอันดับคะแนน (0-100) พร้อมสูตรปุ๋ยเคมี สูตรปุ๋ยอินทรีย์ และอัตราการใส่ปูนเพื่อปรับสภาพดิน
              </p>
              <div className="pt-2 text-xs font-bold text-emerald-800 flex items-center gap-1">
                แผนปรับปรุงดินครบวงจร →
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Executive Dark Forest CTA Card */}
      <section className="w-full max-w-6xl px-4 sm:px-6 pb-24">
        <div className="rounded-3xl bg-[#071e12] bg-forest-gradient text-white p-8 sm:p-14 shadow-xl border border-emerald-900/60 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          {/* Subtle glow accent */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-3 max-w-xl z-10">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-900/80 border border-emerald-500/30 px-3 py-0.5 text-xs font-bold text-emerald-300">
              FAST & DETERMINISTIC
            </div>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              พร้อมวิเคราะห์ดินแปลงของคุณแล้วหรือยัง?
            </h3>
            <p className="text-emerald-100/80 text-sm sm:text-base leading-relaxed">
              กรอกค่าดินของคุณตอนนี้ ระบบประมวลผลทันทีในเสี้ยววินาที ไม่ต้องรอคิวและไม่มีค่าใช้จ่าย
            </p>
          </div>

          <Link href="/analyze" className="z-10 shrink-0">
            <Button
              size="lg"
              className="bg-white hover:bg-emerald-50 text-[#071e12] font-black px-8 py-6 rounded-2xl shadow-[0_4px_20px_rgba(255,255,255,0.2)] text-base transition-all hover:scale-105 active:scale-98"
            >
              เริ่มทดสอบดินฟรี
              <ArrowRight className="ml-2 h-5 w-5 text-emerald-800" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
