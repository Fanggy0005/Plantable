"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { toast } from "sonner"
import {
  AlertCircle,
  ArrowRight,
  Check,
  FileText,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  UploadCloud,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { EASE_OUT } from "@/components/motion"
import { extractOcrData } from "@/lib/api"
import { useT } from "@/lib/i18n"
import { commonMessages } from "@/lib/i18n/messages/common"
import { cn } from "@/lib/utils"
import type { OcrExtractedSoilData } from "@/types"
import { soilAnalysisMessages } from "../messages"

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
  /** Title sent to the OCR API (data, not UI copy) */
  title: string
  values: string
  text: string
}

const SAMPLE_REPORTS: SampleReport[] = [
  {
    id: "ldd",
    title: "ใบรายงานผลตรวจดิน กรมพัฒนาที่ดิน (LDD)",
    values: "N 135 · P 42.5 · K 68 · pH 6.2",
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
    values: "N 85 · P 28 · K 55 · pH 5.75",
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
    values: "N 60 · P 18 · K 40 · pH 4.8",
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

const fieldClass =
  "h-11 rounded-xl border-input bg-card px-3.5 shadow-xs hover:border-primary/30 focus-visible:border-primary"

function confidenceVariant(c: number): "success" | "warning" | "destructive" {
  if (c >= 0.85) return "success"
  if (c >= 0.6) return "warning"
  return "destructive"
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function SoilReportScanner({ onAutoFill }: SoilReportScannerProps) {
  const t = useT(soilAnalysisMessages)
  const c = useT(commonMessages)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [extractedData, setExtractedData] = useState<OcrExtractedSoilData | null>(null)
  const [scanningSampleId, setScanningSampleId] = useState<string | null>(null)

  // Editable fields after extraction
  const [editableValues, setEditableValues] = useState({
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    ph: "",
    organicMatter: "",
    notes: "",
  })

  // Image thumbnail for the selected file
  const previewUrl = useMemo(
    () => (selectedFile?.type.startsWith("image/") ? URL.createObjectURL(selectedFile) : null),
    [selectedFile]
  )
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

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
    setScanningSampleId(sample.id)
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
        notes: t.scanner.review.scannedFromSample(t.scanner.samples[sample.id]?.title ?? sample.title),
      })
      toast.success(t.scanner.successToast)
    } catch (err) {
      const message = (err instanceof Error && err.message) || t.scanner.errors.failed
      setError(message)
      toast.error(t.scanner.errorToast, { description: message })
    } finally {
      cleanupProgress()
      setLoading(false)
      setScanningSampleId(null)
    }
  }

  const handleFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setError(t.scanner.errors.tooLarge)
      toast.error(t.scanner.errors.tooLarge)
      return
    }

    const validTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp"]
    if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith(".pdf")) {
      setError(t.scanner.errors.badType)
      toast.error(t.scanner.errors.badType)
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
        notes: t.scanner.review.scannedFromFile(file.name),
      })
      toast.success(t.scanner.successToast)
    } catch (err) {
      const message = (err instanceof Error && err.message) || t.scanner.errors.failed
      setError(message)
      toast.error(t.scanner.errorToast, { description: message })
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
      setError(t.scanner.errors.incomplete)
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

  const resetScan = () => {
    setExtractedData(null)
    setSelectedFile(null)
    setError(null)
    setScanProgress(0)
  }

  const scanStep = scanProgress < 40 ? 0 : scanProgress < 85 ? 1 : 2

  const reviewFields = extractedData
    ? ([
        { key: "nitrogen", id: "ocr-n", label: `N · ${c.nutrients.nitrogen}`, unit: c.units.mgPerKg, step: "any", conf: extractedData.confidence.nitrogen },
        { key: "phosphorus", id: "ocr-p", label: `P · ${c.nutrients.phosphorus}`, unit: c.units.mgPerKg, step: "any", conf: extractedData.confidence.phosphorus },
        { key: "potassium", id: "ocr-k", label: `K · ${c.nutrients.potassium}`, unit: c.units.mgPerKg, step: "any", conf: extractedData.confidence.potassium },
        { key: "ph", id: "ocr-ph", label: c.nutrients.ph, unit: "pH", step: "0.1", conf: extractedData.confidence.ph },
      ] as const)
    : []

  return (
    <div className="space-y-5">
      <AnimatePresence mode="wait" initial={false}>
        {!extractedData ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
            className="space-y-5"
          >
            {/* Dropzone */}
            <div
              role="button"
              tabIndex={0}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !loading && fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && !loading) {
                  e.preventDefault()
                  fileInputRef.current?.click()
                }
              }}
              className={cn(
                "relative overflow-hidden rounded-2xl p-6 text-center transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/30 sm:p-10",
                dragActive ? "bg-secondary" : "bg-card hover:bg-muted/50"
              )}
            >
              {/* Animated dashed border */}
              <svg className="pointer-events-none absolute inset-0 size-full" aria-hidden>
                <motion.rect
                  x="1"
                  y="1"
                  rx="16"
                  ry="16"
                  fill="none"
                  strokeWidth={dragActive ? 2 : 1.5}
                  strokeDasharray="8 7"
                  style={{ width: "calc(100% - 2px)", height: "calc(100% - 2px)" }}
                  className={cn("transition-colors", dragActive ? "stroke-primary" : "stroke-border")}
                  animate={dragActive ? { strokeDashoffset: [0, -30] } : { strokeDashoffset: 0 }}
                  transition={dragActive ? { duration: 0.8, repeat: Infinity, ease: "linear" } : { duration: 0 }}
                />
              </svg>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFile(e.target.files[0])
                  }
                  e.target.value = ""
                }}
              />

              <div className="relative flex flex-col items-center gap-4">
                <motion.div
                  animate={dragActive ? { y: -6, scale: 1.08 } : { y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="relative"
                >
                  {previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewUrl}
                      alt={selectedFile?.name ?? ""}
                      className="size-20 rounded-xl object-cover shadow-(--shadow-card) ring-1 ring-border"
                    />
                  ) : (
                    <span className="flex size-16 items-center justify-center rounded-2xl bg-secondary text-primary">
                      {selectedFile?.type.includes("pdf") ? (
                        <FileText className="size-7" />
                      ) : selectedFile ? (
                        <ImageIcon className="size-7" />
                      ) : (
                        <UploadCloud className="size-7" />
                      )}
                    </span>
                  )}
                </motion.div>

                <div className="space-y-1">
                  {selectedFile ? (
                    <>
                      <p className="max-w-full truncate text-sm font-semibold text-foreground sm:text-base">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatBytes(selectedFile.size)}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-base font-semibold text-foreground">
                        {dragActive ? t.scanner.dropActive : t.scanner.dropTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">{t.scanner.dropFormats}</p>
                    </>
                  )}
                </div>

                {!dragActive && (
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="h-px w-8 bg-border" />
                    {t.scanner.dropOr}
                    <span className="h-px w-8 bg-border" />
                  </div>
                )}
                {!dragActive && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 rounded-xl px-4"
                    disabled={loading}
                    onClick={(e) => {
                      e.stopPropagation()
                      fileInputRef.current?.click()
                    }}
                  >
                    <UploadCloud />
                    {t.scanner.browse}
                  </Button>
                )}
              </div>

              {/* Scanning overlay */}
              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-card/95 p-6 backdrop-blur-sm"
                  >
                    {/* Scan line */}
                    <motion.div
                      className="pointer-events-none absolute inset-x-0 h-16 bg-linear-to-b from-transparent via-primary/10 to-transparent"
                      initial={{ top: "-15%" }}
                      animate={{ top: ["-15%", "100%"] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <div className="relative w-full max-w-xs space-y-4">
                      <div className="flex items-center justify-center gap-2 text-sm font-semibold text-foreground">
                        <Loader2 className="size-4 animate-spin text-primary" />
                        {t.scanner.scanning}
                      </div>
                      <div className="relative overflow-hidden rounded-full">
                        <Progress value={scanProgress} aria-label={t.scanner.scanning} />
                        <motion.span
                          className="pointer-events-none absolute inset-y-0 w-1/3 bg-linear-to-r from-transparent via-card/60 to-transparent"
                          animate={{ left: ["-35%", "105%"] }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                        />
                      </div>
                      <ol className="grid grid-cols-3 gap-2 text-[11px] font-medium">
                        {t.scanner.scanningSteps.map((step, i) => (
                          <li
                            key={step}
                            className={cn(
                              "flex flex-col items-center gap-1 text-center transition-colors",
                              i <= scanStep ? "text-foreground" : "text-muted-foreground/60"
                            )}
                          >
                            <span
                              className={cn(
                                "flex size-5 items-center justify-center rounded-full text-[10px] transition-colors",
                                i < scanStep
                                  ? "bg-primary text-primary-foreground"
                                  : i === scanStep
                                    ? "bg-secondary text-primary ring-1 ring-primary/30"
                                    : "bg-muted"
                              )}
                            >
                              {i < scanStep ? <Check className="size-3" /> : i + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sample reports */}
            <div className="surface p-4 sm:p-5">
              <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <Sparkles className="size-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">{t.scanner.samplesTitle}</h3>
                <span className="text-xs text-muted-foreground">· {t.scanner.samplesDescription}</span>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {SAMPLE_REPORTS.map((sample) => {
                  const meta = t.scanner.samples[sample.id]
                  const scanning = scanningSampleId === sample.id
                  return (
                    <motion.button
                      key={sample.id}
                      type="button"
                      disabled={loading}
                      onClick={() => handleScanSample(sample)}
                      whileTap={{ scale: 0.97 }}
                      className="group flex min-h-16 items-start gap-3 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:border-primary/25 hover:bg-muted/60 disabled:opacity-60"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        {scanning ? <Loader2 className="size-4 animate-spin" /> : <FileText className="size-4" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-foreground">
                          {meta?.title ?? sample.title}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">{meta?.source}</span>
                        <span className="mt-1 block truncate text-[11px] font-medium text-muted-foreground tabular-nums">
                          {sample.values}
                        </span>
                      </span>
                    </motion.button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            className="surface space-y-6 p-5 sm:p-7"
          >
            <div className="flex flex-col items-start justify-between gap-3 border-b border-border pb-5 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                  <SlidersHorizontal className="size-5" />
                </span>
                <div className="space-y-1">
                  <Badge variant={confidenceVariant(extractedData.confidence.overall)}>
                    <Check />
                    {t.scanner.review.badge(Math.round(extractedData.confidence.overall * 100))}
                  </Badge>
                  <h3 className="text-lg font-bold tracking-tight text-foreground">{t.scanner.review.title}</h3>
                  <p className="text-sm text-muted-foreground">{t.scanner.review.description}</p>
                </div>
              </div>
              <Button type="button" variant="outline" className="h-10 rounded-xl" onClick={resetScan}>
                <RefreshCw />
                {t.scanner.review.rescan}
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {reviewFields.map((field, i) => (
                <motion.div
                  key={field.key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.4, ease: EASE_OUT }}
                  className="space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor={field.id} className="text-sm font-semibold text-foreground">
                      {field.label}
                    </Label>
                    <Badge variant={confidenceVariant(field.conf)}>
                      {t.scanner.review.confidence(Math.round(field.conf * 100))}
                    </Badge>
                  </div>
                  <div className="relative">
                    <Input
                      id={field.id}
                      type="number"
                      inputMode="decimal"
                      step={field.step}
                      value={editableValues[field.key]}
                      onChange={(e) => setEditableValues({ ...editableValues, [field.key]: e.target.value })}
                      className={cn(fieldClass, "h-12 pr-16 text-lg font-semibold tabular-nums")}
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-xs font-medium text-muted-foreground">
                      {field.unit}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 border-t border-border pt-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="ocr-om" className="text-sm font-medium text-muted-foreground">
                  {t.scanner.review.om}
                </Label>
                <Input
                  id="ocr-om"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  value={editableValues.organicMatter}
                  onChange={(e) => setEditableValues({ ...editableValues, organicMatter: e.target.value })}
                  placeholder={t.form.placeholder("2.1")}
                  className={cn(fieldClass, "tabular-nums")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ocr-notes" className="text-sm font-medium text-muted-foreground">
                  {t.scanner.review.notes}
                </Label>
                <Input
                  id="ocr-notes"
                  value={editableValues.notes}
                  onChange={(e) => setEditableValues({ ...editableValues, notes: e.target.value })}
                  placeholder={t.scanner.review.notesPlaceholder}
                  className={fieldClass}
                />
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-danger-soft p-3.5 text-sm text-destructive"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.985 }}>
              <Button
                type="button"
                size="lg"
                onClick={handleApplyToForm}
                className="group h-13 w-full rounded-xl text-base font-semibold shadow-[0_8px_24px_-8px_var(--primary)]"
              >
                <Check className="size-5" />
                {t.scanner.review.apply}
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload-stage errors */}
      <AnimatePresence>
        {error && !extractedData && (
          <motion.div
            role="alert"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-danger-soft p-3.5 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-xs font-semibold underline-offset-2 hover:underline"
            >
              {c.actions.close}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
