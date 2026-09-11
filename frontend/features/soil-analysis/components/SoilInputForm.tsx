"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, ArrowRight, Loader2, FlaskConical, Info, ScanLine, CheckCircle2, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { recommendPlants } from "@/lib/api"
import { SoilReportScanner } from "./SoilReportScanner"
import { RegionalSeasonPicker } from "@/features/environment/components/RegionalSeasonPicker"

interface SoilPreset {
  name: string
  desc: string
  nitrogen: number
  phosphorus: number
  potassium: number
  ph: number
}

const PRESETS: SoilPreset[] = [
  {
    name: "ดินนาลุ่มน้ำขัง (สำหรับข้าว)",
    desc: "N ปานกลาง, P พอเหมาะ, pH 6.0",
    nitrogen: 120,
    phosphorus: 45,
    potassium: 45,
    ph: 6.0,
  },
  {
    name: "ดินร่วนระบายน้ำดี (ข้าวโพด/ผัก)",
    desc: "N สูง, P สูง, K สมดุล, pH 6.5",
    nitrogen: 150,
    phosphorus: 65,
    potassium: 80,
    ph: 6.5,
  },
  {
    name: "ดินร่วนปนทรายทนแล้ง (มันสำปะหลัง/สับปะรด)",
    desc: "N ต่ำ, K สูงสะสมแป้ง, pH 5.5",
    nitrogen: 70,
    phosphorus: 35,
    potassium: 95,
    ph: 5.5,
  },
  {
    name: "ดินเปรี้ยวจัด/ดินกรด (Acidic Soil)",
    desc: "N ต่ำ, pH 4.2 ต่ำกว่าปกติ",
    nitrogen: 50,
    phosphorus: 20,
    potassium: 40,
    ph: 4.2,
  },
]

