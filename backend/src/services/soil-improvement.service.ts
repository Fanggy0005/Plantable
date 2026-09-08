import type {
  SoilInput,
  SoilImprovementPlan,
  NutrientDiagnostic,
  FertilizerScheduleItem,
  OrganicAlternative,
  PhCorrectionPlan,
  NutrientDeficiencyStatus,
} from "../types"
import type { Crop, CropRequirement } from "../generated/prisma"

export interface CropContext {
  id: string
  name: string
  nameTh: string
  requirement?: CropRequirement | null
}

// Standard agricultural reference benchmarks (General soil baseline mg/kg)
const DEFAULT_BENCHMARKS = {
  nitrogen: { min: 80, max: 160, optimal: 120 },
  phosphorus: { min: 30, max: 70, optimal: 50 },
  potassium: { min: 40, max: 100, optimal: 70 },
  ph: { min: 5.5, max: 7.0, optimal: 6.5 },
}

/**
 * Classify nutrient status into 5-tier deficiency scale
 */
export function classifyNutrientStatus(
  value: number,
  min: number,
  max: number
): { status: NutrientDeficiencyStatus; labelTh: string } {
  if (value < min * 0.6) {
    return { status: "severe_deficiency", labelTh: "ขาดแคลนรุนแรง (วิกฤต)" }
  }
  if (value < min) {
    return { status: "mild_deficiency", labelTh: "ต่ำกว่าเกณฑ์ที่พืชต้องการ" }
  }
  if (value > max * 1.4) {
    return { status: "severe_excess", labelTh: "สะสมสูงเกินเกณฑ์มาก (อาจเป็นพิษ)" }
  }
  if (value > max) {
    return { status: "mild_excess", labelTh: "ค่อนข้างสูงกว่าเกณฑ์" }
  }
  return { status: "optimal", labelTh: "สมบูรณ์เหมาะสมตามเกณฑ์" }
}

/**
 * Perform nutrient deficiency diagnostics
 */
