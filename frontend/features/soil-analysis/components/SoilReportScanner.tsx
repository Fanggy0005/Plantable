"use client"

import { useState, useRef } from "react"
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { extractOcrData } from "@/lib/api"
import type { OcrExtractedSoilData } from "@/types"

interface SoilReportScannerProps {
  onAutoFill: (data: {
    nitrogen: number
    phosphorus: number
    potassium: number
    ph: number
    organicMatter?: number | null
    notes?: string
  }) => void
}

interface SampleReport {
  id: string
  title: string
  source: string
  description: string
  text: string
}

const SAMPLE_REPORTS: SampleReport[] = [
  {
    id: "ldd",
    title: "ใบรายงานผลตรวจดิน กรมพัฒนาที่ดิน (LDD)",
    source: "กรมพัฒนาที่ดิน กระทรวงเกษตรและสหกรณ์",
    description: "ตัวอย่างดินแปลงนานครราชสีมา N: 135, P: 42.5, K: 68, pH: 6.2, OM: 2.1%",
    text: `
      ใบรายงานผลการตรวจวิเคราะห์ตัวอย่างดิน
      กรมพัฒนาที่ดิน กระทรวงเกษตรและสหกรณ์
      ชื่อเกษตรกร: นายมานะ ปลูกสุข
      สถานที่เก็บตัวอย่าง: ต.หนองสาหร่าย อ.ปากช่อง จ.นครราชสีมา
      
      รายการวิเคราะห์ (Parameter)        ผลวิเคราะห์ (Result)   หน่วย (Unit)
      ความเป็นกรด-ด่าง (Soil pH 1:1)       6.2
      ไนโตรเจนทั้งหมด (Total Nitrogen)     135.0                 mg/kg
      ฟอสฟอรัสที่เป็นประโยชน์ (Bray II)     42.5                  mg/kg
      โพแทสเซียมที่แลกเปลี่ยนได้ (Exch. K)   68.0                  mg/kg
      อินทรียวัตถุในดิน (Organic Matter)   2.1                   %
      ความชื้นของตัวอย่าง (Moisture)       12.4                  %
    `,
  },
  {
    id: "central-lab",
    title: "ผลตรวจทางเคมี Central Lab Thailand",
    source: "บริษัท ห้องปฏิบัติการกลาง (ประเทศไทย) จำกัด",
    description: "ดินแปลงปลูกพืชไร่/ผัก N: 85, P: 28, K: 55, pH: 5.75, OM: 1.45%",
    text: `
      CENTRAL AGRICULTURAL LABORATORY REPORT
      Sample ID: SL-2026-9081
      Client: ไร่เกษตรกรไทยก้าวหน้า
      
      Analytical Chemistry Results:
      Soil pH: 5.75
      Available N: 85.0 ppm
      Available P: 28.0 ppm
      Exchangeable K: 55.0 ppm
      Organic Matter: 1.45%
    `,
  },
  {
    id: "field-kit",
    title: "ผลตรวจชุดทดสอบดินภาคสนาม (Soil Test Kit)",
    source: "ชุดตรวจดินพกพา มหาวิทยาลัยเกษตรศาสตร์",
    description: "ดินเปรี้ยว/กรดจัด N: 60, P: 18, K: 40, pH: 4.8",
    text: `
      รายงานผลการตรวจดินด้วยชุดตรวจภาคสนาม (Field Test Kit)
      แปลงปลูก: แปลงที่ 3 สวนผลไม้ระยอง
      ค่า pH ของดิน: 4.8 (ดินเป็นกรดปานกลาง-จัด)
      ปริมาณไนโตรเจน (N): 60 mg/kg
      ปริมาณฟอสฟอรัส (P): 18 mg/kg
      ปริมาณโพแทสเซียม (K): 40 mg/kg
      อินทรียวัตถุ (OM): 1.1 %
    `,
  },
]

