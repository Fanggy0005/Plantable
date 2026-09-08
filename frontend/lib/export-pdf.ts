import jsPDF from "jspdf"

interface PlantResult {
  plantId: string
  name: string
  nameTh: string
  description: string
  score: number
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
  soilImprovement?: any
}

function escapeHtml(text: string | undefined | null): string {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function buildReportHtml(result: Result): string {
  const plantsHtml = result.rankings
    .map((plant, index) => {
      const reasonsHtml = (plant.reasons ?? [])
        .map((reason) => `<li>${escapeHtml(reason)}</li>`)
        .join("")

      const improvementsHtml =
        (plant.improvements ?? []).length > 0
          ? `<p style="font-weight:600;margin:8px 0 4px">แนะนำปรับปรุง:</p>
             <ul style="margin:0;padding-left:20px;color:#666666">
               ${(plant.improvements ?? []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
             </ul>`
          : ""

      return `
        <div style="border:1px solid #e5e5e5;border-radius:8px;padding:16px;margin-bottom:16px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
            <div style="display:flex;gap:8px;align-items:flex-start">
              <span style="font-size:18px;font-weight:bold;color:#888888">#${index + 1}</span>
              <div>
                <p style="font-weight:600;margin:0">${escapeHtml(plant.nameTh)}</p>
                <p style="font-size:14px;color:#666666;margin:4px 0 0">${escapeHtml(plant.name)}</p>
              </div>
            </div>
            <div style="text-align:right">
              <p style="font-size:24px;font-weight:bold;margin:0">${plant.score}</p>
              <p style="font-size:12px;color:#666666;margin:0">คะแนน</p>
            </div>
          </div>
          <p style="font-size:14px;color:#666666;margin:8px 0">${escapeHtml(plant.description)}</p>
          <p style="font-weight:600;margin:8px 0 4px">เหตุผล:</p>
          <ul style="margin:0;padding-left:20px;color:#666666">${reasonsHtml}</ul>
          ${improvementsHtml}
        </div>
      `
    })
    .join("")

  return `
    <div style="font-family:'Segoe UI',Tahoma,'Noto Sans Thai',sans-serif;color:#000000;padding:20px;max-width:560px;background:#ffffff">
      <h1 style="font-size:20px;margin:0 0 4px">Plantable - รายงานวิเคราะห์ดิน</h1>
      <p style="font-size:12px;color:#666666;margin:0 0 16px">วันที่: ${new Date().toLocaleDateString("th-TH")}</p>
      <h2 style="font-size:16px;margin:0 0 8px">ค่าดิน</h2>
      <p style="font-size:14px;margin:0 0 4px">ไนโตรเจน (N): ${result.soil.nitrogen} mg/kg</p>
      <p style="font-size:14px;margin:0 0 4px">ฟอสฟอรัส (P): ${result.soil.phosphorus} mg/kg</p>
      <p style="font-size:14px;margin:0 0 4px">โพแทสเซียม (K): ${result.soil.potassium} mg/kg</p>
      <p style="font-size:14px;margin:0 0 16px">pH: ${result.soil.ph}</p>

      ${
        result.soilImprovement
          ? `
        <div style="border:1px solid #10b981;border-radius:8px;padding:14px;margin-bottom:16px;background:#f0fdf4">
          <h2 style="font-size:16px;color:#065f46;margin:0 0 6px">แผนการปรับปรุงดินและปุ๋ย (Smart Soil Improvement)</h2>
          <p style="font-size:13px;color:#047857;margin:0 0 8px">คะแนนสุขภาพดิน: <strong>${result.soilImprovement.soilHealthScore}/100</strong> (${escapeHtml(result.soilImprovement.overallConditionTh)})</p>
          <p style="font-weight:600;font-size:13px;margin:6px 0 4px">ตารางการใส่ปุ๋ยเคมีแบ่งระยะ:</p>
          <ul style="margin:0;padding-left:18px;font-size:12px;color:#333333">
            ${(result.soilImprovement.fertilizerRecommendations ?? [])
              .map(
                (f: any) =>
                  `<li><strong>${escapeHtml(f.stage)}:</strong> สูตร ${escapeHtml(f.formula)} อัตรา ${f.rateKgPerRai} กก./ไร่ (${escapeHtml(f.timing)})</li>`
              )
              .join("")}
          </ul>
          <p style="font-weight:600;font-size:13px;margin:8px 0 2px">การปรับปรุงค่ากรด-ด่าง (pH):</p>
          <p style="font-size:12px;color:#333333;margin:0">วัสดุ: ${escapeHtml(result.soilImprovement.phCorrection?.recommendedMaterial)} | อัตรา: ${result.soilImprovement.phCorrection?.dosageKgPerRai} กก./ไร่</p>
        </div>
        `
          : ""
      }

      <h2 style="font-size:16px;margin:0 0 12px">อันดับพืชที่เหมาะสม</h2>
      ${plantsHtml}
    </div>
  `
}


function createReportElement(result: Result): HTMLElement {
  const container = document.createElement("div")
  container.style.position = "fixed"
  container.style.left = "-9999px"
  container.style.top = "0"
  container.style.width = "600px"
  container.style.background = "#ffffff"
  container.style.zIndex = "-1000"
  container.innerHTML = buildReportHtml(result)

  document.body.appendChild(container)
  return container
}

function addCanvasToPdf(doc: jsPDF, canvas: HTMLCanvasElement, margin: number): void {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const printableWidth = pageWidth - margin * 2
  const printableHeight = pageHeight - margin * 2

  const imgWidth = printableWidth
  const imgHeight = (canvas.height * imgWidth) / canvas.width
  const imgData = canvas.toDataURL("image/jpeg", 0.95)

  let yOffset = 0
  let pageIndex = 0

  while (yOffset < imgHeight) {
    if (pageIndex > 0) doc.addPage()
    doc.addImage(imgData, "JPEG", margin, margin - yOffset, imgWidth, imgHeight)
    yOffset += printableHeight
    pageIndex += 1
  }
}

export async function exportToPDF(result: Result): Promise<void> {
  const container = createReportElement(result)

  try {
    const { default: html2canvas } = await import("html2canvas")
    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: "#ffffff",
      width: 600,
      windowWidth: 600,
      useCORS: true,
      logging: false,
      onclone: (clonedDoc) => {
        // ลบ <style> และ <link rel="stylesheet"> ที่ใช้ oklch/lab จาก Tailwind v4 / shadcn
        const styles = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]')
        styles.forEach((el) => el.remove())
      },
    })

    const doc = new jsPDF({ unit: "mm", format: "a4" })
    addCanvasToPdf(doc, canvas, 10)
    doc.save("plantable-report.pdf")
  } finally {
    if (container.parentNode) {
      container.parentNode.removeChild(container)
    }
  }
}