export function diagnoseNutrientDeficiencies(
  soil: SoilInput,
  cropReq?: CropRequirement | null
): NutrientDiagnostic[] {
  const req = {
    nitrogen: {
      min: cropReq?.nitrogenMin ?? DEFAULT_BENCHMARKS.nitrogen.min,
      max: cropReq?.nitrogenMax ?? DEFAULT_BENCHMARKS.nitrogen.max,
      optimal: cropReq?.nitrogenOptimal ?? DEFAULT_BENCHMARKS.nitrogen.optimal,
    },
    phosphorus: {
      min: cropReq?.phosphorusMin ?? DEFAULT_BENCHMARKS.phosphorus.min,
      max: cropReq?.phosphorusMax ?? DEFAULT_BENCHMARKS.phosphorus.max,
      optimal: cropReq?.phosphorusOptimal ?? DEFAULT_BENCHMARKS.phosphorus.optimal,
    },
    potassium: {
      min: cropReq?.potassiumMin ?? DEFAULT_BENCHMARKS.potassium.min,
      max: cropReq?.potassiumMax ?? DEFAULT_BENCHMARKS.potassium.max,
      optimal: cropReq?.potassiumOptimal ?? DEFAULT_BENCHMARKS.potassium.optimal,
    },
    ph: {
      min: cropReq?.phMin ?? DEFAULT_BENCHMARKS.ph.min,
      max: cropReq?.phMax ?? DEFAULT_BENCHMARKS.ph.max,
      optimal: cropReq?.phOptimal ?? DEFAULT_BENCHMARKS.ph.optimal,
    },
  }

  // 1. Nitrogen
  const nClass = classifyNutrientStatus(soil.nitrogen, req.nitrogen.min, req.nitrogen.max)
  let nSymptoms = "การเจริญเติบโตปกติ ใบเขียวสด ลำต้นแข็งแรงสมบูรณ์"
  let nImpact = "พืชสามารถสังเคราะห์แสง สร้างโปรตีนและคลอโรฟิลล์ได้อย่างมีประสิทธิภาพสูงสุด"
  if (nClass.status === "severe_deficiency" || nClass.status === "mild_deficiency") {
    nSymptoms = "ใบแก่ด้านล่างเริ่มเปลี่ยนเป็นสีเหลืองซีด (Chlorosis) ลำต้นแคระแกร็น แตกกิ่งก้านน้อย"
    nImpact = "ชะลอการสังเคราะห์แสง ยอดชะงักการเจริญเติบโต ผลผลิตลดลงอย่างเห็นได้ชัด"
  } else if (nClass.status === "severe_excess" || nClass.status === "mild_excess") {
    nSymptoms = "ใบมีสีเขียวเข้มจัด ลำต้นอวบน้ำเกินไป ข้อปล้องยืดยาว กิ่งเปราะหักง่าย"
    nImpact = "พืชเกิดภาวะ 'บ้าใบ' ออกดอกติดผลช้าลง และดึงดูดแมลงศัตรูพืชรวมถึงเชื้อราได้ง่าย"
  }

  // 2. Phosphorus
  const pClass = classifyNutrientStatus(soil.phosphorus, req.phosphorus.min, req.phosphorus.max)
  let pSymptoms = "ระบบรากแผ่ขยายดี รากฝอยสมบูรณ์ การสร้างตาดอกและเมล็ดเป็นไปตามวัฏจักร"
  let pImpact = "การถ่ายทอดพลังงานระดับเซลล์ (ATP) และการแบ่งเซลล์ของพืชทำงานได้อย่างราบรื่น"
  if (pClass.status === "severe_deficiency" || pClass.status === "mild_deficiency") {
    pSymptoms = "รากเจริญช้า แคระแกร็น ใบแก่มีสีเขียวเข้มปนม่วงอมแดงตามขอบใบและเส้นใบ ลำต้นลีบ"
    pImpact = "การออกดอกและการติดผลลดลง เมล็ดลีบ ระยะเวลาเก็บเกี่ยวล่าช้ากว่ากำหนด"
  } else if (pClass.status === "severe_excess" || pClass.status === "mild_excess") {
    pSymptoms = "ไม่ค่อยแสดงอาการผิดปกติชัดเจนที่ใบ แต่พืชอาจแสดงอาการขาดธาตุสังกะสีหรือเหล็ก"
    pImpact = "ฟอสฟอรัสส่วนเกินจะเข้าจับกับสังกะสี (Zn) เหล็ก (Fe) และแมกนีเซียม ทำให้รากพืชดูดซึมจุลธาตุไม่ได้"
  }

  // 3. Potassium
  const kClass = classifyNutrientStatus(soil.potassium, req.potassium.min, req.potassium.max)
  let kSymptoms = "ขอบใบเรียบ ปลายใบไม่ไหม้ ลำต้นเหนียวทนลม ทนต่อสภาพแล้งได้ดี ผลผลิตมีน้ำหนัก"
  let kImpact = "การเปิด-ปิดปากใบทำงานสมบูรณ์ การลำเลียงแป้งและน้ำตาลไปยังผลผลิตมีประสิทธิภาพสูง"
  if (kClass.status === "severe_deficiency" || kClass.status === "mild_deficiency") {
    kSymptoms = "ปลายใบและขอบใบแก่มีรอยไหม้เกรียมสีน้ำตาล (Marginal Scorch) ก้านใบอ่อนแอ หักพับง่าย"
    kImpact = "ผลผลิตไม่สะสมแป้ง/น้ำตาล ขนาดผลลีบเล็ก พืชทนแล้งและทนโรคราได้ต่ำ"
  } else if (kClass.status === "severe_excess" || kClass.status === "mild_excess") {
    kSymptoms = "พืชอาจเกิดอาการขาดแคลเซียมหรือแมกนีเซียม เช่น ยอดหงิก หรือปลายใบเป็นจุดด่าง"
    kImpact = "เกิดการแย่งดูดซึม (Antagonism) ขัดขวางการรับประจุ Ca2+ และ Mg2+ เข้าสู่ลำต้น"
  }

  // 4. pH
  let phStatus: NutrientDeficiencyStatus = "optimal"
  let phLabelTh = "สมดุลกรด-ด่างเหมาะสมดีมาก"
  let phSymptoms = "ธาตุอาหารหลักและจุลธาตุละลายตัวได้สมดุล จุลินทรีย์ดินทำงานได้อย่างมีประสิทธิภาพ"
  let phImpact = "ระบบรากสามารถดูดซึมปุ๋ยได้เกิน 80-90% ของปริมาณที่ใส่ลงไป"

  if (soil.ph < 4.5) {
    phStatus = "severe_deficiency"
    phLabelTh = "ดินเป็นกรดจัดรุนแรง (ดินเปรี้ยวจัด)"
    phSymptoms = "ปลายรากเน่า ชะงักงัน รากไม่ขยายตัว พืชแคระแกร็น ปลายใบไหม้"
    phImpact = "อะลูมิเนียม (Al) และแมงกานีส (Mn) ละลายออกมาเป็นพิษ ฟอสฟอรัสถูกตรึงจนพืชใช้ไม่ได้"
  } else if (soil.ph < 5.5) {
    phStatus = "mild_deficiency"
    phLabelTh = "ดินเป็นกรดปานกลาง (ค่อนข้างเปรี้ยว)"
    phSymptoms = "พืชโตช้ากว่าปกติเล็กน้อย การตอบสนองต่อปุ๋ยเคมีต่ำกว่าที่ควร"
    phImpact = "จุลินทรีย์ที่เป็นประโยชน์ทำงานช้าลง ธาตุฟอสฟอรัส แคลเซียม และแมกนีเซียมถูกตรึงบางส่วน"
  } else if (soil.ph > 8.0) {
    phStatus = "severe_excess"
    phLabelTh = "ดินเป็นด่างจัดรุนแรง"
    phSymptoms = "ใบอ่อนเหลืองซีด ขาดธาตุเหล็กและสังกะสีอย่างรุนแรง ดินจับตัวแน่นแข็งเมื่อแห้ง"
    phImpact = "ธาตุเหล็ก (Fe) สังกะสี (Zn) ทองแดง (Cu) ตกตะกอน พืชดูดไปใช้ไม่ได้เลย"
  } else if (soil.ph > 7.3) {
    phStatus = "mild_excess"
    phLabelTh = "ดินเป็นด่างอ่อน"
    phSymptoms = "ยอดอ่อนอาจมีสีเขียวซีดเล็กน้อย ดินมีปริมาณแคลเซียมคาร์บอเนตสูง"
    phImpact = "จุลธาตุอาหารบางชนิดเริ่มละลายตัวยากขึ้น ควรระวังการสะสมเกลือ"
  }

  return [
    {
      nutrient: "nitrogen",
      name: "Nitrogen (N)",
      nameTh: "ไนโตรเจน",
      currentValue: soil.nitrogen,
      optimalRange: req.nitrogen,
      status: nClass.status,
      statusLabelTh: nClass.labelTh,
      symptomsTh: nSymptoms,
      impactTh: nImpact,
    },
    {
      nutrient: "phosphorus",
      name: "Phosphorus (P)",
      nameTh: "ฟอสฟอรัส",
      currentValue: soil.phosphorus,
      optimalRange: req.phosphorus,
      status: pClass.status,
      statusLabelTh: pClass.labelTh,
      symptomsTh: pSymptoms,
      impactTh: pImpact,
    },
    {
      nutrient: "potassium",
      name: "Potassium (K)",
      nameTh: "โพแทสเซียม",
      currentValue: soil.potassium,
      optimalRange: req.potassium,
      status: kClass.status,
      statusLabelTh: kClass.labelTh,
      symptomsTh: kSymptoms,
      impactTh: kImpact,
    },
    {
      nutrient: "ph",
      name: "Soil pH",
      nameTh: "ระดับความเป็นกรด-ด่าง",
      currentValue: soil.ph,
      optimalRange: req.ph,
      status: phStatus,
      statusLabelTh: phLabelTh,
      symptomsTh: phSymptoms,
      impactTh: phImpact,
    },
  ]
}

