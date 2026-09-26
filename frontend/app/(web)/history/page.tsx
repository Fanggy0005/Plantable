"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import { toast } from "sonner"
import {
  ArrowRight,
  Calendar,
  Cloud,
  CloudUpload,
  HardDrive,
  History,
  Loader2,
  LogIn,
  Sparkles,
  TestTube2,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/States"
import { CropIcon } from "@/components/shared/CropIcon"
import { EASE_OUT } from "@/components/motion"
import { authClient } from "@/lib/auth-client"
import { fetchUserHistory, deleteAnalysis, claimAnalysis, fetchAnalysisById } from "@/lib/api"
import { useFormat, useT } from "@/lib/i18n"
import { commonMessages } from "@/lib/i18n/messages/common"
import { historyMessages } from "@/features/history/messages"
import { scoreTone, TONE_BADGE } from "@/lib/score"
import { cn } from "@/lib/utils"
import type { AnalysisHistoryItem, AnalysisResult, LocalHistoryEntry } from "@/types"

const LOCAL_KEY = "plantable_local_history"

/** Cloud and local records have different shapes; normalize for display. */
interface HistoryRow {
  id: string
  createdAt: string
  isLocal: boolean
  soil: { nitrogen?: number; phosphorus?: number; potassium?: number; ph?: number }
  topCrops: Array<{ name?: string; nameTh?: string; category?: string; score?: number; level?: string }>
  fullResult?: AnalysisResult
}

function toRow(item: AnalysisHistoryItem | LocalHistoryEntry, isLocal: boolean): HistoryRow {
  // Local entries nest soil values under `soil`; cloud entries carry them at the top level
  const soil = "soil" in item ? item.soil : item
  return {
    id: item.id,
    createdAt: item.createdAt,
    isLocal,
    soil: {
      nitrogen: soil?.nitrogen,
      phosphorus: soil?.phosphorus,
      potassium: soil?.potassium,
      ph: soil?.ph,
    },
    topCrops: (item.recommendations ?? []).slice(0, 3).map((r) => ({
      name: r.crop?.name,
      nameTh: r.crop?.nameTh,
      category: r.crop?.category,
      score: r.suitabilityScore,
      level: r.recommendationLevel,
    })),
    fullResult: "fullResult" in item ? item.fullResult : undefined,
  }
}

function readLocalHistory(): LocalHistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]")
  } catch (e) {
    console.error("Failed to load local history", e)
    return []
  }
}

async function loadHistory(isSignedIn: boolean) {
  const cloud: AnalysisHistoryItem[] = isSignedIn
    ? await fetchUserHistory().catch((e) => {
        console.error("Failed to load DB history", e)
        return []
      })
    : []
  return { local: readLocalHistory(), cloud }
}

type PendingDelete = { kind: "one"; row: HistoryRow } | { kind: "clearLocal" } | null

