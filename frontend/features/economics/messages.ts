import { defineMessages } from "@/lib/i18n/config"

export const economicsMessages = defineMessages({
  th: {
    title: "ต้นทุนและผลตอบแทน",
    titleFor: (crop: string) => `ต้นทุนและผลตอบแทน: ${crop}`,
    description: "อ้างอิงสถิติสำนักงานเศรษฐกิจการเกษตร (สศก.) รวมค่าปรับปรุงดินเฉพาะแปลงของคุณ",
    area: "พื้นที่เพาะปลูก",
    decrease: "ลดพื้นที่",
    increase: "เพิ่มพื้นที่",
    kpi: {
      revenue: "รายได้คาดการณ์",
      cost: "ต้นทุนรวม",
      profit: "กำไรสุทธิ",
      roi: "ผลตอบแทน (ROI)",
      perRai: (v: string) => `${v} ต่อไร่`,
    },
    facts: {
      yield: "ผลผลิตเฉลี่ย",
      price: "ราคาขายหน้าสวน",
      fertilizer: "ค่าปุ๋ยปรับดิน",
    },
    breakEven: {
      title: "ราคาคุ้มทุน",
      body: (breakEven: string, market: string) =>
        `ต้องขายได้อย่างน้อย ${breakEven} ต่อกก. จึงจะไม่ขาดทุน (ราคาตลาดปัจจุบัน ${market} ต่อกก.)`,
      safe: "ราคาตลาดสูงกว่าจุดคุ้มทุน",
      risk: "ราคาตลาดต่ำกว่าจุดคุ้มทุน",
    },
    breakdown: {
      title: "สัดส่วนต้นทุนการผลิตต่อไร่",
      total: "รวม",
    },
    costCategories: {
      fertilizer: "ปุ๋ยและวัสดุปรับดิน",
      land_prep_labor: "เตรียมดินและค่าแรง",
      seeds: "เมล็ดพันธุ์/ท่อนพันธุ์",
      protection: "ป้องกันกำจัดศัตรูพืช",
      harvest_transport: "เก็บเกี่ยวและขนส่ง",
    } as Record<string, string>,
    error: "ไม่สามารถคำนวณความคุ้มค่าทางเศรษฐกิจได้",
    updating: "กำลังคำนวณใหม่...",
  },
  en: {
    title: "Costs & returns",
    titleFor: (crop: string) => `Costs & returns: ${crop}`,
    description: "Based on Office of Agricultural Economics statistics, including soil amendments for your plot.",
    area: "Planted area",
    decrease: "Decrease area",
    increase: "Increase area",
    kpi: {
      revenue: "Projected revenue",
      cost: "Total cost",
      profit: "Net profit",
      roi: "Return (ROI)",
      perRai: (v: string) => `${v} per rai`,
    },
    facts: {
      yield: "Average yield",
      price: "Farm-gate price",
      fertilizer: "Soil fertilizer cost",
    },
    breakEven: {
      title: "Break-even price",
      body: (breakEven: string, market: string) =>
        `You need to sell at ${breakEven}/kg or more to avoid a loss (current market price ${market}/kg).`,
      safe: "Market price is above break-even",
      risk: "Market price is below break-even",
    },
    breakdown: {
      title: "Production cost breakdown per rai",
      total: "Total",
    },
    costCategories: {
      fertilizer: "Fertilizer & amendments",
      land_prep_labor: "Land prep & labor",
      seeds: "Seeds & planting stock",
      protection: "Pest protection",
      harvest_transport: "Harvest & transport",
    } as Record<string, string>,
    error: "Unable to calculate crop economics",
    updating: "Recalculating...",
  },
})
