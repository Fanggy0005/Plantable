import jsPDF from "jspdf"
import { defineMessages, INTL_LOCALE, type Locale } from "@/lib/i18n/config"
import { commonMessages } from "@/lib/i18n/messages/common"
import { levelFromScore, scoreTone, type ScoreTone } from "@/lib/score"
import type { FertilizerScheduleItem, NutrientDiagnostic, SoilImprovementPlan } from "@/types"

interface PlantResult {
  plantId: string
  name: string
  nameTh: string
  description: string
  score: number
  level?: string
  category?: string
  reasons: string[]
  improvements: string[]
}

interface Result {
  soil: {
    nitrogen: number
    phosphorus: number
    potassium: number
    ph: number
  }
  rankings: PlantResult[]
  soilImprovement?: SoilImprovementPlan
}

/*
 * The report is laid out as HTML and rasterised with html2canvas, because jsPDF's built-in
 * fonts have no Thai glyphs. html2canvas cannot parse oklch(), so the page stylesheets are
 * stripped from the clone and every color here is a hex equivalent of the design tokens.
 */
const C = {
  forest: "#021c0d",
  forestElevated: "#092917",
  forestAccent: "#7ae4aa",
  forestMuted: "#a5bfab",
  primary: "#004520",
  secondary: "#ebf7ed",
  foreground: "#06150c",
  muted: "#f2f6f3",
  mutedForeground: "#556159",
  border: "#e2e8e3",
  success: "#108846",
  successSoft: "#e1f9e6",
  warning: "#cb7f00",
  warningSoft: "#fff4d7",
  danger: "#db2c2b",
  dangerSoft: "#ffedeb",
  info: "#0079b5",
  infoSoft: "#e3f5ff",
} as const

/** Same tiers as lib/score.ts TONE_COLOR / TONE_BADGE, in hex */
const TONE: Record<ScoreTone, { bar: string; bg: string; fg: string }> = {
  excellent: { bar: C.success, bg: C.successSoft, fg: C.success },
  good: { bar: "#35b276", bg: C.successSoft, fg: C.primary },
  fair: { bar: C.warning, bg: C.warningSoft, fg: C.warning },
  poor: { bar: "#bb6546", bg: C.warningSoft, fg: "#bb6546" },
  bad: { bar: C.danger, bg: C.dangerSoft, fg: C.danger },
}

const STATUS_TONE: Record<string, { bg: string; fg: string }> = {
  severe_deficiency: { bg: C.dangerSoft, fg: C.danger },
  mild_deficiency: { bg: C.warningSoft, fg: C.warning },
  optimal: { bg: C.successSoft, fg: C.success },
  mild_excess: { bg: C.infoSoft, fg: C.info },
  severe_excess: { bg: C.infoSoft, fg: C.info },
}

const pdfMessages = defineMessages({
  th: {
    title: "รายงานผลวิเคราะห์ดินและคำแนะนำพืช",
    generated: "วันที่ออกรายงาน",
    soilTitle: "ค่าวิเคราะห์ดิน",
    planTitle: "แผนปรับปรุงดินและการใส่ปุ๋ย",
    healthScore: "คะแนนสุขภาพดิน",
    diagnostics: "วินิจฉัยธาตุอาหาร",
    nutrient: "ธาตุอาหาร",
    current: "ค่าปัจจุบัน",
    optimalRange: "ช่วงเหมาะสม",
    status: "สถานะ",
    fertilizerTitle: "ตารางใส่ปุ๋ยเคมี",
    stage: "ระยะ",
    formula: "สูตร",
    rate: "อัตรา (กก./ไร่)",
    timing: "ช่วงเวลา",
    phTitle: "การปรับค่า pH",
    material: "วัสดุ",
    dosage: "อัตรา",
    rankingTitle: "อันดับพืชที่เหมาะสม",
    score: "คะแนน",
    reasons: "เหตุผล",
    improvements: "แนะนำปรับปรุง",
    footer: "คำนวณตามเกณฑ์ปฐพีวิทยามาตรฐาน: N 30% · P 20% · K 20% · pH 30%",
  },
  en: {
    title: "Soil Analysis & Crop Recommendation Report",
    generated: "Generated",
    soilTitle: "Soil test values",
    planTitle: "Soil improvement & fertilizer plan",
    healthScore: "Soil health score",
    diagnostics: "Nutrient diagnostics",
    nutrient: "Nutrient",
    current: "Current",
    optimalRange: "Optimal range",
    status: "Status",
    fertilizerTitle: "Fertilizer schedule",
    stage: "Stage",
    formula: "Formula",
    rate: "Rate (kg/rai)",
    timing: "Timing",
    phTitle: "pH correction",
    material: "Material",
    dosage: "Rate",
    rankingTitle: "Crop suitability ranking",
    score: "Score",
    reasons: "Why it fits",
    improvements: "Suggested improvements",
    footer: "Scored with standard agronomy weights: N 30% · P 20% · K 20% · pH 30%",
  },
})