/**
 * Generate commercial fertilizer schedule with precise formulas and timing
 */
export function calculateFertilizerPlan(
  soil: SoilInput,
  cropReq?: CropRequirement | null
): FertilizerScheduleItem[] {
  const req = {
    nitrogen: { min: cropReq?.nitrogenMin ?? 80, optimal: cropReq?.nitrogenOptimal ?? 120 },
    phosphorus: { min: cropReq?.phosphorusMin ?? 30, optimal: cropReq?.phosphorusOptimal ?? 50 },
    potassium: { min: cropReq?.potassiumMin ?? 40, optimal: cropReq?.potassiumOptimal ?? 70 },
  }

  const nDeficit = Math.max(0, req.nitrogen.optimal - soil.nitrogen)
  const pDeficit = Math.max(0, req.phosphorus.optimal - soil.phosphorus)
  const kDeficit = Math.max(0, req.potassium.optimal - soil.potassium)

  const schedule: FertilizerScheduleItem[] = []

  // 1. Basal stage (รองพื้นก่อนปลูก / พร้อมปลูก)
  if (pDeficit > 30) {
    schedule.push({
      stage: "ระยะรองพื้นก่อนปลูก (Basal Dressing)",
      formula: "18-46-0 (ไดแอมโมเนียมฟอสเฟต) หรือ 0-46-0",
      rateKgPerRai: 25,
      rateKgPerHectare: 156,
      timing: "ใส่พร้อมเตรียมดินก่อนหยอดเมล็ดหรือปักดำ 1-2 วัน",
      instructions: "คลุกเคล้าลงในดินชั้นล่างระดับความลึก 10-15 ซม. เพื่อให้รากพืชวัยอ่อนสัมผัสและนำไปใช้พัฒนาท่อลำเลียง",
    })
  } else if (pDeficit > 10 || (nDeficit > 20 && kDeficit > 20)) {
    schedule.push({
      stage: "ระยะรองพื้นก่อนปลูก (Basal Dressing)",
      formula: "16-16-16 หรือ 15-15-15 (สูตรเสมอครบส่วน)",
      rateKgPerRai: 25,
      rateKgPerHectare: 156,
      timing: "โรยรองก้นหลุมหรือหว่านก่อนไถคราดขั้นสุดท้าย",
      instructions: "ช่วยสร้างโครงสร้างรากและลำต้นในระยะตั้งตัว ป้องกันอาการขาดธาตุอาหารช่วง 3 สัปดาห์แรก",
    })
  } else {
    schedule.push({
      stage: "ระยะรองพื้นก่อนปลูก (Basal Dressing)",
      formula: "16-8-8 หรือ ปุ๋ยอินทรีย์เคมีสูตรสมดุล",
      rateKgPerRai: 15,
      rateKgPerHectare: 94,
      timing: "รองก้นหลุมก่อนปลูก",
      instructions: "ดินมีธาตุอาหารสำรองพอสมควร ให้เน้นปุ๋ยตั้งตัวปริมาณพอเหมาะควบคู่กับการให้น้ำสม่ำเสมอ",
    })
  }

  // 2. Vegetative stage (แต่งหน้าช่วงเจริญเติบโตเร่งใบและลำต้น 20-30 วัน)
  if (soil.nitrogen > 180) {
    schedule.push({
      stage: "ระยะเจริญเติบโตแตกกอ/กิ่งก้าน (Vegetative Stage)",
      formula: "งดใส่ปุ๋ยไนโตรเจนสูง (0-0-60 หรือ 13-13-21 เท่านั้น)",
      rateKgPerRai: 10,
      rateKgPerHectare: 62,
      timing: "อายุ 25-30 วันหลังปลูก",
      instructions: "ไนโตรเจนในดินสูงเกินไปแล้ว การเติมยูเรียจะทำให้เกิดโรคระบาดและลำต้นล้มง่าย ให้เสริมเฉพาะโพแทสเซียมเพื่อช่วยลำต้นแข็งแกร่ง",
    })
  } else if (nDeficit > 30) {
    schedule.push({
      stage: "ระยะเจริญเติบโตเร่งใบ/แตกกอ (Vegetative Stage)",
      formula: "46-0-0 (ยูเรีย) หรือ 21-0-0 (แอมโมเนียมซัลเฟต)",
      rateKgPerRai: 20,
      rateKgPerHectare: 125,
      timing: "อายุ 20-30 วันหลังงอก/ปักดำ ขณะดินมีความชื้น",
      instructions: "หว่านให้สม่ำเสมอในขณะดินชื้น ห้ามหว่านตอนใบเปียกน้ำค้าง ควรให้น้ำตามทันทีเพื่อป้องกันการระเหยของก๊าซแอมโมเนีย",
    })
  } else {
    schedule.push({
      stage: "ระยะเจริญเติบโตทั่วไป (Vegetative Stage)",
      formula: "46-0-0 ผสม 16-16-16 (อัตราส่วน 1:1)",
      rateKgPerRai: 15,
      rateKgPerHectare: 94,
      timing: "อายุ 25-35 วันหลังปลูก",
      instructions: "บำรุงการแตกแขนงและรักษาคลอโรฟิลล์ของใบให้เขียวสมบูรณ์อย่างต่อเนื่อง",
    })
  }

  // 3. Reproductive & Yield stage (แต่งหน้าสะสมแป้ง/สร้างผลผลิต/ออกรวง 45-60 วัน)
  if (kDeficit > 25 || cropReq) {
    schedule.push({
      stage: "ระยะสร้างผลผลิต/สะสมแป้งและน้ำตาล (Reproductive Stage)",
      formula: "0-0-60 (โพแทสเซียมคลอไรด์) หรือ 13-13-21",
      rateKgPerRai: 20,
      rateKgPerHectare: 125,
      timing: "ระยะก่อนออกดอก หรือสร้างเมล็ด/ลงหัว (45-60 วันหลังปลูก)",
      instructions: "ช่วยลำเลียงน้ำตาลและคาร์โบไฮเดรตจากใบลงสู่ผลผลิต เพิ่มน้ำหนักเมล็ด เพิ่มความหวาน และเสริมความทนทานต่อโรค",
    })
  } else {
    schedule.push({
      stage: "ระยะสร้างผลผลิต (Reproductive Stage)",
      formula: "8-24-24 หรือ 15-5-20",
      rateKgPerRai: 15,
      rateKgPerHectare: 94,
      timing: "ระยะเริ่มแทงช่อดอกหรือติดผลอ่อน",
      instructions: "เสริมความเต่งตึงของผลผลิต ลดการร่วงหล่น และเพิ่มคุณภาพผลผลิตก่อนเก็บเกี่ยว",
    })
  }

  return schedule
}

