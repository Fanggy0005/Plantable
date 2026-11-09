// Weather alert thresholds. Alerts are calculated by Plantable from the forecast;
// they are not official warnings.

/**
 * 24-hour rainfall classes of the Thai Meteorological Department (กรมอุตุนิยมวิทยา):
 * ฝนหนัก 35.1–90.0 mm, ฝนหนักมาก ≥ 90.1 mm. Verify against TMD's published criteria.
 */
export const HEAVY_RAIN_MM_PER_DAY = 35.1
export const VERY_HEAVY_RAIN_MM_PER_DAY = 90.1

/** TMD: อากาศร้อนจัด, maximum temperature ≥ 40.0 °C. Verify against TMD's published criteria. */
export const EXTREME_HEAT_MAX_C = 40

/**
 * Tuning parameter, not a TMD criterion: in the hot season, a forecast window whose
 * total rain is below this is treated as a dry spell.
 */
export const DRY_SPELL_MAX_TOTAL_MM = 1

export const FORECAST_DAYS = 5
export const WEATHER_TIMEOUT_MS = 4000
