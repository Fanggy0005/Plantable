// Scoring parameters for the recommendation engine.
// These are product tuning values, not agronomic facts. See docs/rules.md.

export const MAX_SCORE = 100

// Texture is ordinal (clay ↔ loam ↔ sandy). Penalty per step away from the nearest preferred texture.
export const TEXTURE_PENALTY_PER_STEP = 10

export const PH_STEP = 0.5
export const PH_BELOW_PENALTY_PER_STEP = 8
export const PH_BELOW_PENALTY_CAP = 40
export const PH_ABOVE_PENALTY_PER_STEP = 12
export const PH_ABOVE_PENALTY_CAP = 50

// Distance from the crop's optimal pH, measured inside its range (rounded to whole points).
// Separates crops that are all "in range" and keeps the score continuous at the range edge.
export const PH_OFF_OPTIMAL_PENALTY_PER_UNIT = 5
export const PH_OFF_OPTIMAL_PENALTY_CAP = 5

// Per level below the crop minimum (low → medium = 1 level, low → high = 2 levels)
export const ORGANIC_MATTER_PENALTY_PER_LEVEL = 10
export const NUTRIENT_PENALTY_PER_LEVEL = 5

// Difficulty thresholds (pH units)
export const HARD_PH_RAISE_GAP = 1.0
export const NOT_FEASIBLE_PH_RAISE_GAP = 2.0
export const NOT_FEASIBLE_PH_LOWER_GAP = 1.0

// A crop whose soil cannot realistically be corrected is never above "Not Recommended"
export const NOT_FEASIBLE_MAX_SCORE = 39
