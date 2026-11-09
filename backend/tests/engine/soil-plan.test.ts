import { describe, expect, it } from "bun:test"
import { buildSoilPlan, type SoilPlanInput } from "../../src/services/engine"
import { toStraightFertilizers } from "../../src/services/engine/fertilizer"
import { calculateLimeNeed } from "../../src/services/engine/soil-plan"
import {
  FERTILIZER_RATES,
  FERTILIZER_STAGES,
  LIME_RATES,
  THRESHOLDS,
  UPLAND_LOAM_RAINFED,
  requirement,
} from "./fixtures"

function planInput(overrides: Partial<SoilPlanInput> = {}): SoilPlanInput {
  return {
    cropId: "crop",
    requirement: requirement(),
    site: UPLAND_LOAM_RAINFED,
    // pH in range, organic matter / P / K all "low"
    soil: { inputMode: "lab", ph: 6.5, organicMatterPct: 1.0, phosphorusMgKg: 5, potassiumMgKg: 30 },
    areaRai: 1,
    mode: "chemical",
    thresholds: THRESHOLDS,
    fertilizerRates: FERTILIZER_RATES,
    fertilizerStages: FERTILIZER_STAGES,
    limeRates: LIME_RATES,
    ...overrides,
  }
}

describe("toStraightFertilizers", () => {
  it("covers P₂O₅ with 18-46-0, tops up N with 46-0-0, K₂O with 0-0-60", () => {
    const mix = toStraightFertilizers({ n: 6, p2o5: 4.6, k2o: 3 }, 2)
    expect(mix.products).toEqual([
      { formula: "18-46-0", kgPerRai: 10, kgTotal: 20 },
      { formula: "46-0-0", kgPerRai: 9.1, kgTotal: 18.3 },
      { formula: "0-0-60", kgPerRai: 5, kgTotal: 10 },
    ])
    expect(mix.excessN).toBe(0)
  })

  it("reports excess N when 18-46-0 alone supplies more N than needed", () => {
    const mix = toStraightFertilizers({ n: 1, p2o5: 9.2, k2o: 0 }, 1)
    expect(mix.products).toEqual([{ formula: "18-46-0", kgPerRai: 20, kgTotal: 20 }])
    expect(mix.excessN).toBe(2.6)
  })
})

describe("calculateLimeNeed", () => {
  it("sums lime across pH bands for the plot texture", () => {
    // 4.5→5.0 at 300/unit + 5.0→6.5 at 200/unit
    const need = calculateLimeNeed(4.5, 6.5, "loam", LIME_RATES)
    expect(need.kgCaco3PerRai).toBeCloseTo(450)
    expect(need.fullyCovered).toBe(true)
  })

  it("reports when the bands do not cover the range", () => {
    expect(calculateLimeNeed(4.5, 6.5, "sandy", LIME_RATES).fullyCovered).toBe(false)
  })
})