export function SoilInputForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"manual" | "ocr">("manual")
  const [autoFillSuccess, setAutoFillSuccess] = useState<string | null>(null)

  const [form, setForm] = useState({
    nitrogen: "120",
    phosphorus: "45",
    potassium: "50",
    ph: "6.2",
    province: "nakhon_ratchasima",
    season: "rainy",
    notes: "",
  })

  const handleOcrAutoFill = (data: {
    nitrogen: number
    phosphorus: number
    potassium: number
    ph: number
    notes?: string
  }) => {
    setForm((prev) => ({
      ...prev,
      nitrogen: data.nitrogen.toString(),
      phosphorus: data.phosphorus.toString(),
      potassium: data.potassium.toString(),
      ph: data.ph.toString(),
      notes: data.notes || "ข้อมูลจากการสแกน OCR",
    }))
    setActiveTab("manual")
    setAutoFillSuccess("สแกนเอกสารและนำเข้าค่าธาตุอาหาร N-P-K-pH เรียบร้อยแล้ว! ตรวจสอบข้อมูลและเริ่มวิเคราะห์ได้ทันที")
    if (error) setError(null)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) setError(null)
    if (autoFillSuccess) setAutoFillSuccess(null)
  }

  const applyPreset = (preset: SoilPreset) => {
    setForm((prev) => ({
      ...prev,
      nitrogen: preset.nitrogen.toString(),
      phosphorus: preset.phosphorus.toString(),
      potassium: preset.potassium.toString(),
      ph: preset.ph.toString(),
      notes: `ตัวอย่างข้อมูล: ${preset.name}`,
    }))
    if (error) setError(null)
    if (autoFillSuccess) setAutoFillSuccess(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const n = parseFloat(form.nitrogen)
    const p = parseFloat(form.phosphorus)
    const k = parseFloat(form.potassium)
    const phVal = parseFloat(form.ph)

    if (isNaN(n) || isNaN(p) || isNaN(k) || isNaN(phVal)) {
      setError("กรุณากรอกตัวเลขค่าธาตุอาหารให้ครบถ้วน")
      setLoading(false)
      return
    }

    if (phVal < 0 || phVal > 14) {
      setError("ค่า pH ต้องอยู่ระหว่าง 0 ถึง 14")
      setLoading(false)
      return
    }

    try {
      const result = await recommendPlants({
        nitrogen: n,
        phosphorus: p,
        potassium: k,
        ph: phVal,
        province: form.province || undefined,
        season: form.season || undefined,
        notes: form.notes || undefined,
      })

      // Store results in sessionStorage and transition to /results
      sessionStorage.setItem("plantResult", JSON.stringify(result))
      router.push("/results")
    } catch (err: any) {
      console.error(err)
      setError(err.message || "เกิดข้อผิดพลาดในการคำนวณ กรุณาลองใหม่อีกครั้ง")
    } finally {
      setLoading(false)
    }
  }

  const currentPhNumber = parseFloat(form.ph) || 7.0

  return (
    <div className="space-y-6">
      {/* Input Mode Switcher Tabs */}
      <div className="flex rounded-2xl bg-muted/60 p-1.5 gap-1.5 border border-emerald-950/10">
        <button
          type="button"
          onClick={() => setActiveTab("manual")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "manual"
              ? "bg-card text-foreground shadow-sm border border-emerald-950/5"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FlaskConical className="h-4 w-4 text-emerald-700" />
          <span>1. กรอกค่าตัวเลขด้วยตนเอง (Manual)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ocr")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "ocr"
              ? "bg-card text-foreground shadow-sm border border-emerald-950/5"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ScanLine className="h-4 w-4 text-emerald-700" />
          <span>2. สแกนผลตรวจดิน OCR (Smart Scanner)</span>
          <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300/60">
            Smart OCR
          </span>
        </button>
      </div>

      {autoFillSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2.5 animate-fade-in shadow-xs">
          <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
          <span>{autoFillSuccess}</span>
        </div>
      )}

      {activeTab === "ocr" ? (
        <SoilReportScanner onAutoFill={handleOcrAutoFill} />
      ) : (
        <>
          {/* Quick Presets Bento Grid */}
          <div className="rounded-2xl border border-emerald-950/10 bg-emerald-50/40 p-5">
            <div className="flex items-center gap-2 mb-3.5">
              <Sparkles className="h-4 w-4 text-emerald-700" />
              <h3 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider">
                ทดลองเลือกข้อมูลดินจำลอง (Click เพื่อใส่ค่าอัตโนมัติ)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {PRESETS.map((preset, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="text-left p-3.5 rounded-xl bg-card border border-emerald-950/10 hover:border-emerald-700 hover:shadow-md transition-smooth group active:scale-98"
                >
                  <p className="text-xs font-bold text-foreground group-hover:text-emerald-800 transition-colors">
                    {preset.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {preset.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Main Form Bento Card */}
          <form
            onSubmit={handleSubmit}
            className="bento-card p-6 sm:p-8 space-y-6"
          >
        <div className="border-b pb-4">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-emerald-600" />
            กรอกผลวิเคราะห์ทางเคมีของดิน (Soil Test Values)
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            ระบุปริมาณธาตุอาหารหลัก 3 ตัว (NPK) หน่วยเป็น mg/kg (ppm) และค่าความเป็นกรด-ด่าง (pH)
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 text-rose-800 dark:text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Input Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Nitrogen */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="nitrogen" className="text-xs font-bold text-foreground">
                ไนโตรเจน N (Nitrogen)
              </Label>
              <span className="text-[10px] text-muted-foreground font-mono">mg/kg</span>
            </div>
            <Input
              id="nitrogen"
              name="nitrogen"
              type="number"
              min="0"
              step="any"
              value={form.nitrogen}
              onChange={handleChange}
              placeholder="เช่น 120"
              required
              className="font-mono text-base focus-visible:ring-emerald-600"
            />
            <p className="text-[11px] text-muted-foreground">
              บำรุงการเจริญเติบโตของลำต้นและใบสีเขียว
            </p>
          </div>

          {/* Phosphorus */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="phosphorus" className="text-xs font-bold text-foreground">
                ฟอสฟอรัส P (Phosphorus)
              </Label>
              <span className="text-[10px] text-muted-foreground font-mono">mg/kg</span>
            </div>
            <Input
              id="phosphorus"
              name="phosphorus"
              type="number"
              min="0"
              step="any"
              value={form.phosphorus}
              onChange={handleChange}
              placeholder="เช่น 45"
              required
              className="font-mono text-base focus-visible:ring-emerald-600"
            />
            <p className="text-[11px] text-muted-foreground">
              เร่งการพัฒนาราก การสร้างตาดอก และเมล็ด
            </p>
          </div>

          {/* Potassium */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="potassium" className="text-xs font-bold text-foreground">
                โพแทสเซียม K (Potassium)
              </Label>
              <span className="text-[10px] text-muted-foreground font-mono">mg/kg</span>
            </div>
            <Input
              id="potassium"
              name="potassium"
              type="number"
              min="0"
              step="any"
              value={form.potassium}
              onChange={handleChange}
              placeholder="เช่น 50"
              required
              className="font-mono text-base focus-visible:ring-emerald-600"
            />
            <p className="text-[11px] text-muted-foreground">
              สะสมแป้งและน้ำตาล เพิ่มภูมิต้านทานโรค
            </p>
          </div>

          {/* pH */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="ph" className="text-xs font-bold text-foreground">
                ความเป็นกรด-ด่าง (Soil pH)
              </Label>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                {currentPhNumber < 5.5
                  ? "กรดจัด"
                  : currentPhNumber <= 7.0
                  ? "กรดอ่อน-กลาง (ดี)"
                  : "ด่าง"}
              </span>
            </div>
            <Input
              id="ph"
              name="ph"
              type="number"
              step="0.1"
              min="0"
              max="14"
              value={form.ph}
              onChange={handleChange}
              placeholder="เช่น 6.2"
              required
              className="font-mono text-base focus-visible:ring-emerald-600"
            />
            <p className="text-[11px] text-muted-foreground">
              ระดับ 5.5 - 7.0 เหมาะสมที่สุดสำหรับพืชส่วนใหญ่
            </p>
          </div>
        </div>

        {/* Regional & Seasonal Context (Phase 4) */}
        <div className="space-y-2 pt-2 border-t">
          <RegionalSeasonPicker
            selectedProvince={form.province}
            selectedSeason={form.season}
            onProvinceChange={(province) => setForm((prev) => ({ ...prev, province }))}
            onSeasonChange={(season) => setForm((prev) => ({ ...prev, season }))}
          />
        </div>

        {/* Optional notes */}
        <div className="space-y-2 pt-2 border-t">
          <Label htmlFor="notes" className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5" />
            บันทึกเพิ่มเติมหรือชื่อแปลงดิน (ทางเลือก)
          </Label>
          <Input
            id="notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="เช่น แปลงข้าวทุ่งกุลา แปลงที่ 2"
            className="text-sm focus-visible:ring-emerald-600"
          />
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="w-full bg-primary hover:bg-[#092918] text-primary-foreground font-extrabold py-6 rounded-2xl shadow-[0_4px_16px_rgba(14,61,36,0.2)] hover:shadow-[0_8px_24px_rgba(14,61,36,0.28)] text-base transition-all hover:scale-[1.01] active:scale-99"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-300" />
              กำลังประมวลผลตามเกณฑ์วิทยาศาสตร์...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              เริ่มวิเคราะห์และแนะนำพืชที่เหมาะสม
              <ArrowRight className="h-5 w-5" />
            </span>
          )}
        </Button>
      </form>
      </>
    )}
  </div>
)
}
