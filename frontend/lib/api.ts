const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export async function recommendPlants(soil: {
  nitrogen: number
  phosphorus: number
  potassium: number
  ph: number
}) {
  const res = await fetch(`${API_URL}/api/analysis/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(soil),
  })

  if (!res.ok) throw new Error("Failed to fetch recommendations")
  return res.json()
}
