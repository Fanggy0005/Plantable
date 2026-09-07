"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { History, ArrowRight, TestTube2, Sprout, Calendar, Loader2, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

interface AnalysisItem {
  id: string
  nitrogen: number
  phosphorus: number
  potassium: number
  ph: number
  createdAt: string
  recommendations?: {
    crop: {
      name: string
      nameTh: string
    }
    suitabilityScore: number
    recommendationLevel: string
  }[]
  result?: {
    plantId: string
    name: string
    nameTh: string
    score: number
  }[]
}

export default function HistoryPage() {
  const router = useRouter()
  const [analyses, setAnalyses] = useState<AnalysisItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isUnauthorized, setIsUnauthorized] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/api/analyses/history`, {
      credentials: "include",
    })
      .then((res) => {
        if (res.status === 401) {
          setIsUnauthorized(true)
          return null
        }
        return res.json()
      })
      .then((res) => {
        if (!res) return
        if (res.success && Array.isArray(res.data)) {
          setAnalyses(res.data)
        } else if (Array.isArray(res)) {
          setAnalyses(res)
        }
      })
      .catch((err) => console.error("History fetch error:", err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 sm:py-14 animate-fade-in-up space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-1.5">
            <History className="h-3.5 w-3.5" />
            ประวัติการทดสอบ
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            ประวัติการวิเคราะห์ดินย้อนหลัง
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            ดูบันทึกผลการทดสอบดินในอดีตและพืชที่เหมาะสมที่เคยได้รับการแนะนำ
          </p>
        </div>

        <Link href="/analyze">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs">
            <TestTube2 className="mr-1.5 h-4 w-4" />
            วิเคราะห์แปลงใหม่
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="text-xs font-medium">กำลังโหลดประวัติ...</p>
          </div>
        </div>
      ) : isUnauthorized ? (
        <div className="text-center py-16 px-4 bg-card rounded-2xl border border-border/80 shadow-xs space-y-4 max-w-md mx-auto">
          <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center mx-auto text-primary">
            <LogIn className="h-6 w-6 text-emerald-600" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground">เข้าสู่ระบบเพื่อดูประวัติ</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              ฟีเจอร์การบันทึกประวัติอัตโนมัติจะทำงานเมื่อคุณเข้าสู่ระบบ คุณสามารถทดลองวิเคราะห์ดินได้ฟรีโดยไม่ต้องเข้าสู่ระบบ
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Link href="/login">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs">
                เข้าสู่ระบบ
              </Button>
            </Link>
            <Link href="/analyze">
              <Button variant="outline" className="text-xs">
                ทดลองตรวจดินทันที
              </Button>
            </Link>
          </div>
        </div>
      ) : analyses.length === 0 ? (
        <div className="text-center py-16 px-4 bg-card rounded-2xl border border-dashed border-border text-muted-foreground space-y-3">
          <Sprout className="h-10 w-10 mx-auto text-muted-foreground/40" />
          <div>
            <p className="font-semibold text-sm text-foreground">ยังไม่มีประวัติการวิเคราะห์</p>
            <p className="text-xs mt-1">เริ่มการวิเคราะห์ดินครั้งแรกเพื่อดูผลและคำแนะนำพืช</p>
          </div>
          <Link href="/analyze">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              เริ่มตรวจดินครั้งแรก
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {analyses.map((item) => {
            const topRec = item.recommendations?.[0]
            const date = new Date(item.createdAt).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })

            return (
              <div
                key={item.id}
                className="rounded-2xl border bg-card p-5 shadow-xs hover-lift flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{date}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-foreground">
                      อันดับ 1: {topRec?.crop?.nameTh || "พืชแนะนำ"}
                    </span>
                    {topRec && (
                      <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200/60">
                        {topRec.suitabilityScore} คะแนน ({topRec.recommendationLevel})
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground font-mono">
                    <span>N: {item.nitrogen} mg/kg</span>
                    <span>•</span>
                    <span>P: {item.phosphorus} mg/kg</span>
                    <span>•</span>
                    <span>K: {item.potassium} mg/kg</span>
                    <span>•</span>
                    <span>pH: {item.ph}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Navigate to analyze with these parameters
                    router.push("/analyze")
                  }}
                  className="shrink-0 text-xs font-semibold text-foreground hover:bg-emerald-50"
                >
                  ตรวจซ้ำด้วยค่านี้
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
