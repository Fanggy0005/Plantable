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

  return res.json()
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
  const res = await fetch(`${API_URL}/api/analyses/${id}`)
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
