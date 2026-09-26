import { defineMessages } from "@/lib/i18n/config"

export const soilAnalysisMessages = defineMessages({
  th: {
    page: {
      eyebrow: "วิเคราะห์ธาตุอาหารในดิน",
      title: "วิเคราะห์ดินและค้นหาพืชที่เหมาะสม",
      description:
        "กรอกผลตรวจดินจากห้องปฏิบัติการหรือชุดตรวจดินพกพา เพื่อจัดอันดับพืชที่ให้ผลผลิตดีที่สุดในสภาพดินของคุณ",
    },
    form: {
      title: "ค่าวิเคราะห์ทางเคมีของดิน",
      description: "ธาตุอาหารหลัก N-P-K หน่วย mg/kg และค่าความเป็นกรด-ด่าง · ppm คือหน่วยเดียวกับ mg/kg กรอกตัวเลขตามใบผลตรวจได้เลย",
      placeholder: (min: number, max: number) => `ค่าปกติ ${min}–${max}`,
      hints: {
        nitrogen: "บำรุงลำต้นและใบให้เขียว",
        phosphorus: "เร่งการพัฒนาราก ดอก และเมล็ด",
        potassium: "สะสมแป้งและน้ำตาล เพิ่มความต้านทานโรค",
        ph: "5.5 – 7.0 เหมาะกับพืชส่วนใหญ่",
      },
      onReport: "บนใบผลตรวจ:",
      reportLabels: {
        nitrogen: "“ไนโตรเจน (N)” หรือ “Available N”",
        phosphorus: "“ฟอสฟอรัสที่เป็นประโยชน์” หรือ “Available P (Bray II)”",
        potassium: "“โพแทสเซียมที่แลกเปลี่ยนได้” หรือ “Exchangeable K”",
        ph: "“ความเป็นกรด-ด่าง” หรือ “pH (1:1)”",
      },
      status: {
        low: "ต่ำ",
        ok: "เหมาะสม",
        high: "สูง",
        empty: "ยังไม่ระบุ",
      },
      phStatus: {
        strongAcid: "กรดจัด",
        acid: "กรดอ่อน",
        ideal: "เหมาะสม",
        alkaline: "ด่าง",
      },
      phScale: { acid: "กรด", neutral: "กลาง", alkaline: "ด่าง" },
      contextTitle: "พื้นที่และฤดูกาล",
      contextDescription: "ใช้ปรับเกณฑ์ตามสภาพอากาศและแหล่งน้ำ",
      notes: "ชื่อแปลงหรือบันทึกเพิ่มเติม",
      optional: "ไม่บังคับ",
      notesPlaceholder: "เช่น แปลงข้าวทุ่งกุลา แปลงที่ 2",
      submit: "วิเคราะห์และแนะนำพืช",
      submitting: "กำลังประมวลผล...",
      errors: {
        incomplete: "กรุณากรอกตัวเลขค่าธาตุอาหารให้ครบถ้วน",
        phRange: "ค่า pH ต้องอยู่ระหว่าง 0 ถึง 14",
        failed: "เกิดข้อผิดพลาดในการคำนวณ กรุณาลองใหม่อีกครั้ง",
      },
      presetApplied: (name: string) => `ใช้ค่าตัวอย่าง: ${name}`,
      presetNote: (name: string) => `ตัวอย่างข้อมูล: ${name}`,
    },
    guide: {
      title: "ค่าที่เหมาะสมโดยทั่วไป",
      description: "ช่วงอ้างอิงสำหรับพืชไร่และไม้ผลส่วนใหญ่ ระบบจะเทียบกับความต้องการเฉพาะของพืชแต่ละชนิดอีกครั้ง",
      tipTitle: "เคล็ดลับ",
      tip: "เก็บตัวอย่างดินลึก 0–15 ซม. จากหลายจุดในแปลงแล้วผสมรวมกัน จะได้ค่าที่สะท้อนทั้งแปลงมากขึ้น",
    },
    presets: {
      title: "ลองใช้ค่าตัวอย่าง",
      description: "คลิกเพื่อเติมค่าอัตโนมัติ",
      items: {
        paddy: { name: "ดินนาลุ่มน้ำขัง", desc: "เหมาะกับข้าว · pH 6.0" },
        loam: { name: "ดินร่วนระบายน้ำดี", desc: "ข้าวโพด/ผัก · pH 6.5" },
        sandy: { name: "ดินร่วนปนทราย", desc: "มันสำปะหลัง/สับปะรด · pH 5.5" },
        acidic: { name: "ดินเปรี้ยวจัด", desc: "N ต่ำ · pH 4.2" },
      } as Record<string, { name: string; desc: string }>,
    },
  },
  en: {
    page: {
      eyebrow: "Soil nutrient analysis",
      title: "Analyze soil & find the right crops",
      description:
        "Enter results from a lab or a portable soil test kit to rank the crops that will perform best in your soil.",
    },
    form: {
      title: "Soil chemistry values",
      description: "Primary nutrients N-P-K in mg/kg, plus soil pH · ppm is the same as mg/kg, so type the number as printed on your report",
      placeholder: (min: number, max: number) => `Typical ${min}–${max}`,
      hints: {
        nitrogen: "Drives stem and leaf growth",
        phosphorus: "Supports roots, flowers and seeds",
        potassium: "Builds starch and sugar, improves disease resistance",
        ph: "5.5 – 7.0 suits most crops",
      },
      onReport: "On your report:",
      reportLabels: {
        nitrogen: "“Available N” or “Nitrogen (N)”",
        phosphorus: "“Available P (Bray II)” or “ฟอสฟอรัสที่เป็นประโยชน์”",
        potassium: "“Exchangeable K” or “โพแทสเซียมที่แลกเปลี่ยนได้”",
        ph: "“pH (1:1)” or “ความเป็นกรด-ด่าง”",
      },
      status: {
        low: "Low",
        ok: "Healthy",
        high: "High",
        empty: "Not set",
      },
      phStatus: {
        strongAcid: "Strongly acidic",
        acid: "Slightly acidic",
        ideal: "Ideal",
        alkaline: "Alkaline",
      },
      phScale: { acid: "Acidic", neutral: "Neutral", alkaline: "Alkaline" },
      contextTitle: "Location & season",
      contextDescription: "Adjusts scoring for climate and water availability",
      notes: "Plot name or notes",
      optional: "Optional",
      notesPlaceholder: "e.g. Rice plot 2, Thung Kula",
      submit: "Analyze & recommend crops",
      submitting: "Analyzing...",
      errors: {
        incomplete: "Please enter all nutrient values",
        phRange: "pH must be between 0 and 14",
        failed: "Calculation failed. Please try again.",
      },
      presetApplied: (name: string) => `Sample applied: ${name}`,
      presetNote: (name: string) => `Sample data: ${name}`,
    },
    guide: {
      title: "Typical healthy ranges",
      description: "Reference ranges for most field crops and fruit trees. Each crop is then scored against its own requirements.",
      tipTitle: "Tip",
      tip: "Sample soil at 0–15 cm from several spots in the plot and mix them together for a more representative result.",
    },
    presets: {
      title: "Try a sample soil",
      description: "Click to fill the form",
      items: {
        paddy: { name: "Flooded paddy soil", desc: "Suits rice · pH 6.0" },
        loam: { name: "Well-drained loam", desc: "Corn/vegetables · pH 6.5" },
        sandy: { name: "Sandy loam", desc: "Cassava/pineapple · pH 5.5" },
        acidic: { name: "Strongly acidic soil", desc: "Low N · pH 4.2" },
      } as Record<string, { name: string; desc: string }>,
    },
  },
})

/** General healthy reference ranges (mg/kg, pH) used for live input feedback. */
export const HEALTHY_RANGES = {
  nitrogen: { min: 60, max: 150, scaleMax: 250 },
  phosphorus: { min: 25, max: 70, scaleMax: 120 },
  potassium: { min: 50, max: 120, scaleMax: 200 },
  ph: { min: 5.5, max: 7.0, scaleMin: 3.5, scaleMax: 9.5 },
} as const
