import type { SoilInput, AnalysisResult, Crop } from "../types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export async function recommendPlants(soil: SoilInput): Promise<AnalysisResult> {
  const res = await fetch(`${API_URL}/api/analysis/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(soil),
    credentials: "include",
  })

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}))
    throw new Error(errorBody.message || "Failed to fetch recommendations")
  }

  const data = await res.json()

  // Also auto-save to browser local history so guest tests are never lost!
  try {
    if (typeof window !== "undefined") {
      const stored = JSON.parse(localStorage.getItem("plantable_local_history") || "[]")
      const newEntry = {
        id: data.analysisId || `local-${Date.now()}`,
        createdAt: new Date().toISOString(),
        soil: data.soil,
        recommendations: data.rankings?.slice(0, 3)?.map((r: any) => ({
          crop: { name: r.name, nameTh: r.nameTh },
          suitabilityScore: r.score,
          recommendationLevel: r.level || "Good",
        })),
        fullResult: data,
      }
      localStorage.setItem("plantable_local_history", JSON.stringify([newEntry, ...stored].slice(0, 20)))
    }
  } catch (e) {
    console.error("Local history cache error:", e)
  }

  return data
}

export async function fetchCrops(params?: { search?: string; category?: string }): Promise<Crop[]> {
  const query = new URLSearchParams()
  if (params?.search) query.set("search", params.search)
  if (params?.category && params.category !== "All") query.set("category", params.category)

  const url = `${API_URL}/api/crops${query.toString() ? `?${query.toString()}` : ""}`
  const res = await fetch(url)

  if (!res.ok) {
    throw new Error("Failed to fetch crops")
  }

  const json = await res.json()
  return json.data || []
}

export async function fetchCropById(id: string): Promise<Crop> {
  const res = await fetch(`${API_URL}/api/crops/${id}`)
  if (!res.ok) {
    throw new Error("Failed to fetch crop detail")
  }

  const json = await res.json()
  return json.data
}

export async function fetchAnalysisById(id: string): Promise<AnalysisResult> {
  const res = await fetch(`${API_URL}/api/analyses/${id}`, {
    credentials: "include",
  })
  if (!res.ok) {
    throw new Error("Failed to fetch analysis detail")
  }

  const json = await res.json()
  const data = json.data
  return {
    analysisId: data.analysisId,
    createdAt: data.createdAt,
    soil: data.soil,
    rankings: data.recommendations.map((r: any) => ({
      plantId: r.cropId,
      name: r.cropName,
      nameTh: r.cropNameTh,
      scientificName: r.scientificName,
      category: r.category,
      description: r.description,
      imageUrl: r.imageUrl,
      score: r.score,
      level: r.level,
      breakdown: r.breakdown,
      reasons: r.reasons,
      improvements: r.improvementSuggestions,
      cropRequirement: r.cropRequirement,
    })),
  }
}

export async function fetchUserHistory(): Promise<any[]> {
  const res = await fetch(`${API_URL}/api/analyses/history`, {
    credentials: "include",
  })
  if (!res.ok) {
    return []
  }
  const json = await res.json()
  return json.data || []
}

export async function deleteAnalysis(id: string): Promise<boolean> {
  const res = await fetch(`${API_URL}/api/analyses/${id}`, {
    method: "DELETE",
    credentials: "include",
  })
  return res.ok
}

export async function claimAnalysis(id: string): Promise<boolean> {
  const res = await fetch(`${API_URL}/api/analyses/${id}/claim`, {
    method: "POST",
    credentials: "include",
  })
  return res.ok
}

export async function fetchUserProfile(): Promise<any> {
  const res = await fetch(`${API_URL}/api/users/me`, {
    credentials: "include",
  })
  if (!res.ok) {
    throw new Error("Failed to fetch profile")
  }
  const json = await res.json()
  return json.data
}

export async function updateUserProfile(data: { name?: string; image?: string }): Promise<any> {
  const res = await fetch(`${API_URL}/api/users/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  })
  if (!res.ok) {
    throw new Error("Failed to update profile")
  }
  const json = await res.json()
  return json.data
}

export async function fetchFavorites(): Promise<Crop[]> {
  const res = await fetch(`${API_URL}/api/favorites`, {
    credentials: "include",
  })
  if (!res.ok) return []
  const json = await res.json()
  return json.data || []
}

export async function addFavorite(cropId: string): Promise<boolean> {
  const res = await fetch(`${API_URL}/api/favorites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cropId }),
    credentials: "include",
  })
  return res.ok
}

export async function removeFavorite(cropId: string): Promise<boolean> {
  const res = await fetch(`${API_URL}/api/favorites/${cropId}`, {
    method: "DELETE",
    credentials: "include",
  })
  return res.ok
}