const STATUS_EN: Record<string, string> = {
  severe_deficiency: "Severely deficient",
  mild_deficiency: "Slightly low",
  optimal: "Optimal",
  mild_excess: "Slightly high",
  severe_excess: "Excessive",
}

function escapeHtml(text: string | number | undefined | null): string {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

const sectionTitle = (text: string) =>
  `<h2 style="font-size:15px;font-weight:700;color:${C.foreground};margin:0 0 10px;display:flex;align-items:center;gap:8px">
     <span style="display:inline-block;width:4px;height:16px;border-radius:2px;background:${C.primary}"></span>${escapeHtml(text)}
   </h2>`

const pill = (text: string, bg: string, fg: string) =>
  `<span style="display:inline-block;padding:2px 10px;border-radius:999px;background:${bg};color:${fg};font-size:11px;font-weight:600;white-space:nowrap">${escapeHtml(text)}</span>`

function table(headers: string[], rows: string[][]) {
  const th = headers
    .map(
      (h) =>
        `<th style="text-align:left;padding:8px 10px;font-size:11px;font-weight:700;color:${C.primary};background:${C.secondary}">${escapeHtml(h)}</th>`
    )
    .join("")
  const tr = rows
    .map(
      (r, i) =>
        `<tr style="background:${i % 2 ? C.muted : "#ffffff"}">${r
          .map((cell) => `<td style="padding:8px 10px;font-size:12px;color:${C.foreground};border-top:1px solid ${C.border};vertical-align:top">${cell}</td>`)
          .join("")}</tr>`
    )
    .join("")
  return `<table style="width:100%;border-collapse:separate;border-spacing:0;border:1px solid ${C.border};border-radius:10px;overflow:hidden"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table>`
}

function buildReportHtml(result: Result, locale: Locale): string {
  const t = pdfMessages[locale]
  const common = commonMessages[locale]
  const pick = (th?: string, en?: string) => (locale === "th" ? th || en : en || th) ?? ""
  const date = new Intl.DateTimeFormat(INTL_LOCALE[locale], { year: "numeric", month: "long", day: "numeric" }).format(new Date())

  const header = `
    <div data-pdf-block style="background:${C.forest};color:#ffffff;border-radius:16px;padding:22px 24px;margin-bottom:20px;position:relative;overflow:hidden">
      <div style="position:absolute;top:-60px;right:-40px;width:220px;height:220px;border-radius:50%;background:${C.forestElevated}"></div>
      <div style="position:relative;display:flex;justify-content:space-between;align-items:flex-start;gap:16px">
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
            <span style="display:inline-flex;width:26px;height:26px;border-radius:8px;background:${C.forestAccent};color:${C.forest};align-items:center;justify-content:center;font-weight:800;font-size:14px">P</span>
            <span style="font-size:16px;font-weight:700">Plantable</span>
          </div>
          <div style="font-size:20px;font-weight:700;line-height:1.3">${escapeHtml(t.title)}</div>
        </div>
        <div style="text-align:right;font-size:11px;color:${C.forestMuted};white-space:nowrap">
          ${escapeHtml(t.generated)}<br/><span style="color:#ffffff;font-weight:600;font-size:12px">${escapeHtml(date)}</span>
        </div>
      </div>
    </div>`

  const soilTiles = [
    { label: `${common.nutrients.nitrogen} (N)`, value: result.soil.nitrogen, unit: common.units.mgPerKg },
    { label: `${common.nutrients.phosphorus} (P)`, value: result.soil.phosphorus, unit: common.units.mgPerKg },
    { label: `${common.nutrients.potassium} (K)`, value: result.soil.potassium, unit: common.units.mgPerKg },
    { label: common.nutrients.ph, value: result.soil.ph, unit: "pH" },
  ]
    .map(
      (s) => `
      <div style="flex:1;border:1px solid ${C.border};border-radius:12px;padding:12px 14px;background:#ffffff">
        <div style="font-size:11px;color:${C.mutedForeground};font-weight:600">${escapeHtml(s.label)}</div>
        <div style="font-size:22px;font-weight:700;color:${C.foreground};margin-top:4px">${escapeHtml(s.value)}
          <span style="font-size:11px;font-weight:500;color:${C.mutedForeground}">${escapeHtml(s.unit)}</span></div>
      </div>`
    )
    .join("")

  const soil = `
    <div data-pdf-block style="margin-bottom:22px">
      ${sectionTitle(t.soilTitle)}
      <div style="display:flex;gap:10px">${soilTiles}</div>
    </div>`

  let plan = ""
  const si = result.soilImprovement
  if (si) {
    const health = Number(si.soilHealthScore ?? 0)
    const healthColor = health >= 80 ? C.success : health >= 60 ? C.warning : C.danger
    const healthBg = health >= 80 ? C.successSoft : health >= 60 ? C.warningSoft : C.dangerSoft

    const diagRows: string[][] = (si.diagnostics ?? []).map((d: NutrientDiagnostic) => {
      const tone = STATUS_TONE[d.status] ?? STATUS_TONE.optimal
      const label = locale === "th" ? d.statusLabelTh || STATUS_EN[d.status] : STATUS_EN[d.status] ?? d.statusLabelTh
      const unit = d.nutrient === "ph" ? "" : ` ${common.units.mgPerKg}`
      return [
        `<strong>${escapeHtml((common.nutrients as Record<string, string>)[d.nutrient] ?? pick(d.nameTh, d.name))}</strong>`,
        `${escapeHtml(d.currentValue)}${escapeHtml(unit)}`,
        `${escapeHtml(d.optimalRange?.min)}–${escapeHtml(d.optimalRange?.max)}${escapeHtml(unit)}`,
        pill(label, tone.bg, tone.fg),
      ]
    })

    const fertRows: string[][] = (si.fertilizerRecommendations ?? []).map((f: FertilizerScheduleItem, i: number) => [
      `<span style="display:inline-flex;width:20px;height:20px;border-radius:50%;background:${C.primary};color:#fff;font-size:10px;font-weight:700;align-items:center;justify-content:center;margin-right:6px">${i + 1}</span>${escapeHtml(f.stage)}`,
      `<span style="font-family:monospace;font-weight:700;color:${C.primary}">${escapeHtml(f.formula)}</span>`,
      escapeHtml(f.rateKgPerRai),
      escapeHtml(f.timing),
    ])

    plan = `
      <div data-pdf-block style="margin-bottom:14px">
        ${sectionTitle(t.planTitle)}
        <div style="display:flex;gap:14px;align-items:center;border:1px solid ${C.border};border-radius:12px;padding:14px 16px;background:${healthBg}">
          <div style="text-align:center;min-width:86px">
            <div style="font-size:30px;font-weight:800;color:${healthColor};line-height:1">${escapeHtml(health)}</div>
            <div style="font-size:10px;color:${C.mutedForeground}">/ 100</div>
          </div>
          <div style="border-left:1px solid ${C.border};padding-left:14px">
            <div style="font-size:12px;font-weight:700;color:${C.foreground}">${escapeHtml(t.healthScore)}</div>
            <div style="font-size:12px;color:${C.mutedForeground};margin-top:2px;line-height:1.6">${escapeHtml(si.overallConditionTh)}</div>
          </div>
        </div>
      </div>
      ${
        diagRows.length
          ? `<div data-pdf-block style="margin-bottom:14px">
               <div style="font-size:12px;font-weight:700;color:${C.foreground};margin-bottom:6px">${escapeHtml(t.diagnostics)}</div>
               ${table([t.nutrient, t.current, t.optimalRange, t.status], diagRows)}
             </div>`
          : ""
      }
      ${
        fertRows.length
          ? `<div data-pdf-block style="margin-bottom:14px">
               <div style="font-size:12px;font-weight:700;color:${C.foreground};margin-bottom:6px">${escapeHtml(t.fertilizerTitle)}</div>
               ${table([t.stage, t.formula, t.rate, t.timing], fertRows)}
             </div>`
          : ""
      }
      ${
        si.phCorrection
          ? `<div data-pdf-block style="margin-bottom:22px;border:1px solid ${C.border};border-radius:12px;padding:12px 16px;font-size:12px;color:${C.foreground}">
               <strong style="color:${C.primary}">${escapeHtml(t.phTitle)}</strong>
               <span style="color:${C.mutedForeground}"> · pH ${escapeHtml(si.phCorrection.currentPh)} (${escapeHtml(si.phCorrection.categoryTh)})</span><br/>
               ${escapeHtml(t.material)}: <strong>${escapeHtml(si.phCorrection.recommendedMaterial)}</strong>
               &nbsp;·&nbsp; ${escapeHtml(t.dosage)}: <strong>${escapeHtml(si.phCorrection.dosageKgPerRai)} ${escapeHtml(common.units.kgPerRai)}</strong>
             </div>`
          : ""
      }`
  }

  const rankingHeader = `<div data-pdf-block style="margin-bottom:0">${sectionTitle(t.rankingTitle)}</div>`

  const plants = result.rankings
    .map((plant, index) => {
      const tone = TONE[scoreTone(plant.score)]
      const level = common.levels[plant.level ?? levelFromScore(plant.score)] ?? plant.level ?? ""
      const primaryName = pick(plant.nameTh, plant.name)
      const secondaryName = locale === "th" ? plant.name : plant.nameTh
      const list = (items: string[]) =>
        `<ul style="margin:4px 0 0;padding-left:18px;color:${C.mutedForeground};font-size:12px;line-height:1.65">${items
          .map((i) => `<li>${escapeHtml(i)}</li>`)
          .join("")}</ul>`

      return `
        <div data-pdf-block style="border:1px solid ${index === 0 ? C.primary : C.border};border-radius:14px;padding:14px 16px;margin-bottom:10px;background:#ffffff">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
            <div style="display:flex;gap:10px;align-items:flex-start">
              <span style="display:inline-flex;min-width:30px;height:30px;border-radius:9px;align-items:center;justify-content:center;font-size:13px;font-weight:800;background:${index === 0 ? C.primary : C.muted};color:${index === 0 ? "#ffffff" : C.mutedForeground}">#${index + 1}</span>
              <div>
                <div style="font-size:15px;font-weight:700;color:${C.foreground}">${escapeHtml(primaryName)}
                  <span style="font-size:12px;font-weight:500;color:${C.mutedForeground}">${secondaryName ? `(${escapeHtml(secondaryName)})` : ""}</span></div>
                <div style="margin-top:4px">${pill(level, tone.bg, tone.fg)}</div>
              </div>
            </div>
            <div style="text-align:right;min-width:92px">
              <div style="font-size:24px;font-weight:800;color:${tone.fg};line-height:1">${escapeHtml(plant.score)}<span style="font-size:11px;font-weight:500;color:${C.mutedForeground}">/100</span></div>
              <div style="height:6px;border-radius:999px;background:${C.muted};margin-top:6px;overflow:hidden">
                <div style="height:6px;width:${Math.max(0, Math.min(100, plant.score))}%;background:${tone.bar};border-radius:999px"></div>
              </div>
            </div>
          </div>
          ${plant.description ? `<p style="font-size:12px;color:${C.mutedForeground};margin:10px 0 0;line-height:1.65">${escapeHtml(plant.description)}</p>` : ""}
          ${
            (plant.reasons ?? []).length
              ? `<div style="margin-top:8px"><div style="font-size:12px;font-weight:700;color:${C.success}">${escapeHtml(t.reasons)}</div>${list(plant.reasons)}</div>`
              : ""
          }
          ${
            (plant.improvements ?? []).length
              ? `<div style="margin-top:8px"><div style="font-size:12px;font-weight:700;color:${C.warning}">${escapeHtml(t.improvements)}</div>${list(plant.improvements)}</div>`
              : ""
          }
        </div>`
    })
    .join("")

  const footer = `<div data-pdf-block style="margin-top:14px;padding-top:10px;border-top:1px solid ${C.border};font-size:10px;color:${C.mutedForeground}">${escapeHtml(t.footer)}</div>`

  return `<div style="font-family:var(--pdf-font);color:${C.foreground};padding:24px;background:#ffffff;line-height:1.5">
    ${header}${soil}${plan}${rankingHeader}${plants}${footer}
  </div>`
}

const REPORT_WIDTH = 760

function createReportElement(result: Result, locale: Locale): HTMLElement {
  const container = document.createElement("div")
  container.style.position = "fixed"
  container.style.left = "-10000px"
  container.style.top = "0"
  container.style.width = `${REPORT_WIDTH}px`
  container.style.background = "#ffffff"
  container.style.zIndex = "-1000"
  // Reuse the app's (Sarabun) font stack, falling back to system Thai fonts
  container.style.setProperty(
    "--pdf-font",
    `${getComputedStyle(document.body).fontFamily}, "Segoe UI", Tahoma, "Noto Sans Thai", sans-serif`
  )
  container.innerHTML = buildReportHtml(result, locale)
  document.body.appendChild(container)
  return container
}

/** @font-face rules from the live page, so the stripped clone can still render Sarabun. */
function collectFontFaceCss(): string {
  const rules: string[] = []
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      for (const rule of Array.from(sheet.cssRules)) {
        if (rule instanceof CSSFontFaceRule) rules.push(rule.cssText)
      }
    } catch {
      // Cross-origin stylesheet; skip
    }
  }
  return rules.join("\n")
}