/**
 * Calculate soil pH amendments & lime/dolomite requirement
 */
export function calculatePhCorrection(ph: number): PhCorrectionPlan {
  if (ph < 4.5) {
    return {
      currentPh: ph,
      category: "strongly_acidic",
      categoryTh: "ดินเป็นกรดจัดรุนแรง (ดินเปรี้ยวจัด)",
      recommendedMaterial: "โดโลไมท์ (Dolomite) หรือ ปูนขาวเผา (Agricultural Lime CaCO3)",
      dosageKgPerRai: 400,
      dosageKgPerHectare: 2500,
      applicationMethodTh:
        "หว่านโดโลไมท์ให้ทั่วแปลง แล้วไถดะคลุกเคล้าลงในดินความลึก 15-20 ซม. รดน้ำให้ชื้นและพักดินทิ้งไว้ 15-30 วัน เพื่อให้ปฏิกิริยาสะเทินกรดทำงานเสร็จสิ้นก่อนเริ่มเพาะปลูก",
    }
  }

  if (ph < 5.5) {
    return {
      currentPh: ph,
      category: "moderately_acidic",
      categoryTh: "ดินเป็นกรดปานกลาง",
      recommendedMaterial: "โดโลไมท์ (Dolomite) หรือ ปูนมาร์ล (Marl)",
      dosageKgPerRai: 200,
      dosageKgPerHectare: 1250,
      applicationMethodTh:
        "หว่านปรับสภาพดินก่อนไถพรวนรอบสุดท้าย 1-2 สัปดาห์ โดโลไมท์จะช่วยเติมทั้งธาตุแคลเซียมและแมกนีเซียมไปพร้อมกับการปรับลดความเป็นกรด",
    }
  }

  if (ph > 7.5) {
    return {
      currentPh: ph,
      category: "alkaline",
      categoryTh: "ดินเป็นด่างเกินเกณฑ์",
      recommendedMaterial: "ยิปซัมเกษตร (Gypsum CaSO4) ร่วมกับปุ๋ยหมักอินทรีย์หรือกำมะถันผง",
      dosageKgPerRai: 150,
      dosageKgPerHectare: 938,
      applicationMethodTh:
        "หว่านยิปซัมเกษตรและคลุกเคล้ากับปุ๋ยคอกหมัก ยิปซัมจะช่วยปลดปล่อยโซเดียมส่วนเกินและทำให้อนุภาคดินโปร่งร่วนซุยขึ้น ช่วยลดความเป็นด่างของดินลงอย่างเป็นธรรมชาติ",
    }
  }

  return {
    currentPh: ph,
    category: "optimal",
    categoryTh: "ระดับกรด-ด่างสมบูรณ์เหมาะสมดีเยี่ยม (5.5 - 7.5)",
    recommendedMaterial: "ไม่จำเป็นต้องใช้วัสดุปรับปรุงค่า pH",
    dosageKgPerRai: 0,
    dosageKgPerHectare: 0,
    applicationMethodTh:
      "สภาพความเป็นกรด-ด่างอยู่ในเกณฑ์ทองคำสำหรับการเพาะปลูก ให้รักษาสภาพความอุดมสมบูรณ์ด้วยการเติมอินทรียวัตถุหรือปุ๋ยหมักตามฤดูกาลปกติ",
  }
}

