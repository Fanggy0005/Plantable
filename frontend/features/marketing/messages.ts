import { defineMessages } from "@/lib/i18n/config"

export const landingMessages = defineMessages({
  th: {
    hero: {
      badge: "ประเมินตามหลักปฐพีวิทยา · ผลลัพธ์คงที่ทุกครั้ง",
      titleLead: "วิเคราะห์ดินอย่างแม่นยำ",
      titleAccent: "ปลูกพืชได้ผลผลิตสูงสุด",
      description:
        "เปลี่ยนค่าแล็บไนโตรเจน (N) ฟอสฟอรัส (P) โพแทสเซียม (K) และ pH ให้เป็นอันดับพืชที่เหมาะสม แผนปรับปรุงดิน และประมาณการผลตอบแทน ภายในไม่กี่วินาที",
      primaryCta: "เริ่มวิเคราะห์ดินฟรี",
      secondaryCta: "ดูฐานข้อมูลพืช",
      trust: ["เกณฑ์ตามหลักวิชาการ", "ไม่ต้องติดตั้ง ใช้งานฟรี", "ใช้ได้กับใบผลตรวจทุกแล็บ"],
    },
    preview: {
      title: "ผลการวิเคราะห์แปลงตัวอย่าง",
      subtitle: "นครราชสีมา · ฤดูฝน",
      topMatch: "พืชที่เหมาะที่สุด",
      crop: "ข้าว",
      cropEn: "Rice",
      score: "คะแนนความเหมาะสม",
      balance: "สมดุลธาตุอาหาร",
      ranking: "อันดับถัดไป",
      others: [
        { name: "ข้าวโพด", nameEn: "Corn", category: "Grain", score: 84 },
        { name: "ถั่วเหลือง", nameEn: "Soybean", category: "Grain", score: 78 },
      ],
      live: "ประมวลผลทันที",
    },
    stats: {
      crops: "ชนิดพืชในฐานข้อมูล",
      params: "ค่าดินที่ใช้ประเมิน",
      score: "คะแนนความเหมาะสมเต็ม",
    },
    steps: {
      eyebrow: "ขั้นตอนการทำงาน",
      title: "จากผลตรวจดิน สู่แผนเพาะปลูกใน 3 ขั้นตอน",
      description: "ออกแบบให้เกษตรกรและหน่วยงานตรวจดินใช้งานได้ทันที ไม่ต้องมีความรู้ด้านเทคนิค",
      items: [
        {
          title: "กรอกค่าดินจากใบผลตรวจ",
          body: "พิมพ์ค่า N-P-K และ pH จากใบผลแล็บหรือชุดตรวจดิน หรือเลือกดินตัวอย่างเพื่อทดลอง",
        },
        {
          title: "ระบบประเมินกับพืช 12 ชนิด",
          body: "เทียบค่าดินกับช่วงที่เหมาะสมของพืชแต่ละชนิด แสดงเป็นกราฟสมดุลธาตุอาหารและสเกล pH ที่อ่านง่าย",
        },
        {
          title: "รับอันดับพืชและแผนปรับปรุงดิน",
          body: "ได้อันดับพืชพร้อมคะแนน 0–100 สูตรปุ๋ยตามช่วงการเติบโต ทางเลือกอินทรีย์ และอัตราปูนปรับสภาพดิน",
        },
      ],
    },
    features: {
      eyebrow: "ฟีเจอร์",
      title: "ทุกอย่างที่ต้องใช้ในการตัดสินใจก่อนปลูก",
      entry: {
        title: "กรอกค่าจากใบผลตรวจได้ง่าย",
        body: "ทุกช่องบอกชื่อค่าที่ต้องหาบนใบผลแล็บ หน่วย และช่วงค่าปกติ พร้อมแสดงระดับต่ำ–สูงทันทีขณะพิมพ์",
      },
      plan: {
        title: "แผนปรับปรุงดินเฉพาะพืช",
        body: "วินิจฉัยธาตุที่ขาดหรือเกิน แนะนำสูตรปุ๋ยเคมี ปุ๋ยอินทรีย์ และปริมาณปูนต่อไร่",
      },
      economics: {
        title: "ประมาณการต้นทุนและกำไร",
        body: "คำนวณรายได้ ต้นทุน กำไรสุทธิ และ ROI ต่อไร่ เพื่อลดความเสี่ยงในการลงทุน",
      },
      history: {
        title: "เก็บประวัติและส่งออก PDF",
        body: "บันทึกผลทุกครั้ง ซิงค์ข้ามอุปกรณ์เมื่อเข้าสู่ระบบ และส่งออกรายงานเป็น PDF",
      },
      database: {
        title: "ฐานข้อมูลพืช 12 ชนิด",
        body: "ดูช่วงธาตุอาหารและ pH ที่เหมาะสมของพืชเศรษฐกิจไทย ทั้งธัญพืช ไม้ผล และพืชผัก",
      },
    },
    cta: {
      title: "พร้อมวิเคราะห์ดินแปลงของคุณแล้วหรือยัง?",
      body: "กรอกค่าดินตอนนี้ ได้ผลทันที ไม่มีค่าใช้จ่าย และไม่ต้องสมัครสมาชิก",
      primary: "เริ่มวิเคราะห์ดิน",
      secondary: "สร้างบัญชีเพื่อเก็บประวัติ",
    },
  },
  en: {
    hero: {
      badge: "Agronomy-based scoring · Consistent every time",
      titleLead: "Analyze your soil precisely.",
      titleAccent: "Grow for maximum yield.",
      description:
        "Turn lab values for nitrogen (N), phosphorus (P), potassium (K) and pH into ranked crop matches, a soil improvement plan and a return estimate — in seconds.",
      primaryCta: "Analyze soil for free",
      secondaryCta: "Browse crops",
      trust: ["Research-based criteria", "Free, nothing to install", "Works with any lab report"],
    },
    preview: {
      title: "Sample field analysis",
      subtitle: "Nakhon Ratchasima · Rainy season",
      topMatch: "Best match",
      crop: "Rice",
      cropEn: "Rice",
      score: "Suitability score",
      balance: "Nutrient balance",
      ranking: "Runners-up",
      others: [
        { name: "Corn", nameEn: "Corn", category: "Grain", score: 84 },
        { name: "Soybean", nameEn: "Soybean", category: "Grain", score: 78 },
      ],
      live: "Instant results",
    },
    stats: {
      crops: "Crops in the database",
      params: "Soil parameters scored",
      score: "Point suitability scale",
    },
    steps: {
      eyebrow: "How it works",
      title: "From soil test to planting plan in 3 steps",
      description: "Built for farmers and soil testing teams — no technical background needed.",
      items: [
        {
          title: "Enter your soil test values",
          body: "Type N-P-K and pH from a lab report or soil test kit, or pick a sample soil to try it out.",
        },
        {
          title: "Scored against 12 crops",
          body: "Your soil is compared with each crop's optimal range, shown as a nutrient balance chart and an easy pH scale.",
        },
        {
          title: "Get rankings and a soil plan",
          body: "See crops ranked 0–100 with stage-by-stage fertilizer formulas, organic alternatives and lime rates.",
        },
      ],
    },
    features: {
      eyebrow: "Features",
      title: "Everything you need to decide before you plant",
      entry: {
        title: "Easy entry from your lab report",
        body: "Each field shows the label to look for on your report, its unit and typical range, with live low/high feedback as you type.",
      },
      plan: {
        title: "Crop-specific soil plan",
        body: "Diagnoses deficiencies and excesses, then recommends chemical and organic fertilizer and lime per rai.",
      },
      economics: {
        title: "Cost and profit estimates",
        body: "Projects revenue, cost, net profit and ROI per rai so you can reduce investment risk.",
      },
      history: {
        title: "History and PDF export",
        body: "Every analysis is saved, synced across devices when signed in, and exportable as a PDF report.",
      },
      database: {
        title: "12-crop reference database",
        body: "Check the optimal nutrient and pH ranges for key Thai crops — grains, fruit and vegetables.",
      },
    },
    cta: {
      title: "Ready to analyze your field?",
      body: "Enter your soil values now. Instant results, free, no sign-up required.",
      primary: "Analyze soil",
      secondary: "Create an account to keep history",
    },
  },
})