export default function HistoryPage() {
  const router = useRouter()
  const t = useT(historyMessages)
  const common = useT(commonMessages)
  const { data: session } = authClient.useSession()

  const [dbHistory, setDbHistory] = useState<AnalysisHistoryItem[]>([])
  const [localHistory, setLocalHistory] = useState<LocalHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [openingId, setOpeningId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null)
  const [deleting, setDeleting] = useState(false)

  const isSignedIn = Boolean(session?.user)

  useEffect(() => {
    let cancelled = false
    loadHistory(isSignedIn).then(({ local, cloud }) => {
      if (cancelled) return
      setLocalHistory(local)
      setDbHistory(cloud)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [isSignedIn])

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      if (pendingDelete.kind === "clearLocal") {
        localStorage.removeItem(LOCAL_KEY)
        setLocalHistory([])
        toast.success(t.cleared)
      } else if (pendingDelete.row.isLocal) {
        const updated = localHistory.filter((item) => item.id !== pendingDelete.row.id)
        setLocalHistory(updated)
        localStorage.setItem(LOCAL_KEY, JSON.stringify(updated))
        toast.success(t.deleted)
      } else {
        const ok = await deleteAnalysis(pendingDelete.row.id)
        if (!ok) throw new Error("delete failed")
        setDbHistory((prev) => prev.filter((item) => item.id !== pendingDelete.row.id))
        toast.success(t.deleted)
      }
      setPendingDelete(null)
    } catch (e) {
      console.error("Delete error:", e)
      toast.error(t.deleteFailed)
    } finally {
      setDeleting(false)
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
      localStorage.removeItem(LOCAL_KEY)
      const { local, cloud } = await loadHistory(true)
      setLocalHistory(local)
      setDbHistory(cloud)
      toast.success(t.syncDone)
    } catch (e) {
      console.error("Sync error:", e)
      toast.error(t.syncFailed)
    } finally {
      setSyncing(false)
    }
  }

  const handleOpenResult = async (row: HistoryRow) => {
    if (row.fullResult) {
      sessionStorage.setItem("plantResult", JSON.stringify(row.fullResult))
      router.push("/results")
      return
    }
    if (!row.isLocal) {
      setOpeningId(row.id)
      try {
        const full = await fetchAnalysisById(row.id)
        sessionStorage.setItem("plantResult", JSON.stringify(full))
        router.push("/results")
      } catch (e) {
        console.error("Open analysis error:", e)
        toast.error(t.openFailed)
        setOpeningId(null)
      }
      return
    }
    // No stored result — re-run a test
    router.push("/analyze")
  }

  const cloudRows = dbHistory.map((item) => toRow(item, false))
  const localRows = localHistory.map((item) => toRow(item, true))
  const total = cloudRows.length + localRows.length

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
      <PageHeader
        eyebrow={t.eyebrow}
        icon={History}
        title={t.title}
        description={
          <>
            {t.description}
            {!loading && total > 0 && (
              <span className="mt-2 block text-sm font-semibold text-foreground">{t.count(total)}</span>
            )}
          </>
        }
        actions={
          <>
            {session?.user && localHistory.length > 0 && (
              <Button variant="outline" onClick={handleSyncLocalToDb} disabled={syncing} className="h-10">
                {syncing ? <Loader2 className="animate-spin" /> : <CloudUpload />}
                {syncing ? t.syncing : t.sync(localHistory.length)}
              </Button>
            )}
            <Button className="h-10" render={<Link href="/analyze" />} nativeButton={false}>
              <TestTube2 />
              {t.newAnalysis}
            </Button>
          </>
        }
      />

      {loading ? (
        <HistorySkeleton />
      ) : total === 0 ? (
        <EmptyState
          icon={Sparkles}
          title={t.emptyTitle}
          description={t.emptyDescription}
          action={
            <Button size="lg" render={<Link href="/analyze" />} nativeButton={false}>
              {t.emptyAction}
              <ArrowRight />
            </Button>
          }
        />
      ) : (
        <div className="space-y-10">
          {cloudRows.length > 0 && (
            <HistorySection
              icon={Cloud}
              title={t.cloudSection}
              count={cloudRows.length}
              rows={cloudRows}
              openingId={openingId}
              onOpen={handleOpenResult}
              onDelete={(row) => setPendingDelete({ kind: "one", row })}
            />
          )}

          {localRows.length > 0 && (
            <HistorySection
              icon={HardDrive}
              title={t.localSection}
              count={localRows.length}
              hint={t.localHint}
              actions={
                <>
                  {!session?.user && (
                    <Button variant="ghost" size="sm" className="h-9 text-primary" render={<Link href="/login" />} nativeButton={false}>
                      <LogIn />
                      {t.loginToSave}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 text-muted-foreground hover:text-destructive"
                    onClick={() => setPendingDelete({ kind: "clearLocal" })}
                  >
                    <Trash2 />
                    {t.clearLocal}
                  </Button>
                </>
              }
              rows={localRows}
              openingId={openingId}
              onOpen={handleOpenResult}
              onDelete={(row) => setPendingDelete({ kind: "one", row })}
            />
          )}
        </div>
      )}

      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && !deleting && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-danger-soft text-destructive">
              <Trash2 />
            </AlertDialogMedia>
            <AlertDialogTitle>
              {pendingDelete?.kind === "clearLocal" ? t.clearTitle : t.deleteTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete?.kind === "clearLocal" ? t.clearDescription(localHistory.length) : t.deleteDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{common.actions.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-destructive text-primary-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="animate-spin" />}
              {pendingDelete?.kind === "clearLocal" ? t.clearLocal : common.actions.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function HistorySection({
  icon: Icon,
  title,
  count,
  hint,
  actions,
  rows,
  openingId,
  onOpen,
  onDelete,
}: {
  icon: typeof Cloud
  title: string
  count: number
  hint?: string
  actions?: React.ReactNode
  rows: HistoryRow[]
  openingId: string | null
  onOpen: (row: HistoryRow) => void
  onDelete: (row: HistoryRow) => void
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">{title}</h2>
          <Badge variant="muted">{count}</Badge>
          {hint && <span className="hidden text-xs text-muted-foreground md:inline">· {hint}</span>}
        </div>
        {actions && <div className="-ml-2 flex flex-wrap items-center gap-1 sm:ml-0">{actions}</div>}
      </div>
      <ul className="space-y-3">
        <AnimatePresence initial={false}>
          {rows.map((row, i) => (
            <motion.li
              key={row.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT, delay: Math.min(i, 8) * 0.04 } }}
              exit={{ opacity: 0, x: -24, transition: { duration: 0.25 } }}
            >
              <HistoryCard row={row} opening={openingId === row.id} onOpen={onOpen} onDelete={onDelete} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </section>
  )
}

function HistoryCard({
  row,
  opening,
  onOpen,
  onDelete,
}: {
  row: HistoryRow
  opening: boolean
  onOpen: (row: HistoryRow) => void
  onDelete: (row: HistoryRow) => void
}) {
  const t = useT(historyMessages)
  const common = useT(commonMessages)
  const f = useFormat()

  const soilChips = [
    { k: "N", v: row.soil.nitrogen },
    { k: "P", v: row.soil.phosphorus },
    { k: "K", v: row.soil.potassium },
    { k: "pH", v: row.soil.ph },
  ]

  return (
    <div className="surface-interactive p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        {/* Date + soil values */}
        <div className="min-w-0 space-y-2.5 lg:w-64 lg:shrink-0">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Calendar className="size-4 text-muted-foreground" />
            <span className="font-semibold text-foreground">{row.createdAt ? f.date(row.createdAt) : "—"}</span>
            {row.isLocal ? (
              <Badge variant="muted">
                <HardDrive />
                {t.localBadge}
              </Badge>
            ) : (
              <Badge variant="info">
                <Cloud />
                {t.cloudBadge}
              </Badge>
            )}
          </div>
          {row.createdAt && (
            <p className="text-xs text-muted-foreground">{f.relative(row.createdAt)}</p>
          )}
          <div className="flex flex-wrap gap-1.5">
            {soilChips.map((c) => (
              <span
                key={c.k}
                className="inline-flex items-baseline gap-1 rounded-md bg-muted px-2 py-1 text-xs"
                title={c.k === "pH" ? common.nutrients.ph : common.units.mgPerKg}
              >
                <span className="font-semibold text-muted-foreground">{c.k}</span>
                <span className="font-bold tabular-nums text-foreground">{c.v ?? "—"}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Top crops */}
        <div className="min-w-0 flex-1 border-t border-border pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-5">
          <p className="mb-2 text-xs font-semibold text-muted-foreground">{t.topCrops}</p>
          {row.topCrops.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.noCrops}</p>
          ) : (
            <ol className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {row.topCrops.map((c, idx) => {
                const score = Math.round(c.score ?? 0)
                return (
                  <li key={idx} className="flex min-w-0 items-center gap-2.5 rounded-xl bg-muted/60 p-2">
                    <CropIcon name={c.name} category={c.category} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        <span className="mr-1 text-muted-foreground">{idx + 1}.</span>
                        {f.pick(c.nameTh, c.name) || "—"}
                      </p>
                      <span
                        className={cn(
                          "mt-0.5 inline-flex rounded-full border px-1.5 py-px text-[11px] font-semibold tabular-nums",
                          TONE_BADGE[scoreTone(score)]
                        )}
                        title={c.level ? common.levels[c.level] ?? c.level : undefined}
                      >
                        {t.score(score)}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 lg:flex-col lg:items-stretch">
          <Button variant="outline" className="h-10 flex-1 lg:flex-none" onClick={() => onOpen(row)} disabled={opening}>
            {opening ? <Loader2 className="animate-spin" /> : null}
            {opening ? t.opening : t.open}
            {!opening && <ArrowRight />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-10 text-muted-foreground hover:bg-danger-soft hover:text-destructive lg:w-full"
            onClick={() => onDelete(row)}
            aria-label={t.delete}
            title={t.delete}
          >
            <Trash2 />
          </Button>
        </div>
      </div>
    </div>
  )
}

function HistorySkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-5 w-40 rounded-md" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="surface flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
          <div className="space-y-2.5 lg:w-64">
            <Skeleton className="h-5 w-40 rounded-md" />
            <Skeleton className="h-3 w-20 rounded-md" />
            <div className="flex gap-1.5">
              {Array.from({ length: 4 }).map((__, j) => (
                <Skeleton key={j} className="h-6 w-12 rounded-md" />
              ))}
            </div>
          </div>
          <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((__, j) => (
              <Skeleton key={j} className="h-14 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-10 w-full rounded-full lg:w-32" />
        </div>
      ))}
    </div>
  )
}