/** Block boundaries (in canvas px) where a page may be cut without slicing through content. */
function collectBreakpoints(container: HTMLElement, scale: number): number[] {
  const top = container.getBoundingClientRect().top
  const points = new Set<number>()
  container.querySelectorAll<HTMLElement>("[data-pdf-block]").forEach((el) => {
    const r = el.getBoundingClientRect()
    points.add(Math.round((r.top - top) * scale))
    points.add(Math.round((r.bottom - top) * scale))
  })
  return Array.from(points).sort((a, b) => a - b)
}

function addCanvasToPdf(doc: jsPDF, canvas: HTMLCanvasElement, breakpoints: number[]): void {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const marginX = 10
  const marginTop = 10
  const marginBottom = 14
  const printableWidth = pageWidth - marginX * 2
  const printableHeight = pageHeight - marginTop - marginBottom

  const pxPerMm = canvas.width / printableWidth
  const pagePx = Math.floor(printableHeight * pxPerMm)

  // Decide slice boundaries, preferring block edges
  const slices: [number, number][] = []
  let start = 0
  while (start < canvas.height) {
    const limit = start + pagePx
    if (limit >= canvas.height) {
      slices.push([start, canvas.height])
      break
    }
    const cut = [...breakpoints].reverse().find((p) => p <= limit && p > start + pagePx * 0.35) ?? limit
    slices.push([start, cut])
    start = cut
  }

  slices.forEach(([from, to], i) => {
    if (i > 0) doc.addPage()
    const slice = document.createElement("canvas")
    slice.width = canvas.width
    slice.height = to - from
    const ctx = slice.getContext("2d")
    if (!ctx) return
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, slice.width, slice.height)
    ctx.drawImage(canvas, 0, from, canvas.width, to - from, 0, 0, canvas.width, to - from)
    doc.addImage(slice.toDataURL("image/jpeg", 0.92), "JPEG", marginX, marginTop, printableWidth, (to - from) / pxPerMm)

    // Footer (Latin only; jsPDF core fonts have no Thai glyphs)
    doc.setDrawColor(226, 232, 227)
    doc.line(marginX, pageHeight - 10, pageWidth - marginX, pageHeight - 10)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(8)
    doc.setTextColor(0, 69, 32)
    doc.text("Plantable", marginX, pageHeight - 6)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(85, 97, 89)
    doc.text(`${i + 1} / ${slices.length}`, pageWidth - marginX, pageHeight - 6, { align: "right" })
  })
}

