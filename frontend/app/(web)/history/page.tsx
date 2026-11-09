"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import { toast } from "sonner"
import { ArrowRight, Calendar, HardDrive, History, Loader2, Sparkles, TestTube2, Trash2 } from "lucide-react"
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
import { useFormat, useT } from "@/lib/i18n"
import { commonMessages } from "@/lib/i18n/messages/common"
import { historyMessages } from "@/features/history/messages"
import { readLocalHistory, runSoilCheck, writeLocalHistory } from "@/lib/soil-check"
import { scoreTone, TONE_BADGE } from "@/lib/score"
import { cn } from "@/lib/utils"
import type { LocalHistoryEntry } from "@/types"

type PendingDelete = { kind: "one"; entry: LocalHistoryEntry } | { kind: "clear" } | null

export default function HistoryPage() {
  const router = useRouter()
  const t = useT(historyMessages)
  const common = useT(commonMessages)

  const [history, setHistory] = useState<LocalHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [openingId, setOpeningId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null)

  useEffect(() => {
    // localStorage is only available after mount
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHistory(readLocalHistory())
    setLoading(false)
  }, [])

  const confirmDelete = () => {
    if (!pendingDelete) return
    const updated = pendingDelete.kind === "clear" ? [] : history.filter((e) => e.id !== pendingDelete.entry.id)
    writeLocalHistory(updated)
    setHistory(updated)
    toast.success(pendingDelete.kind === "clear" ? t.cleared : t.deleted)
    setPendingDelete(null)
  }

  // Results are not stored: reopening recalculates them with the current reference data
  const handleOpen = async (entry: LocalHistoryEntry) => {
    setOpeningId(entry.id)
    try {
      await runSoilCheck(entry, entry.id)
      router.push("/results")
    } catch (e) {
      console.error("Open check error:", e)
      toast.error(t.openFailed)
      setOpeningId(null)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
      <PageHeader
        eyebrow={t.eyebrow}
        icon={History}
        title={t.title}
        description={
          <>
            {t.description}
            {!loading && history.length > 0 && (
              <span className="mt-2 block text-sm font-semibold text-foreground">{t.count(history.length)}</span>
            )}
          </>
        }
        actions={
          <>
            {history.length > 0 && (
              <Button
                variant="ghost"
                className="h-10 text-muted-foreground hover:text-destructive"
                onClick={() => setPendingDelete({ kind: "clear" })}
              >
                <Trash2 />
                {t.clearAll}
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
      ) : history.length === 0 ? (
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
        <section className="space-y-3">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <HardDrive className="size-4 text-primary" />
            {t.localHint}
          </p>
          <ul className="space-y-3">
            <AnimatePresence initial={false}>
              {history.map((entry, i) => (
                <motion.li
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT, delay: Math.min(i, 8) * 0.04 } }}
                  exit={{ opacity: 0, x: -24, transition: { duration: 0.25 } }}
                >
                  <HistoryCard
                    entry={entry}
                    opening={openingId === entry.id}
                    onOpen={handleOpen}
                    onDelete={(e) => setPendingDelete({ kind: "one", entry: e })}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </section>
      )}

      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-danger-soft text-destructive">
              <Trash2 />
            </AlertDialogMedia>
            <AlertDialogTitle>{pendingDelete?.kind === "clear" ? t.clearTitle : t.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete?.kind === "clear" ? t.clearDescription(history.length) : t.deleteDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{common.actions.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-primary-foreground hover:bg-destructive/90"
            >
              {pendingDelete?.kind === "clear" ? t.clearAll : common.actions.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function HistoryCard({
  entry,
  opening,
  onOpen,
  onDelete,
}: {
  entry: LocalHistoryEntry
  opening: boolean
  onOpen: (entry: LocalHistoryEntry) => void
  onDelete: (entry: LocalHistoryEntry) => void
}) {
  const t = useT(historyMessages)
  const common = useT(commonMessages)
  const f = useFormat()
  const { site, soil } = entry

  const chips =
    soil.inputMode === "lab"
      ? [
          { k: "pH", v: f.number(soil.ph) },
          { k: "OM", v: `${f.number(soil.organicMatterPct)}%` },
          { k: "P", v: f.number(soil.phosphorusMgKg) },
          { k: "K", v: f.number(soil.potassiumMgKg) },
        ]
      : [
          { k: "pH", v: f.number(soil.ph) },
          { k: "N", v: common.nutrientLevels[soil.nitrogenLevel] },
          { k: "P", v: common.nutrientLevels[soil.phosphorusLevel] },
          { k: "K", v: common.nutrientLevels[soil.potassiumLevel] },
        ]

  return (
    <div className="surface-interactive p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        {/* Date, site and soil values */}
        <div className="min-w-0 space-y-2.5 lg:w-72 lg:shrink-0">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Calendar className="size-4 text-muted-foreground" />
            <span className="font-semibold text-foreground">{f.date(entry.createdAt)}</span>
            <span className="text-xs text-muted-foreground">{f.relative(entry.createdAt)}</span>
          </div>
          {entry.notes && <p className="truncate text-sm text-foreground">{entry.notes}</p>}
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="muted">{common.landTypes[site.landType]}</Badge>
            <Badge variant="muted">{common.soilTextures[site.soilTexture]}</Badge>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {chips.map((c) => (
              <span key={c.k} className="inline-flex items-baseline gap-1 rounded-md bg-muted px-2 py-1 text-xs">
                <span className="font-semibold text-muted-foreground">{c.k}</span>
                <span className="font-bold tabular-nums text-foreground">{c.v}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Top crops */}
        <div className="min-w-0 flex-1 border-t border-border pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-5">
          <p className="mb-2 text-xs font-semibold text-muted-foreground">{t.topCrops}</p>
          {entry.topCrops.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.noCrops}</p>
          ) : (
            <ol className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {entry.topCrops.map((c, idx) => (
                <li key={c.cropId} className="flex min-w-0 items-center gap-2.5 rounded-xl bg-muted/60 p-2">
                  <CropIcon name={c.cropName} category={c.category} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      <span className="mr-1 text-muted-foreground">{idx + 1}.</span>
                      {f.pick(c.cropNameTh, c.cropName)}
                    </p>
                    <span
                      className={cn(
                        "mt-0.5 inline-flex rounded-full border px-1.5 py-px text-[11px] font-semibold tabular-nums",
                        TONE_BADGE[scoreTone(c.score)]
                      )}
                      title={common.levels[c.level] ?? c.level}
                    >
                      {t.score(c.score)}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 lg:flex-col lg:items-stretch">
          <Button variant="outline" className="h-10 flex-1 lg:flex-none" onClick={() => onOpen(entry)} disabled={opening}>
            {opening && <Loader2 className="animate-spin" />}
            {opening ? t.opening : t.open}
            {!opening && <ArrowRight />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-10 text-muted-foreground hover:bg-danger-soft hover:text-destructive lg:w-full"
            onClick={() => onDelete(entry)}
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
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="surface flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
          <div className="space-y-2.5 lg:w-72">
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
