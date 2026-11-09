import { recommendCrops } from "./api"
import type { LocalHistoryEntry, SoilCheck, SoilCheckInput } from "../types"

/** The check shown on /results. Written right before navigating there. */
export const CURRENT_CHECK_KEY = "plantable_current_check"
/** Guest history. Versioned because v1 entries (N/P/K mg/kg) cannot be recalculated. */
const LOCAL_HISTORY_KEY = "plantable_checks_v2"
const LOCAL_HISTORY_LIMIT = 20

export function readCurrentCheck(raw: string | null): SoilCheck | null {
  if (!raw) return null
  try {
    const check = JSON.parse(raw) as SoilCheck
    return check?.soil?.inputMode && check.result?.ranked ? check : null
  } catch {
    return null
  }
}

export function readLocalHistory(): LocalHistoryEntry[] {
  try {
    const entries = JSON.parse(localStorage.getItem(LOCAL_HISTORY_KEY) || "[]") as LocalHistoryEntry[]
    return Array.isArray(entries) ? entries.filter((e) => e?.site && e?.soil?.inputMode) : []
  } catch {
    return []
  }
}

export function writeLocalHistory(entries: LocalHistoryEntry[]) {
  try {
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(entries.slice(0, LOCAL_HISTORY_LIMIT)))
  } catch (e) {
    console.error("Local history write error:", e)
  }
}

/**
 * Runs a quick check, stores it for /results and adds it to the local history.
 * Pass `id` when reopening a history entry so it is not duplicated.
 */
export async function runSoilCheck(input: SoilCheckInput, id?: string): Promise<SoilCheck> {
  const result = await recommendCrops(input.site, input.soil)
  const check: SoilCheck = {
    ...input,
    id: id ?? `local-${Date.now()}`,
    createdAt: new Date().toISOString(),
    result,
  }

  sessionStorage.setItem(CURRENT_CHECK_KEY, JSON.stringify(check))

  if (!id) {
    const entry: LocalHistoryEntry = {
      id: check.id,
      createdAt: check.createdAt,
      site: input.site,
      soil: input.soil,
      province: input.province,
      notes: input.notes,
      topCrops: result.ranked
        .slice(0, 3)
        .map(({ cropId, cropName, cropNameTh, category, score, level }) => ({
          cropId,
          cropName,
          cropNameTh,
          category,
          score,
          level,
        })),
    }
    writeLocalHistory([entry, ...readLocalHistory()])
  }

  return check
}