describe("buildSoilPlan", () => {
  it("builds dated fertilizer steps per stage, plus organic matter and retest", () => {
    const plan = buildSoilPlan(planInput())

    expect(plan.nutrientTotalsPerRai).toEqual({ n: 12, p2o5: 9.2, k2o: 12 })
    expect(plan.steps.map((s) => [s.type, s.daysAfterPlanting])).toEqual([
      ["organic_matter", -14],
      ["fertilizer", 0],
      ["fertilizer", 30],
      ["retest", null],
    ])

    const [, basal, topDress] = plan.steps
    if (basal?.type !== "fertilizer" || topDress?.type !== "fertilizer") throw new Error("unexpected steps")
    expect(basal.nutrientsPerRai).toEqual({ n: 6, p2o5: 9.2, k2o: 6 })
    expect(basal.products.map((p) => [p.formula, p.kgPerRai])).toEqual([
      ["18-46-0", 20],
      ["46-0-0", 5.2],
      ["0-0-60", 10],
    ])
    expect(topDress.products.map((p) => [p.formula, p.kgPerRai])).toEqual([
      ["46-0-0", 13],
      ["0-0-60", 10],
    ])
  })

  it("scales totals by plot area", () => {
    const plan = buildSoilPlan(planInput({ areaRai: 5 }))
    const om = plan.steps.find((s) => s.type === "organic_matter")
    expect(om?.type === "organic_matter" && om.kgTotal).toBe(10_000)
  })

  it("adds lime before planting when pH is below range", () => {
    const plan = buildSoilPlan(
      planInput({
        areaRai: 2,
        soil: { inputMode: "lab", ph: 4.5, organicMatterPct: 2.0, phosphorusMgKg: 15, potassiumMgKg: 80 },
      })
    )
    const lime = plan.steps[0]
    expect(lime?.type).toBe("ph_correction")
    if (lime?.type !== "ph_correction") return
    expect(lime.material).toBe("dolomite")
    expect(lime.kgPerRai).toBe(412.8) // 450 kg CaCO₃ ÷ 1.09
    expect(lime.kgTotal).toBe(825.6)
    expect(lime.daysAfterPlanting).toBeLessThan(0)
    expect(plan.difficulty).toBe("moderate") // gap 1.0 is not more than HARD_PH_RAISE_GAP
  })

  it("gives guidance without a quantity when pH is above range", () => {
    const plan = buildSoilPlan(
      planInput({ soil: { inputMode: "lab", ph: 7.5, organicMatterPct: 2.0, phosphorusMgKg: 15, potassiumMgKg: 80 } })
    )
    const step = plan.steps.find((s) => s.type === "ph_correction")
    expect(step?.type === "ph_correction" && step.kgPerRai).toBeNull()
  })

  it("warns strongly when the crop is not feasible", () => {
    const plan = buildSoilPlan(
      planInput({
        requirement: requirement({ phMin: 6.5, phMax: 7.5, phOptimal: 7.0 }),
        soil: { inputMode: "lab", ph: 4.2, organicMatterPct: 2.0, phosphorusMgKg: 15, potassiumMgKg: 80 },
      })
    )
    expect(plan.difficulty).toBe("not_feasible")
    expect(plan.warnings.some((w) => w.startsWith("ไม่แนะนำ"))).toBe(true)
  })

  it("chemical mode skips organic matter when it already meets the crop minimum", () => {
    const plan = buildSoilPlan(
      planInput({ soil: { inputMode: "lab", ph: 6.5, organicMatterPct: 2.0, phosphorusMgKg: 15, potassiumMgKg: 80 } })
    )
    expect(plan.steps.some((s) => s.type === "organic_matter")).toBe(false)
  })

  it("combined mode still builds organic matter when it is not high", () => {
    const plan = buildSoilPlan(
      planInput({
        mode: "combined",
        soil: { inputMode: "lab", ph: 6.5, organicMatterPct: 2.0, phosphorusMgKg: 15, potassiumMgKg: 80 },
      })
    )
    const om = plan.steps.find((s) => s.type === "organic_matter")
    expect(om?.type === "organic_matter" && om.kgPerRai).toBe(1000)
  })

  it("organic mode lists nutrient targets without chemical products", () => {
    const plan = buildSoilPlan(planInput({ mode: "organic" }))
    const fertilizer = plan.steps.filter((s) => s.type === "fertilizer")
    expect(fertilizer.length).toBe(2)
    for (const step of fertilizer) {
      expect(step.type === "fertilizer" && step.products).toEqual([])
    }
  })

  it("carries site-check failures as warnings", () => {
    const plan = buildSoilPlan(planInput({ requirement: requirement({ allowedLandTypes: ["lowland"] }) }))
    expect(plan.warnings.length).toBeGreaterThan(0)
  })

  it("lists the sources it used", () => {
    const plan = buildSoilPlan(planInput())
    expect(plan.sources).toEqual(expect.arrayContaining(["test", "rate-test", "stage-test"]))
  })
})
