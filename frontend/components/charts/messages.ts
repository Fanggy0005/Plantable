import { defineMessages } from "@/lib/i18n/config"

export const chartMessages = defineMessages({
  th: {
    radar: {
      title: "สมดุลธาตุอาหาร",
      subtitle: "คะแนนความสอดคล้องรายธาตุ เทียบกับระดับที่พืชต้องการ",
      vs: (crop: string) => `เทียบกับ${crop}`,
      soil: "ดินของคุณ",
      target: "ระดับที่พืชต้องการ",
      match: "ความสอดคล้อง",
    },
    ph: {
      title: "ความเป็นกรด-ด่าง (pH)",
      measured: "ค่าที่วัดได้",
      acidic: "กรด",
      neutral: "กลาง",
      alkaline: "ด่าง",
      optimalFor: (crop: string, min: number, max: number) => `ช่วงที่เหมาะกับ${crop}: pH ${min}–${max}`,
      optimalGeneral: (min: number, max: number) => `ช่วงที่เหมาะสมทั่วไป: pH ${min}–${max}`,
      inRange: "อยู่ในช่วงที่เหมาะสม",
      outOfRange: "อยู่นอกช่วงที่เหมาะสม",
      status: {
        veryAcidic: "กรดจัดมาก",
        acidic: "กรดปานกลาง",
        slightlyAcidic: "กรดอ่อน",
        neutral: "เป็นกลาง",
        slightlyAlkaline: "ด่างอ่อน",
        alkaline: "ด่างจัด",
      },
    },
    score: "คะแนน",
  },
  en: {
    radar: {
      title: "Nutrient balance",
      subtitle: "Per-nutrient match score against the crop's requirement",
      vs: (crop: string) => `vs. ${crop}`,
      soil: "Your soil",
      target: "Crop requirement",
      match: "Match",
    },
    ph: {
      title: "Soil pH",
      measured: "Measured",
      acidic: "Acidic",
      neutral: "Neutral",
      alkaline: "Alkaline",
      optimalFor: (crop: string, min: number, max: number) => `Optimal for ${crop}: pH ${min}–${max}`,
      optimalGeneral: (min: number, max: number) => `General optimal range: pH ${min}–${max}`,
      inRange: "Within optimal range",
      outOfRange: "Outside optimal range",
      status: {
        veryAcidic: "Strongly acidic",
        acidic: "Moderately acidic",
        slightlyAcidic: "Slightly acidic",
        neutral: "Neutral",
        slightlyAlkaline: "Slightly alkaline",
        alkaline: "Strongly alkaline",
      },
    },
    score: "Score",
  },
})
