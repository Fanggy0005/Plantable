import { t } from "elysia"
import { PlanModeSchema, SiteInputSchema, SoilInputSchema } from "./soil-input.schema"

const strict = { additionalProperties: false } as const

export const IdParamSchema = t.Object({ id: t.String({ format: "uuid", error: "Invalid id" }) })

export const CropQuerySchema = t.Object({
  search: t.Optional(t.String({ maxLength: 100 })),
  category: t.Optional(t.String({ maxLength: 50 })),
})

export const RecommendationRequestSchema = t.Object(
  { site: SiteInputSchema, soil: SoilInputSchema },
  strict
)

export const SoilPlanRequestSchema = t.Object(
  {
    cropId: t.String({ format: "uuid", error: "Invalid crop id" }),
    areaRai: t.Number({ exclusiveMinimum: 0, maximum: 100_000, error: "Area must be more than 0 rai" }),
    mode: PlanModeSchema,
    site: SiteInputSchema,
    soil: SoilInputSchema,
  },
  strict
)

const plotFields = {
  name: t.String({ minLength: 1, maxLength: 100, error: "Plot name is required (max 100 characters)" }),
  areaRai: t.Number({ exclusiveMinimum: 0, maximum: 100_000, error: "Area must be more than 0 rai" }),
  province: t.String({ minLength: 1, maxLength: 100 }),
  landType: SiteInputSchema.properties.landType,
  waterSupply: SiteInputSchema.properties.waterSupply,
  soilTexture: SiteInputSchema.properties.soilTexture,
  targetCropId: t.Union([t.String({ format: "uuid", error: "Invalid crop id" }), t.Null()]),
}

export const CreatePlotSchema = t.Object(
  { ...plotFields, targetCropId: t.Optional(plotFields.targetCropId) },
  strict
)

export const UpdatePlotSchema = t.Partial(t.Object(plotFields, strict))

export const CreateAnalysisSchema = t.Object(
  {
    soil: SoilInputSchema,
    sampledAt: t.String({ format: "date", error: "sampledAt must be a date (YYYY-MM-DD)" }),
    notes: t.Optional(t.String({ maxLength: 1000 })),
  },
  strict
)

export const AnalysisListQuerySchema = t.Object({
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
})

export const SoilPlanQuerySchema = t.Object({
  cropId: t.Optional(t.String({ format: "uuid", error: "Invalid crop id" })),
  mode: t.Optional(PlanModeSchema),
})

export const UpdateProfileSchema = t.Object(
  { name: t.String({ minLength: 1, maxLength: 100 }) },
  strict
)
