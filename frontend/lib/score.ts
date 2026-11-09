import type { Difficulty, NutrientLevel, RecommendationLevel } from "@/types"

export type ScoreTone = "excellent" | "good" | "fair" | "poor" | "bad"

/** One source of truth for how a 0–100 suitability score is colored. */
export function scoreTone(score: number): ScoreTone {
  if (score >= 90) return "excellent"
  if (score >= 75) return "good"
  if (score >= 60) return "fair"
  if (score >= 40) return "poor"
  return "bad"
}

export function levelFromScore(score: number): RecommendationLevel {
  if (score >= 90) return "Excellent"
  if (score >= 75) return "Good"
  if (score >= 60) return "Fair"
  if (score >= 40) return "Poor"
  return "Not Recommended"
}

/** CSS color (token) for strokes/fills, e.g. SVG or recharts */
export const TONE_COLOR: Record<ScoreTone, string> = {
  excellent: "var(--success)",
  good: "var(--chart-2)",
  fair: "var(--warning)",
  poor: "var(--chart-5)",
  bad: "var(--destructive)",
}

/** Tailwind classes for a soft pill/badge in that tone */
export const TONE_BADGE: Record<ScoreTone, string> = {
  excellent: "bg-success-soft text-success border-success/20",
  good: "bg-success-soft text-primary border-primary/15",
  fair: "bg-warning-soft text-warning border-warning/25",
  poor: "bg-warning-soft text-chart-5 border-chart-5/25",
  bad: "bg-danger-soft text-destructive border-destructive/20",
}

/** Badge variant for how much soil work a crop needs. */
export const DIFFICULTY_VARIANT: Record<Difficulty, "success" | "warning" | "destructive" | "muted"> = {
  easy: "success",
  moderate: "warning",
  hard: "destructive",
  not_feasible: "muted",
}

/** Badge variant for a nutrient level. "High" means "enough", not "too much". */
export const LEVEL_VARIANT: Record<NutrientLevel, "warning" | "info" | "success"> = {
  low: "warning",
  medium: "info",
  high: "success",
}

const LEVEL_RANK: Record<NutrientLevel, number> = { low: 0, medium: 1, high: 2 }

export const meetsLevel = (actual: NutrientLevel, minimum: NutrientLevel) => LEVEL_RANK[actual] >= LEVEL_RANK[minimum]
