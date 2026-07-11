"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface PlantResult {
  plantId: string
  name: string
  nameTh: string
  description: string
  score: number
  reasons: string[]
  improvements: string[]
}

interface Result {
  soil: {
    nitrogen: number
    phosphorus: number
    potassium: number
    ph: number
  }
  rankings: PlantResult[]
}

export default function ResultsPage() {
  const router = useRouter()
  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    const data = sessionStorage.getItem("plantResult")
    if (!data) {
      router.push("/analyze")
      return
    }
    setResult(JSON.parse(data))
  }, [router])

  if (!result) return null

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">ผลการวิเคราะห์</h1>
        <p className="text-sm text-muted-foreground">
          N: {result.soil.nitrogen} | P: {result.soil.phosphorus} | K: {result.soil.potassium} | pH: {result.soil.ph}
        </p>
      </div>

      <div className="space-y-4">
        {result.rankings.map((plant, index) => (
          <div key={plant.plantId} className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                <div>
                  <p className="font-semibold">{plant.nameTh}</p>
                  <p className="text-sm text-muted-foreground">{plant.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{plant.score}</p>
                <p className="text-xs text-muted-foreground">คะแนน</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">{plant.description}</p>

            <div>
              <p className="text-sm font-medium">เหตุผล:</p>
              <ul className="text-sm text-muted-foreground list-disc list-inside">
                {plant.reasons.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>

            {plant.improvements.length > 0 && (
              <div>
                <p className="text-sm font-medium">แนะนำปรับปรุง:</p>
                <ul className="text-sm text-muted-foreground list-disc list-inside">
                  {plant.improvements.map((imp, i) => <li key={i}>{imp}</li>)}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => router.push("/analyze")}
        className="text-sm underline text-muted-foreground"
      >
        วิเคราะห์ใหม่
      </button>
    </div>
  )
}
