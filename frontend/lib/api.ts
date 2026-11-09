import type {
  Crop,
  CropCategory,
  CropGroup,
  CropDetail,
  RecommendationResult,
  SiteInput,
  SoilInput,
  SoilPlan,
  SoilPlanRequest,
  UserProfile,
  WeatherData,
} from "../types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

interface ApiEnvelope<T> {
  success: boolean
  message: string
  data?: T
  errors?: { path?: string; message?: string }[]
}

/** An error response from the API, with the server's message and validation details. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly errors: ApiEnvelope<unknown>["errors"] = []
  ) {
    super(message)
  }
}

/** Calls the API and unwraps the `{ success, message, data }` envelope. */
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: init.body ? { "Content-Type": "application/json", ...init.headers } : init.headers,
    credentials: "include",
  })
  const body = (await res.json().catch(() => null)) as ApiEnvelope<T> | null

  if (!res.ok || !body?.success) {
    const detail = body?.errors?.[0]?.message
    const message = body?.message ?? `Request failed (${res.status})`
    throw new ApiError(res.status, detail ? `${message}: ${detail}` : message, body?.errors)
  }
  return body.data as T
}

const post = <T>(path: string, data: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(data) })

// ------------------------------------------------------------------
// Recommendations and soil plans (public, stateless)
// ------------------------------------------------------------------

export function recommendCrops(site: SiteInput, soil: SoilInput): Promise<RecommendationResult> {
  return post("/api/recommendations", { site, soil })
}

export function buildSoilPlan(plan: SoilPlanRequest): Promise<SoilPlan> {
  return post("/api/soil-plans", plan)
}

// ------------------------------------------------------------------
// Crops (public)
// ------------------------------------------------------------------

export function fetchCrops(params?: { search?: string; group?: CropGroup; category?: CropCategory }): Promise<Crop[]> {
  const query = new URLSearchParams()
  if (params?.search) query.set("search", params.search)
  if (params?.group) query.set("group", params.group)
  if (params?.category) query.set("category", params.category)
  const qs = query.toString()
  return request(`/api/crops${qs ? `?${qs}` : ""}`)
}

export function fetchCropById(id: string): Promise<CropDetail> {
  return request(`/api/crops/${id}`)
}

// ------------------------------------------------------------------
// Users (auth)
// ------------------------------------------------------------------

export function fetchUserProfile(): Promise<UserProfile> {
  return request("/api/users/me")
}

export function updateUserProfile(data: { name: string }): Promise<UserProfile> {
  return request("/api/users/me", { method: "PATCH", body: JSON.stringify(data) })
}

// ------------------------------------------------------------------
// Environment (public)
// ------------------------------------------------------------------

export function fetchWeather(province?: string): Promise<WeatherData> {
  const query = province ? `?province=${encodeURIComponent(province)}` : ""
  return request(`/api/environment/weather${query}`)
}