export async function exportToPDF(result: Result, options: { locale?: Locale } = {}): Promise<void> {
  const locale = options.locale ?? "th"
  const container = createReportElement(result, locale)

  try {
    const { default: html2canvas } = await import("html2canvas")
    const fontFaceCss = collectFontFaceCss()
    if (document.fonts?.ready) await document.fonts.ready

    const scale = 2
    const canvas = await html2canvas(container, {
      scale,
      backgroundColor: "#ffffff",
      width: REPORT_WIDTH,
      windowWidth: REPORT_WIDTH,
      useCORS: true,
      logging: false,
      onclone: (clonedDoc) => {
        // Strip Tailwind v4 / shadcn stylesheets (oklch/lab colors break html2canvas)
        clonedDoc.querySelectorAll('style, link[rel="stylesheet"]').forEach((el) => el.remove())
        if (fontFaceCss) {
          const style = clonedDoc.createElement("style")
          style.textContent = fontFaceCss
          clonedDoc.head.appendChild(style)
        }
      },
    })

    const breakpoints = collectBreakpoints(container, scale)
    const doc = new jsPDF({ unit: "mm", format: "a4" })
    addCanvasToPdf(doc, canvas, breakpoints)
    doc.save("plantable-report.pdf")
  } finally {
    if (container.parentNode) {
      container.parentNode.removeChild(container)
    }
  }
}
