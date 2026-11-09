import { t } from "elysia"

const strict = { additionalProperties: false } as const

export const NutrientLevelSchema = t.Union([t.Literal("low"), t.Literal("medium"), t.Literal("high")], {
  error: "Level must be low, medium or high",
})

export const SiteInputSchema = t.Object(
  {
    landType: t.Union([t.Literal("lowland"), t.Literal("upland")]),
    waterSupply: t.Union([t.Literal("rainfed"), t.Literal("seasonal_irrigation"), t.Literal("year_round")]),
    soilTexture: t.Union([t.Literal("clay"), t.Literal("loam"), t.Literal("sandy")]),
  },
  strict
)

const PhSchema = t.Number({ minimum: 3, maximum: 10, error: "pH must be between 3 and 10" })

export const LabSoilInputSchema = t.Object(
  {
    inputMode: t.Literal("lab"),
    ph: PhSchema,
    organicMatterPct: t.Number({ minimum: 0, maximum: 100, error: "Organic matter must be 0–100 %" }),
    phosphorusMgKg: t.Number({ minimum: 0, error: "Phosphorus must be 0 or more mg/kg" }),
    potassiumMgKg: t.Number({ minimum: 0, error: "Potassium must be 0 or more mg/kg" }),
  },
  strict
)

export const TestKitSoilInputSchema = t.Object(
  {
    inputMode: t.Literal("test_kit"),
    ph: PhSchema,
    nitrogenLevel: NutrientLevelSchema,
    phosphorusLevel: NutrientLevelSchema,
    potassiumLevel: NutrientLevelSchema,
  },
  strict
)

export const SoilInputSchema = t.Union([LabSoilInputSchema, TestKitSoilInputSchema])

export const PlanModeSchema = t.Union([t.Literal("chemical"), t.Literal("organic"), t.Literal("combined")])
