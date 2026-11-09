import jsPDF from "jspdf"
import { defineMessages, INTL_LOCALE, type Locale } from "@/lib/i18n/config"
import { commonMessages } from "@/lib/i18n/messages/common"
import { scoreTone, type ScoreTone } from "@/lib/score"
import type { NutrientLevel, SoilCheck, SoilPlan, SoilPlanStep } from "@/types"

export interface ReportInput {
  check: SoilCheck
  /** The soil plan currently on screen, if any. */
  plan: SoilPlan | null
  planCropName?: string
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

const LEVEL_TONE: Record<NutrientLevel, { bg: string; fg: string }> = {
  low: { bg: C.warningSoft, fg: C.warning },
  medium: { bg: C.infoSoft, fg: C.info },
  high: { bg: C.successSoft, fg: C.success },
}

const pdfMessages = defineMessages({
  th: {
    title: "รายงานผลวิเคราะห์ดินและคำแนะนำพืช",
    generated: "วันที่ตรวจ",
    siteTitle: "สภาพแปลง",
    soilTitle: "ผลตรวจดิน",
    estimated: "ประเมิน",
    warningsTitle: "ข้อควรทราบ",
    planTitle: (crop: string) => `แผนปรับปรุงดินสำหรับ${crop}`,
    planMeta: (rai: number, mode: string, difficulty: string) => `${rai} ไร่ · ${mode} · ${difficulty}`,
    when: "ช่วงเวลา",
    step: "ขั้นตอน",
    total: "ทั้งแปลง",
    before: (d: number) => `${d} วันก่อนปลูก`,
    planting: "วันปลูก",
    after: (d: number) => `${d} วันหลังปลูก`,
    afterHarvest: "หลังเก็บเกี่ยว",
    rankingTitle: "อันดับพืชที่เหมาะสม",
    ineligibleTitle: "พืชที่ปลูกไม่ได้ในแปลงนี้",
    footer: "คำนวณด้วยกฎและข้อมูลอ้างอิงชุดเดียวกันทุกครั้ง ข้อมูลเดียวกันได้ผลเดียวกันเสมอ",
  },
  en: {
    title: "Soil Analysis & Crop Recommendation Report",
    generated: "Tested on",
    siteTitle: "Plot conditions",
    soilTitle: "Soil test",
    estimated: "estimated",
    warningsTitle: "Good to know",
    planTitle: (crop: string) => `Soil plan for ${crop}`,
    planMeta: (rai: number, mode: string, difficulty: string) => `${rai} rai · ${mode} · ${difficulty}`,
    when: "When",
    step: "Step",
    total: "Whole plot",
    before: (d: number) => `${d} days before planting`,
    planting: "Planting day",
    after: (d: number) => `${d} days after planting`,
    afterHarvest: "After harvest",
    rankingTitle: "Crop suitability ranking",
    ineligibleTitle: "Crops that can't grow on this plot",
    footer: "Calculated with fixed rules and reference data; the same input always gives the same result.",
  },
})

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

function buildReportHtml({ check, plan, planCropName }: ReportInput, locale: Locale): string {
  const t = pdfMessages[locale]
  const common = commonMessages[locale]
  const { site, soil, result } = check
  const pick = (th?: string, en?: string) => (locale === "th" ? th || en : en || th) ?? ""
  const date = new Intl.DateTimeFormat(INTL_LOCALE[locale], { year: "numeric", month: "long", day: "numeric" }).format(
    new Date(check.createdAt)
  )

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
          ${check.notes ? `<div style="font-size:12px;color:${C.forestMuted};margin-top:4px">${escapeHtml(check.notes)}</div>` : ""}
        </div>
        <div style="text-align:right;font-size:11px;color:${C.forestMuted};white-space:nowrap">
          ${escapeHtml(t.generated)}<br/><span style="color:#ffffff;font-weight:600;font-size:12px">${escapeHtml(date)}</span>
        </div>
      </div>
    </div>`

  const warnings = result.warnings.length
    ? `<div data-pdf-block style="margin-bottom:18px;border:1px solid ${C.warning};border-radius:12px;padding:12px 16px;background:${C.warningSoft};font-size:12px;color:${C.foreground}">
         <strong style="color:${C.warning}">${escapeHtml(t.warningsTitle)}</strong>
         ${result.warnings.map((w) => `<div style="margin-top:4px">${escapeHtml(w)}</div>`).join("")}
       </div>`
    : ""

  const siteChips = [
    common.landTypes[site.landType],
    common.waterSupplies[site.waterSupply],
    common.soilTextures[site.soilTexture],
  ]
    .map((v) => pill(v, C.muted, C.foreground))
    .join(" ")

  const lab = soil.inputMode === "lab" ? soil : null
  const levelTile = (label: string, level: NutrientLevel, estimated: boolean, value?: string) => {
    const tone = LEVEL_TONE[level]
    return `
      <div style="flex:1;border:1px solid ${C.border};border-radius:12px;padding:10px 12px;background:#ffffff">
        <div style="font-size:11px;color:${C.mutedForeground};font-weight:600">${escapeHtml(label)}</div>
        <div style="margin-top:6px">${pill(common.nutrientLevels[level], tone.bg, tone.fg)}${
          estimated ? ` <span style="font-size:10px;color:${C.mutedForeground}">(${escapeHtml(t.estimated)})</span>` : ""
        }</div>
        ${value ? `<div style="font-size:11px;color:${C.mutedForeground};margin-top:4px">${escapeHtml(value)}</div>` : ""}
      </div>`
  }
  const { levels } = result
  const soilTiles = [
    `<div style="flex:1;border:1px solid ${C.border};border-radius:12px;padding:10px 12px;background:#ffffff">
       <div style="font-size:11px;color:${C.mutedForeground};font-weight:600">${escapeHtml(common.nutrients.ph)}</div>
       <div style="font-size:22px;font-weight:700;color:${C.foreground};margin-top:2px">${escapeHtml(soil.ph)}</div>
     </div>`,
    levelTile(
      common.nutrients.organicMatter,
      levels.organicMatter,
      levels.organicMatterEstimated,
      lab ? `${lab.organicMatterPct} ${common.units.percent}` : undefined
    ),
    levelTile(common.nutrients.nitrogen, levels.nitrogen, levels.nitrogenEstimated),
    levelTile(
      common.nutrients.phosphorus,
      levels.phosphorus,
      false,
      lab ? `${lab.phosphorusMgKg} ${common.units.mgPerKg}` : undefined
    ),
    levelTile(
      common.nutrients.potassium,
      levels.potassium,
      false,
      lab ? `${lab.potassiumMgKg} ${common.units.mgPerKg}` : undefined
    ),
  ].join("")

  const soilSection = `
    <div data-pdf-block style="margin-bottom:22px">
      ${sectionTitle(t.siteTitle)}
      <div style="margin-bottom:14px">${siteChips}</div>
      ${sectionTitle(t.soilTitle)}
      <div style="display:flex;gap:8px">${soilTiles}</div>
    </div>`

  let planSection = ""
  if (plan && planCropName) {
    const when = (step: SoilPlanStep) =>
      step.daysAfterPlanting === null
        ? t.afterHarvest
        : step.daysAfterPlanting < 0
          ? t.before(-step.daysAfterPlanting)
          : step.daysAfterPlanting === 0
            ? t.planting
            : t.after(step.daysAfterPlanting)

    // [per rai, whole plot] as HTML
    const amounts = (step: SoilPlanStep): [string, string] => {
      if (step.type === "fertilizer") {
        if (!step.products.length) {
          const n = step.nutrientsPerRai
          return [escapeHtml(`N ${n.n} · P₂O₅ ${n.p2o5} · K₂O ${n.k2o}`), ""]
        }
        return [
          step.products.map((p) => escapeHtml(`${p.formula}: ${p.kgPerRai}`)).join("<br/>"),
          step.products.map((p) => escapeHtml(`${p.formula}: ${p.kgTotal} kg`)).join("<br/>"),
        ]
      }
      if (step.type === "retest" || step.kgPerRai === null) return ["", ""]
      const material = step.type === "ph_correction" && step.material ? `${step.material} ` : ""
      return [escapeHtml(`${material}${step.kgPerRai}`), step.kgTotal !== null ? escapeHtml(`${step.kgTotal} kg`) : ""]
    }

    const rows = plan.steps.map((step) => {
      const [perRai, total] = amounts(step)
      const note = step.noteTh
        ? `<div style="color:${C.mutedForeground};font-size:11px;margin-top:2px">${escapeHtml(step.noteTh)}</div>`
        : ""
      return [escapeHtml(when(step)), `<strong>${escapeHtml(step.titleTh)}</strong>${note}`, perRai, total]
    })

    const planWarnings = plan.warnings.length
      ? `<div style="margin-bottom:10px;font-size:11px;color:${C.warning}">${plan.warnings
          .map((w) => `<div>• ${escapeHtml(w)}</div>`)
          .join("")}</div>`
      : ""

    planSection = `
      <div data-pdf-block style="margin-bottom:8px">
        ${sectionTitle(t.planTitle(planCropName))}
        <div style="font-size:12px;color:${C.mutedForeground};margin:-4px 0 10px">${escapeHtml(
          t.planMeta(plan.areaRai, common.planModes[plan.mode], common.difficulties[plan.difficulty])
        )}</div>
        ${planWarnings}
      </div>
      <div data-pdf-block style="margin-bottom:22px">
        ${table([t.when, t.step, common.units.kgPerRai, t.total], rows)}
      </div>`
  }

  const rankingHeader = `<div data-pdf-block style="margin-bottom:0">${sectionTitle(t.rankingTitle)}</div>`

  const crops = result.ranked
    .map((crop, index) => {
      const tone = TONE[scoreTone(crop.score)]
      const level = common.levels[crop.level] ?? crop.level
      const primaryName = pick(crop.cropNameTh, crop.cropName)
      const secondaryName = locale === "th" ? crop.cropName : crop.cropNameTh
      const reasons = crop.reasons.length
        ? `<ul style="margin:8px 0 0;padding-left:18px;color:${C.mutedForeground};font-size:12px;line-height:1.65">${crop.reasons
            .map((r) => `<li>${escapeHtml(r)}</li>`)
            .join("")}</ul>`
        : ""

      return `
        <div data-pdf-block style="border:1px solid ${index === 0 ? C.primary : C.border};border-radius:14px;padding:14px 16px;margin-bottom:10px;background:#ffffff">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
            <div style="display:flex;gap:10px;align-items:flex-start">
              <span style="display:inline-flex;min-width:30px;height:30px;border-radius:9px;align-items:center;justify-content:center;font-size:13px;font-weight:800;background:${index === 0 ? C.primary : C.muted};color:${index === 0 ? "#ffffff" : C.mutedForeground}">#${index + 1}</span>
              <div>
                <div style="font-size:15px;font-weight:700;color:${C.foreground}">${escapeHtml(primaryName)}
                  <span style="font-size:12px;font-weight:500;color:${C.mutedForeground}">${secondaryName ? `(${escapeHtml(secondaryName)})` : ""}</span></div>
                <div style="margin-top:4px">${pill(level, tone.bg, tone.fg)} ${pill(common.difficulties[crop.difficulty], C.muted, C.foreground)}</div>
              </div>
            </div>
            <div style="text-align:right;min-width:92px">
              <div style="font-size:24px;font-weight:800;color:${tone.fg};line-height:1">${escapeHtml(crop.score)}<span style="font-size:11px;font-weight:500;color:${C.mutedForeground}">/100</span></div>
              <div style="height:6px;border-radius:999px;background:${C.muted};margin-top:6px;overflow:hidden">
                <div style="height:6px;width:${Math.max(0, Math.min(100, crop.score))}%;background:${tone.bar};border-radius:999px"></div>
              </div>
            </div>
          </div>
          ${reasons}
        </div>`
    })
    .join("")

  const ineligible = result.ineligible.length
    ? `<div data-pdf-block style="margin-top:12px;font-size:12px;color:${C.mutedForeground}">
         <strong style="color:${C.foreground}">${escapeHtml(t.ineligibleTitle)}</strong>
         ${result.ineligible
           .map((c) => `<div style="margin-top:3px">${escapeHtml(`${pick(c.cropNameTh, c.cropName)}: ${c.reasons.join(" · ")}`)}</div>`)
           .join("")}
       </div>`
    : ""

  const footer = `<div data-pdf-block style="margin-top:14px;padding-top:10px;border-top:1px solid ${C.border};font-size:10px;color:${C.mutedForeground}">${escapeHtml(t.footer)}</div>`

  return `<div style="font-family:var(--pdf-font);color:${C.foreground};padding:24px;background:#ffffff;line-height:1.5">
    ${header}${warnings}${soilSection}${planSection}${rankingHeader}${crops}${ineligible}${footer}
  </div>`
}

const REPORT_WIDTH = 760

function createReportElement(report: ReportInput, locale: Locale): HTMLElement {
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
  container.innerHTML = buildReportHtml(report, locale)
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

export async function exportToPDF(report: ReportInput, options: { locale?: Locale } = {}): Promise<void> {
  const locale = options.locale ?? "th"
  const container = createReportElement(report, locale)

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