/**
 * Organic, biological, and eco-friendly soil amendments
 */
export function getOrganicAlternatives(soil: SoilInput): OrganicAlternative[] {
  const alternatives: OrganicAlternative[] = [
    {
      nameTh: "ปุ๋ยหมักมูลวัว / มูลไส้เดือนดิน (Vermicompost)",
      type: "manure",
      targetNutrient: "อินทรียวัตถุ (OM) + ไนโตรเจน (N) + ปรับโครงสร้างดิน",
      rateTh: "1,000 - 2,000 กก./ไร่ (หว่านตอนเตรียมดิน)",
      benefitTh:
        "เพิ่มช่องว่างในดิน เพิ่มความสามารถในการอุ้มน้ำ และเป็นแหล่งอาหารชั้นดีให้จุลินทรีย์ดินเปลี่ยนปุ๋ยเคมีให้อยู่ในรูปที่พืชดูดซึมได้",
    },
    {
      nameTh: "ปุ๋ยพืชสดตระกูลถั่ว (ปอเทือง / โสนอัฟริกัน)",
      type: "green_manure",
      targetNutrient: "ไนโตรเจนชีวภาพธรรมชาติ (N)",
      rateTh: "หว่านเมล็ด 5 กก./ไร่ ไถกลบระยะออกดอก (อายุ 45-50 วัน)",
      benefitTh:
        "ปมรากถั่วตรึงไนโตรเจนอิสระจากอากาศได้เทียบเท่ายูเรีย 15-20 กก./ไร่ พร้อมเพิ่มอินทรียวัตถุสดมหาศาลช่วยลดต้นทุนค่าปุ๋ยเคมีได้มากกว่า 40%",
    },
    {
      nameTh: "มูลค้างคาว หรือหินร็อคฟอสเฟตบด (Rock Phosphate)",
      type: "rock_mineral",
      targetNutrient: "ฟอสฟอรัสธรรมชาติ (P2O5)",
      rateTh: "50 - 100 กก./ไร่",
      benefitTh:
        "เป็นแหล่งฟอสฟอรัสที่ละลายปลดปล่อยอย่างต่อเนื่อง ไม่ตกตะกอนง่าย ช่วยเร่งระบบรากแตกแขนงและกระตุ้นการออกดอกติดผลอย่างยั่งยืน",
    },
    {
      nameTh: "ขี้เถ้าแกลบดำ / ไบโอชาร์ (Biochar) / ขี้เถ้าเตาชีวมวล",
      type: "rock_mineral",
      targetNutrient: "โพแทสเซียม (K2O) + ซิลิกา (Si) + รูพรุนดูดซับธาตุอาหาร",
      rateTh: "200 - 500 กก./ไร่",
      benefitTh:
        "อุดมด้วยโพแทสเซียมธรรมชาติและซิลิกาช่วยให้เซลล์พืชแข็งแกร่ง รูพรุนขนาดเล็กของไบโอชาร์ทำหน้าที่เป็น 'คลังเก็บปุ๋ย' ไม่ให้ถูกน้ำฝนชะล้าง",
    },
    {
      nameTh: "น้ำหมักชีวภาพ (EM หรือ สารเร่ง พด.2)",
      type: "bio_fertilizer",
      targetNutrient: "เอนไซม์ กรดอะมิโน และจุลินทรีย์ละลายธาตุอาหาร",
      rateTh: "อัตรา 20-40 ซีซี ต่อน้ำ 20 ลิตร ฉีดพ่นลงดินทุก 10-15 วัน",
      benefitTh:
        "ช่วยย่อยสลายสารอินทรีย์ ปลดปล่อยฟอสฟอรัสและจุลธาตุอาหารที่ตกค้างในดินให้รากพืชดูดกลับมาใช้ใหม่อย่างรวดเร็ว",
    },
  ]

  return alternatives
}

