"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  History,
  ArrowRight,
  TestTube2,
  Calendar,
  Loader2,
  Trash2,
  CloudUpload,
  Sparkles,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { fetchUserHistory, deleteAnalysis, claimAnalysis } from "@/lib/api"

export default function HistoryPage() {
  const router = useRouter()
  const { data: session, isPending: sessionPending } = authClient.useSession()

  const [dbHistory, setDbHistory] = useState<any[]>([])
  const [localHistory, setLocalHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    loadAllHistory()
  }, [session])

  const loadAllHistory = async () => {
    setLoading(true)

    // 1. Load local cache
    try {
      if (typeof window !== "undefined") {
        const stored = JSON.parse(localStorage.getItem("plantable_local_history") || "[]")
        setLocalHistory(stored)
      }
    } catch (e) {
      console.error("Failed to load local history", e)
    }

    // 2. Load DB history if logged in
    if (session?.user) {
      try {
        const dbData = await fetchUserHistory()
        setDbHistory(dbData)
      } catch (e) {
        console.error("Failed to load DB history", e)
      }
    }

    setLoading(false)
  }

  const handleDelete = async (id: string, isLocal: boolean) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการวิเคราะห์นี้?")) return

    if (isLocal) {
      const updated = localHistory.filter((item) => item.id !== id)
      setLocalHistory(updated)
      localStorage.setItem("plantable_local_history", JSON.stringify(updated))
    } else {
      await deleteAnalysis(id)
      setDbHistory((prev) => prev.filter((item) => item.id !== id))
    }
  }

  const handleSyncLocalToDb = async () => {
    if (!session?.user || localHistory.length === 0) return
    setSyncing(true)
    try {
      for (const item of localHistory) {
        if (item.id && !item.id.startsWith("local-")) {
          await claimAnalysis(item.id)
        }
      }
      localStorage.removeItem("plantable_local_history")
      setLocalHistory([])
      await loadAllHistory()
    } catch (e) {
      console.error("Sync error:", e)
    } finally {
      setSyncing(false)
    }
  }

  const handleOpenResult = (item: any) => {
    if (item.fullResult) {
      sessionStorage.setItem("plantResult", JSON.stringify(item.fullResult))
      router.push("/results")
    } else {
      // Re-run test with the stored soil parameters
      router.push(`/analyze`)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 sm:py-14 animate-fade-in-up space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-1.5">
            <History className="h-3.5 w-3.5" />
            ประวัติการทดสอบ
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            ประวัติการวิเคราะห์ดิน
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {session?.user
              ? `บันทึกในบัญชีของ ${session.user.name || session.user.email}`
              : "ประวัติการวิเคราะห์ในอุปกรณ์นี้ (เข้าสู่ระบบเพื่อบันทึกถาวรบนคลาวด์)"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {session?.user && localHistory.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncLocalToDb}
              disabled={syncing}
              className="border-emerald-300 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 font-semibold text-xs"
            >
              <CloudUpload className="mr-1.5 h-3.5 w-3.5" />
              {syncing ? "กำลังซิงค์..." : `ซิงค์ ${localHistory.length} รายการเข้าบัญชี`}
            </Button>
          )}

          <Link href="/analyze">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs">
              <TestTube2 className="mr-1.5 h-4 w-4" />
              วิเคราะห์แปลงใหม่
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="text-xs font-medium">กำลังโหลดประวัติ...</p>
          </div>
        </div>
      ) : dbHistory.length === 0 && localHistory.length === 0 ? (
        <div className="text-center py-16 px-4 bg-card rounded-2xl border border-dashed border-border text-muted-foreground space-y-4 max-w-md mx-auto">
          <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center mx-auto text-primary">
            <Sparkles className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground">ยังไม่มีประวัติการวิเคราะห์</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              เมื่อคุณทำการตรวจวัดดิน ข้อมูลจะถูกบันทึกที่นี่โดยอัตโนมัติเพื่อให้คุณติดตามการเปลี่ยนแปลงของดินได้ตลอดเวลา
            </p>
          </div>
          <Link href="/analyze">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              เริ่มตรวจดินตอนนี้
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Authenticated DB History */}
          {dbHistory.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                ประวัติในบัญชีคลาวด์ ({dbHistory.length})
              </h3>
              <div className="space-y-3">
                {dbHistory.map((item) => {
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
                          <span className="text-base font-bold text-foreground">
                            พืชอันดับ 1: {topRec?.crop?.nameTh || "พืชแนะนำ"}
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

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleDelete(item.id, false)}
                          title="ลบรายการนี้"
                          className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Local Guest History */}
          {localHistory.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>ประวัติล่าสุดในเครื่องนี้ ({localHistory.length})</span>
                {!session?.user && (
                  <Link href="/login" className="text-primary normal-case font-semibold hover:underline">
                    เข้าสู่ระบบเพื่อบันทึกถาวร
                  </Link>
                )}
              </h3>
              <div className="space-y-3">
                {localHistory.map((item) => {
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
                          <span className="text-[10px] font-semibold bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                            ในเครื่อง
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-base font-bold text-foreground">
                            พืชอันดับ 1: {topRec?.crop?.nameTh || "พืชแนะนำ"}
                          </span>
                          {topRec && (
                            <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200/60">
                              {topRec.suitabilityScore} คะแนน ({topRec.recommendationLevel})
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground font-mono">
                          <span>N: {item.soil?.nitrogen} mg/kg</span>
                          <span>•</span>
                          <span>P: {item.soil?.phosphorus} mg/kg</span>
                          <span>•</span>
                          <span>K: {item.soil?.potassium} mg/kg</span>
                          <span>•</span>
                          <span>pH: {item.soil?.ph}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenResult(item)}
                          className="text-xs font-semibold hover:bg-emerald-50"
                        >
                          เปิดดูผลลัพธ์
                          <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                        </Button>

                        <button
                          onClick={() => handleDelete(item.id, true)}
                          title="ลบรายการนี้"
                          className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
