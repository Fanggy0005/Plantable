import { defineMessages } from "@/lib/i18n/config"

export const soilAnalysisMessages = defineMessages({
  th: {
    page: {
      eyebrow: "ตรวจดินแบบรวดเร็ว",
      title: "วิเคราะห์ดินและค้นหาพืชที่เหมาะสม",
      description:
        "บอกสภาพแปลงและกรอกผลตรวจดินจากห้องปฏิบัติการหรือชุดตรวจดินภาคสนาม ระบบจะจัดอันดับพืชที่ปลูกได้ดีและบอกว่าต้องปรับดินมากน้อยแค่ไหน",
    },
    site: {
      title: "สภาพแปลง",
      description: "ลักษณะที่เปลี่ยนแปลงได้ยาก ใช้คัดพืชที่ปลูกไม่ได้ออกก่อน",
      landType: "ลักษณะพื้นที่",
      landTypeHint: {
        lowland: "น้ำขังได้ในหน้าฝน เช่น ที่นา",
        upland: "น้ำไม่ขัง ระบายน้ำได้ดี",
      },
      waterSupply: "แหล่งน้ำ",
      waterSupplyHint: {
        rainfed: "มีน้ำเฉพาะหน้าฝน",
        seasonal_irrigation: "มีน้ำชลประทานบางช่วง",
        year_round: "มีบ่อ/คลอง/ชลประทานตลอดปี",
      },
      soilTexture: "เนื้อดิน",
      soilTextureHint: {
        clay: "ปั้นเป็นเส้นยาวได้ เหนียวติดมือ",
        loam: "ปั้นเป็นก้อนได้แต่แตกง่าย",
        sandy: "สากมือ ปั้นไม่เป็นก้อน",
      },
    },
    soil: {
      title: "ผลตรวจดิน",
      description: "เลือกตามแหล่งที่มาของผลตรวจ",
      modes: {
        lab: { label: "ผลจากห้องปฏิบัติการ", desc: "ใบรายงานเป็นตัวเลข เช่น จากกรมพัฒนาที่ดิน" },
        test_kit: { label: "ชุดตรวจดินภาคสนาม", desc: "อ่านผลเป็นระดับ ต่ำ / ปานกลาง / สูง" },
      },
      onReport: "บนใบผลตรวจ:",
      ph: { hint: "พืชส่วนใหญ่ชอบ pH 5.5 – 7.0", report: "“ความเป็นกรด-ด่าง” หรือ “pH (1:1)”" },
      organicMatter: {
        hint: "ใช้ประเมินไนโตรเจนด้วย เพราะใบผลตรวจส่วนใหญ่ไม่รายงาน N",
        report: "“อินทรียวัตถุ” หรือ “OM (%)”",
      },
      phosphorus: {
        hint: "ช่วยการเจริญของราก ดอก และเมล็ด",
        report: "“ฟอสฟอรัสที่เป็นประโยชน์” หรือ “Available P (Bray II)”",
      },
      potassium: {
        hint: "ช่วยสะสมแป้งและน้ำตาล เพิ่มความต้านทานโรค",
        report: "“โพแทสเซียมที่แลกเปลี่ยนได้” หรือ “Exchangeable K”",
      },
      kitHint: "เลือกระดับตามสีที่อ่านได้จากชุดตรวจ",
      kitNitrogen: "ชุดตรวจไม่วัดอินทรียวัตถุ ระบบจะประเมินจากระดับไนโตรเจน",
      placeholder: "เช่น",
    },
    context: {
      title: "ข้อมูลเพิ่มเติม",
      notes: "ชื่อแปลงหรือบันทึก",
      optional: "ไม่บังคับ",
      notesPlaceholder: "เช่น แปลงข้าวทุ่งกุลา แปลงที่ 2",
    },
    form: {
      submit: "วิเคราะห์และแนะนำพืช",
      submitting: "กำลังประมวลผล...",
      errors: {
        incomplete: "กรุณากรอกข้อมูลให้ครบทุกช่อง",
        phRange: "ค่า pH ต้องอยู่ระหว่าง 3 ถึง 10",
        organicMatterRange: "อินทรียวัตถุต้องอยู่ระหว่าง 0 ถึง 100 %",
        negative: "ค่าฟอสฟอรัสและโพแทสเซียมต้องไม่ติดลบ",
        failed: "เกิดข้อผิดพลาดในการคำนวณ กรุณาลองใหม่อีกครั้ง",
      },
      presetApplied: (name: string) => `ใช้ค่าตัวอย่าง: ${name}`,
      presetNote: (name: string) => `ตัวอย่างข้อมูล: ${name}`,
    },
    guide: {
      title: "ยังไม่มีผลตรวจดิน?",
      items: [
        "ส่งตัวอย่างดินตรวจได้ที่สถานีพัฒนาที่ดินประจำจังหวัด หรือใช้ชุดตรวจดินภาคสนาม",
        "เก็บดินลึก 0–15 ซม. จากหลายจุดในแปลงแล้วผสมรวมกัน จะได้ค่าที่สะท้อนทั้งแปลง",
        "ทดสอบเนื้อดินด้วยมือ: ปั้นดินชื้นเป็นเส้น ถ้าเป็นเส้นยาวคือดินเหนียว ถ้าไม่เป็นก้อนคือดินทราย",
      ],
      estimatedTitle: "ค่าที่ระบบประเมินให้",
      estimated: "ผลแล็บ: ประเมินไนโตรเจนจากอินทรียวัตถุ · ชุดตรวจ: ประเมินอินทรียวัตถุจากไนโตรเจน",
    },
    presets: {
      title: "ลองใช้ค่าตัวอย่าง",
      description: "คลิกเพื่อเติมค่าอัตโนมัติ",
      items: {
        paddy: { name: "นาลุ่มดินเหนียว", desc: "ผลแล็บ · pH 5.8" },
        upland: { name: "ไร่ดอนดินร่วน", desc: "ผลแล็บ · pH 6.4" },
        sandy: { name: "ดินทรายอาศัยฝน", desc: "ชุดตรวจ · pH 5.2" },
        acidic: { name: "ดินเปรี้ยวจัด", desc: "ผลแล็บ · pH 4.3" },
      } as Record<string, { name: string; desc: string }>,
    },
  },
  en: {
    page: {
      eyebrow: "Quick soil check",
      title: "Analyze soil & find the right crops",
      description:
        "Describe your plot and enter a lab report or a field test kit result. We rank the crops that grow well and show how much soil work each one needs.",
    },
    site: {
      title: "Plot conditions",
      description: "Things that are hard to change. Crops that cannot grow here are filtered out first.",
      landType: "Land type",
      landTypeHint: {
        lowland: "Floods in the rainy season, e.g. paddy",
        upland: "No standing water, drains well",
      },
      waterSupply: "Water supply",
      waterSupplyHint: {
        rainfed: "Water only in the rainy season",
        seasonal_irrigation: "Irrigation for part of the year",
        year_round: "Pond, canal or irrigation all year",
      },
      soilTexture: "Soil texture",
      soilTextureHint: {
        clay: "Rolls into a long ribbon, sticky",
        loam: "Forms a ball that crumbles",
        sandy: "Gritty, will not form a ball",
      },
    },
    soil: {
      title: "Soil test result",
      description: "Choose where your result comes from",
      modes: {
        lab: { label: "Lab report", desc: "Numbers on a report, e.g. from the Land Development Dept." },
        test_kit: { label: "Field test kit", desc: "Read as low / medium / high" },
      },
      onReport: "On your report:",
      ph: { hint: "Most crops like pH 5.5 – 7.0", report: "“pH (1:1)” or “ความเป็นกรด-ด่าง”" },
      organicMatter: {
        hint: "Also used to estimate nitrogen, which most lab reports leave out",
        report: "“Organic matter” or “OM (%)”",
      },
      phosphorus: {
        hint: "Supports roots, flowers and seeds",
        report: "“Available P (Bray II)” or “ฟอสฟอรัสที่เป็นประโยชน์”",
      },
      potassium: {
        hint: "Builds starch and sugar, improves disease resistance",
        report: "“Exchangeable K” or “โพแทสเซียมที่แลกเปลี่ยนได้”",
      },
      kitHint: "Pick the level that matches the kit's color chart",
      kitNitrogen: "Kits don't measure organic matter, so it is estimated from nitrogen",
      placeholder: "e.g.",
    },
    context: {
      title: "More details",
      notes: "Plot name or notes",
      optional: "Optional",
      notesPlaceholder: "e.g. Rice plot 2, Thung Kula",
    },
    form: {
      submit: "Analyze & recommend crops",
      submitting: "Analyzing...",
      errors: {
        incomplete: "Please fill in every field",
        phRange: "pH must be between 3 and 10",
        organicMatterRange: "Organic matter must be between 0 and 100 %",
        negative: "Phosphorus and potassium can't be negative",
        failed: "Calculation failed. Please try again.",
      },
      presetApplied: (name: string) => `Sample applied: ${name}`,
      presetNote: (name: string) => `Sample data: ${name}`,
    },
    guide: {
      title: "No soil test yet?",
      items: [
        "Send a sample to your provincial Land Development station, or use a field test kit",
        "Take soil 0–15 cm deep from several spots and mix it, so the result reflects the whole plot",
        "Hand texture test: roll moist soil into a ribbon. A long ribbon means clay; if it won't hold together, it's sandy",
      ],
      estimatedTitle: "Estimated values",
      estimated: "Lab report: nitrogen is estimated from organic matter · Test kit: organic matter is estimated from nitrogen",
    },
    presets: {
      title: "Try a sample soil",
      description: "Click to fill the form",
      items: {
        paddy: { name: "Lowland clay paddy", desc: "Lab · pH 5.8" },
        upland: { name: "Upland loam field", desc: "Lab · pH 6.4" },
        sandy: { name: "Rainfed sandy soil", desc: "Test kit · pH 5.2" },
        acidic: { name: "Strongly acidic soil", desc: "Lab · pH 4.3" },
      } as Record<string, { name: string; desc: string }>,
    },
  },
})