/**
 * Main Service Class for Soil Improvement & Fertilizer Plan
 */
export class SoilImprovementService {
  generatePlan(soil: SoilInput, crop?: CropContext | null): SoilImprovementPlan {
    const cropReq = crop?.requirement ?? null
    const diagnostics = diagnoseNutrientDeficiencies(soil, cropReq)
    const fertilizerRecommendations = calculateFertilizerPlan(soil, cropReq)
    const phCorrection = calculatePhCorrection(soil.ph)
    const organicAlternatives = getOrganicAlternatives(soil)

    // Calculate composite soil health score (0-100)
    let scoreTotal = 0
    for (const d of diagnostics) {
      if (d.status === "optimal") scoreTotal += 25
      else if (d.status === "mild_deficiency" || d.status === "mild_excess") scoreTotal += 16
      else scoreTotal += 7 // severe
    }

    let overallConditionTh = "ดินมีสุขภาพดีและมีความสมบูรณ์สูงพร้อมสำหรับการเพาะปลูก"
    if (scoreTotal < 50) {
      overallConditionTh = "ดินมีภาวะขาดแคลนธาตุอาหารหรือกรด-ด่างไม่สมดุลรุนแรง จำเป็นต้องปรับปรุงดินก่อนเพาะปลูก"
    } else if (scoreTotal < 75) {
      overallConditionTh = "ดินมีความสมบูรณ์ปานกลาง มีธาตุอาหารบางส่วนต่ำกว่าเกณฑ์ ควรเสริมปุ๋ยตามตารางแนะนำ"
    }

    const generalTipsTh = [
      "ควรตรวจวัดความชื้นของดินก่อนใส่ปุ๋ยเคมีทุกครั้ง ห้ามใส่ปุ๋ยในขณะที่ดินแห้งสนิทเพราะอาจทำให้รากพืชไหม้ได้",
      "การใส่ปุ๋ยแบบแบ่งใส่ 2-3 ครั้ง ให้ประสิทธิภาพการดูดซึมสูงกว่าการใส่ปริมาณมากในครั้งเดียวถึง 35-40%",
      "ควรเสริมอินทรียวัตถุหรือปุ๋ยหมักทุกปีหลังเก็บเกี่ยว เพื่อรักษาค่าประจุแลกเปลี่ยน (CEC) และคงความร่วนซุยของดินในระยะยาว",
    ]

    return {
      cropId: crop?.id,
      cropName: crop?.name,
      cropNameTh: crop?.nameTh,
      soilHealthScore: scoreTotal,
      overallConditionTh,
      diagnostics,
      fertilizerRecommendations,
      organicAlternatives,
      phCorrection,
      generalTipsTh,
    }
  }
}

export const soilImprovementService = new SoilImprovementService()
