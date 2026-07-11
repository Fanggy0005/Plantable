"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

interface Analysis {
  id: string
  nitrogen: number
  phosphorus: number
  potassium: number
  ph: number
  createdAt: string
  result: {
    plantId: string
    name: string
    nameTh: string
    score: number
  }[]
}

export default function HistoryPage() {
  const router = useRouter()
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/api/analysis/history`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          router.push("/login")
          return
        }
        setAnalyses(data)
      })
      .finally(() => setLoading(false))
  }, [router])

  if (loading) return <div className="p-6">กำลังโหลด...</div>

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ประวัติการวิเคราะห์</h1>
        <button
          onClick={() => router.push("/analyze")}
          className="text-sm underline text-muted-foreground"
        >
          วิเคราะห์ใหม่
        </button>
      </div>

      {analyses.length === 0 ? (
        <p className="text-muted-foreground">ยังไม่มีประวัติการวิเคราะห์</p>
      ) : (
        <div className="space-y-4">
          {analyses.map((analysis) => {
            const top = analysis.result?.[0]
            const date = new Date(analysis.createdAt).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })

            return (
              <div key={analysis.id} className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{date}</p>
                  {top && (
                    <span className="text-sm font-medium">
                      อันดับ 1: {top.nameTh} ({top.score} คะแนน)
                    </span>
                  )}
                </div>
                <div className="flex gap-4 text-sm">
                  <span>N: {analysis.nitrogen}</span>
                  <span>P: {analysis.phosphorus}</span>
                  <span>K: {analysis.potassium}</span>
                  <span>pH: {analysis.ph}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