export function SoilReportScanner({ onAutoFill }: SoilReportScannerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [extractedData, setExtractedData] = useState<OcrExtractedSoilData | null>(null)

  // Editable fields after extraction
  const [editableValues, setEditableValues] = useState({
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    ph: "",
    organicMatter: "",
    notes: "",
  })

  const simulateProgress = () => {
    setScanProgress(15)
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval)
          return 90
        }
        return prev + 25
      })
    }, 150)
    return () => clearInterval(interval)
  }

  const handleScanSample = async (sample: SampleReport) => {
    setError(null)
    setLoading(true)
    setSelectedFile(null)
    const cleanupProgress = simulateProgress()

    try {
      const result = await extractOcrData({ text: sample.text, title: sample.title })
      setScanProgress(100)
      setExtractedData(result)
      setEditableValues({
        nitrogen: result.nitrogen?.toString() || "",
        phosphorus: result.phosphorus?.toString() || "",
        potassium: result.potassium?.toString() || "",
        ph: result.ph?.toString() || "",
        organicMatter: result.organicMatter?.toString() || "",
        notes: `สแกนจาก: ${sample.title}`,
      })
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการประมวลผล OCR")
    } finally {
      cleanupProgress()
      setLoading(false)
    }
  }

  const handleFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setError("ขนาดไฟล์เกิน 10MB กรุณาเลือกไฟล์ที่มีขนาดไม่เกินกำหนด")
      return
    }

    const validTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp"]
    if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("รองรับเฉพาะไฟล์ PDF, PNG, JPG และ JPEG เท่านั้น")
      return
    }

    setSelectedFile(file)
    setError(null)
    setLoading(true)
    const cleanupProgress = simulateProgress()

    try {
      const result = await extractOcrData({ file, title: file.name })
      setScanProgress(100)
      setExtractedData(result)
      setEditableValues({
        nitrogen: result.nitrogen?.toString() || "",
        phosphorus: result.phosphorus?.toString() || "",
        potassium: result.potassium?.toString() || "",
        ph: result.ph?.toString() || "",
        organicMatter: result.organicMatter?.toString() || "",
        notes: `สแกนจากไฟล์: ${file.name}`,
      })
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการสแกนไฟล์ กรุณาลองใหม่อีกครั้ง")
    } finally {
      cleanupProgress()
      setLoading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleApplyToForm = () => {
    const n = parseFloat(editableValues.nitrogen)
    const p = parseFloat(editableValues.phosphorus)
    const k = parseFloat(editableValues.potassium)
    const ph = parseFloat(editableValues.ph)
    const om = editableValues.organicMatter ? parseFloat(editableValues.organicMatter) : null

    if (isNaN(n) || isNaN(p) || isNaN(k) || isNaN(ph)) {
      setError("กรุณาตรวจสอบว่ากรอกตัวเลข N, P, K และ pH ครบถ้วนถูกต้อง")
      return
    }

    onAutoFill({
      nitrogen: n,
      phosphorus: p,
      potassium: k,
      ph,
      organicMatter: om,
      notes: editableValues.notes,
    })
  }

  return (
    <div className="space-y-6">
      {/* Sample Reports Quick Picker */}
      <div className="rounded-2xl border border-emerald-200/70 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/30 p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
          <h3 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">
            ทดลองสแกนเอกสารตัวอย่าง (คลิกเพื่อทดสอบ OCR ทันที)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {SAMPLE_REPORTS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              disabled={loading}
              onClick={() => handleScanSample(sample)}
              className="text-left p-3.5 rounded-xl bg-card border border-border/80 hover:border-emerald-600 hover:shadow-sm transition-all group disabled:opacity-50"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-bold text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                  {sample.title}
                </p>
                <FileText className="h-3.5 w-3.5 text-muted-foreground group-hover:text-emerald-600 shrink-0" />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                {sample.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Upload Dropzone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
          dragActive
            ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 scale-[1.005]"
            : "border-border hover:border-emerald-500 bg-card hover:bg-muted/40"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0])
            }
          }}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shadow-xs">
            {selectedFile?.type.includes("pdf") ? (
              <FileText className="h-6 w-6" />
            ) : selectedFile ? (
              <ImageIcon className="h-6 w-6" />
            ) : (
              <UploadCloud className="h-6 w-6" />
            )}
          </div>

          <div>
            <p className="text-sm font-bold text-foreground">
              {selectedFile ? selectedFile.name : "ลากไฟล์รายงานผลตรวจดินมาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              รองรับไฟล์ PDF, PNG, JPG, JPEG (ขนาดไม่เกิน 10MB)
            </p>
          </div>

          <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-lg">
            <span>สแกนค่า N, P, K, pH และอินทรียวัตถุอัตโนมัติ</span>
          </div>
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-background/90 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-6 animate-fade-in">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-3" />
            <p className="text-sm font-bold text-foreground">กำลังประมวลผลและสกัดข้อมูลจากรายงาน...</p>
            <div className="w-48 bg-muted rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5 font-mono">{scanProgress}%</p>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 text-rose-800 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Extracted Data Review & Verification Card */}
      {extractedData && (
        <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-6 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-md mb-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                สกัดข้อมูลสำเร็จ (ความมั่นใจเฉลี่ย {Math.round(extractedData.confidence.overall * 100)}%)
              </div>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
                ตรวจสอบและแก้ไขค่าที่สกัดได้ก่อนส่งวิเคราะห์
              </h3>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setExtractedData(null)
                setSelectedFile(null)
              }}
              className="text-xs"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              สแกนเอกสารอื่น
            </Button>
          </div>

          {/* Editable Parameters Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* N */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="ocr-n" className="text-xs font-bold text-foreground">
                  ไนโตรเจน (N)
                </Label>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                  {Math.round(extractedData.confidence.nitrogen * 100)}% Match
                </span>
              </div>
              <Input
                id="ocr-n"
                type="number"
                step="any"
                value={editableValues.nitrogen}
                onChange={(e) => setEditableValues({ ...editableValues, nitrogen: e.target.value })}
                placeholder="mg/kg"
                className="font-mono text-base focus-visible:ring-emerald-600"
              />
              <span className="text-[10px] text-muted-foreground">หน่วย: mg/kg (ppm)</span>
            </div>

            {/* P */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="ocr-p" className="text-xs font-bold text-foreground">
                  ฟอสฟอรัส (P)
                </Label>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                  {Math.round(extractedData.confidence.phosphorus * 100)}% Match
                </span>
              </div>
              <Input
                id="ocr-p"
                type="number"
                step="any"
                value={editableValues.phosphorus}
                onChange={(e) => setEditableValues({ ...editableValues, phosphorus: e.target.value })}
                placeholder="mg/kg"
                className="font-mono text-base focus-visible:ring-emerald-600"
              />
              <span className="text-[10px] text-muted-foreground">หน่วย: mg/kg (ppm)</span>
            </div>

            {/* K */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="ocr-k" className="text-xs font-bold text-foreground">
                  โพแทสเซียม (K)
                </Label>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                  {Math.round(extractedData.confidence.potassium * 100)}% Match
                </span>
              </div>
              <Input
                id="ocr-k"
                type="number"
                step="any"
                value={editableValues.potassium}
                onChange={(e) => setEditableValues({ ...editableValues, potassium: e.target.value })}
                placeholder="mg/kg"
                className="font-mono text-base focus-visible:ring-emerald-600"
              />
              <span className="text-[10px] text-muted-foreground">หน่วย: mg/kg (ppm)</span>
            </div>

            {/* pH */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="ocr-ph" className="text-xs font-bold text-foreground">
                  ความเป็นกรด-ด่าง (pH)
                </Label>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                  {Math.round(extractedData.confidence.ph * 100)}% Match
                </span>
              </div>
              <Input
                id="ocr-ph"
                type="number"
                step="0.1"
                value={editableValues.ph}
                onChange={(e) => setEditableValues({ ...editableValues, ph: e.target.value })}
                placeholder="0 - 14"
                className="font-mono text-base focus-visible:ring-emerald-600"
              />
              <span className="text-[10px] text-muted-foreground">ช่วง 0 ถึง 14</span>
            </div>
          </div>

          {/* Optional Organic Matter & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
            <div className="space-y-1.5">
              <Label htmlFor="ocr-om" className="text-xs font-medium text-muted-foreground">
                อินทรียวัตถุในดิน (OM %) (ทางเลือก)
              </Label>
              <Input
                id="ocr-om"
                type="number"
                step="0.01"
                value={editableValues.organicMatter}
                onChange={(e) => setEditableValues({ ...editableValues, organicMatter: e.target.value })}
                placeholder="เช่น 2.1"
                className="text-sm font-mono focus-visible:ring-emerald-600"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ocr-notes" className="text-xs font-medium text-muted-foreground">
                บันทึกระบุแหล่งที่มา
              </Label>
              <Input
                id="ocr-notes"
                value={editableValues.notes}
                onChange={(e) => setEditableValues({ ...editableValues, notes: e.target.value })}
                placeholder="ระบุชื่อแปลงหรือรหัสตัวอย่าง"
                className="text-sm focus-visible:ring-emerald-600"
              />
            </div>
          </div>

          {/* Action Button: Auto-Fill & Analyze */}
          <Button
            type="button"
            size="lg"
            onClick={handleApplyToForm}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 rounded-xl shadow-xs text-base transition-all hover:scale-[1.01]"
          >
            <span className="flex items-center justify-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              นำข้อมูลชุดนี้ไปใส่ในฟอร์มวิเคราะห์ดิน
              <ArrowRight className="h-5 w-5" />
            </span>
          </Button>
        </div>
      )}
    </div>
  )
}
