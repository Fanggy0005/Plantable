// Scoring parameters for the recommendation engine.
// These are product tuning values, not agronomic facts. See docs/rules.md.

export const MAX_SCORE = 100

export const TEXTURE_NOT_PREFERRED_PENALTY = 15

export const PH_STEP = 0.5
export const PH_BELOW_PENALTY_PER_STEP = 8
export const PH_BELOW_PENALTY_CAP = 40
export const PH_ABOVE_PENALTY_PER_STEP = 12
export const PH_ABOVE_PENALTY_CAP = 50

export const ORGANIC_MATTER_BELOW_MIN_PENALTY = 10
export const NUTRIENT_BELOW_MIN_PENALTY = 5

// Difficulty thresholds (pH units)
export const HARD_PH_RAISE_GAP = 1.0
export const NOT_FEASIBLE_PH_RAISE_GAP = 2.0
export const NOT_FEASIBLE_PH_LOWER_GAP = 1.0

// A crop whose soil cannot realistically be corrected is never above "Not Recommended"
export const NOT_FEASIBLE_MAX_SCORE = 39
