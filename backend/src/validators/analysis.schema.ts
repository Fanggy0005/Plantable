import { t } from "elysia"

export const SoilInputSchema = t.Object({
  nitrogen: t.Number({
    minimum: 0,
    error: "Nitrogen must be a positive number",
  }),
  phosphorus: t.Number({
    minimum: 0,
    error: "Phosphorus must be a positive number",
  }),
  potassium: t.Number({
    minimum: 0,
    error: "Potassium must be a positive number",
  }),
  ph: t.Number({
    minimum: 0,
    maximum: 14,
    error: "pH must be between 0 and 14",
  }),
  organicMatter: t.Optional(t.Nullable(t.Number({ minimum: 0 }))),
  moisture: t.Optional(t.Nullable(t.Number({ minimum: 0, maximum: 100 }))),
  notes: t.Optional(t.Nullable(t.String())),
  province: t.Optional(t.Nullable(t.String())),
  region: t.Optional(t.Nullable(t.String())),
  season: t.Optional(t.Nullable(t.String())),
})

export const CropQuerySchema = t.Object({
  search: t.Optional(t.String()),
  category: t.Optional(t.String()),
})

export const AnalysisIdParamSchema = t.Object({
  id: t.String({ format: "uuid", error: "Invalid analysis ID" }),
})

export const CropIdParamSchema = t.Object({
  id: t.String({ format: "uuid", error: "Invalid crop ID" }),
})
