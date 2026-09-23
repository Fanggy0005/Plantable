"use client"

import { useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import { ArrowUpRight, CheckCircle2, ChevronDown, Crosshair, Lightbulb, Medal } from "lucide-react"
import { SuitabilityGauge } from "@/components/charts/SuitabilityGauge"
import { CropIcon } from "@/components/shared/CropIcon"
import { EASE_OUT } from "@/components/motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FavoriteButton } from "@/features/crop/components/FavoriteButton"
import { useFormat, useT } from "@/lib/i18n"
import { commonMessages } from "@/lib/i18n/messages/common"
import { scoreTone, TONE_COLOR } from "@/lib/score"
import { cn } from "@/lib/utils"
import type { RecommendedCrop } from "@/types"
import { recommendationMessages } from "../messages"

interface CropRecommendationCardProps {
  crop: RecommendedCrop
  rank: number
  isSelected?: boolean
  onSelectForComparison?: (crop: RecommendedCrop) => void
}

const MEDAL: Record<number, string> = {
  1: "bg-warning-soft text-warning ring-warning/30",
  2: "bg-muted text-muted-foreground ring-border",
  3: "bg-danger-soft text-chart-5 ring-chart-5/25",
}

function RankMedal({ rank }: { rank: number }) {
  return (
    <span
      className={cn(
        "relative flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-1 ring-inset",
        MEDAL[rank] ?? "bg-card text-muted-foreground ring-border"
      )}
    >
      {rank <= 3 && <Medal className="absolute -top-1.5 -right-1.5 size-3.5 rounded-full bg-card" />}
      {rank}
    </span>
  )
}

function BreakdownBar({ label, value, delay }: { label: string; value: number; delay: number }) {
  const v = Math.max(0, Math.min(100, value))
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2 text-[11px]">
        <span className="truncate text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground tabular-nums">{v}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full"
          style={{ background: TONE_COLOR[scoreTone(v)] }}
          initial={{ width: 0 }}
          whileInView={{ width: `${v}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE_OUT, delay }}
        />
      </div>
    </div>
  )
}

export function CropRecommendationCard({
  crop,
  rank,
  isSelected = false,
  onSelectForComparison,
}: CropRecommendationCardProps) {
  const t = useT(recommendationMessages).card
  const common = useT(commonMessages)
  const { pick, locale } = useFormat()
  const [expanded, setExpanded] = useState(rank === 1)

  const cropId = crop.plantId || crop.cropId || ""
  const primaryName = pick(crop.nameTh, crop.name)
  const secondaryName = locale === "th" ? crop.name : crop.nameTh
  const detailCount = crop.reasons.length + (crop.improvements?.length ?? 0)

  const nutrients = [
    { key: "nitrogen", short: "N" },
    { key: "phosphorus", short: "P" },
    { key: "potassium", short: "K" },
    { key: "ph", short: "pH" },
  ] as const

  return (
    <article
      className={cn(
        "surface-interactive overflow-hidden",
        isSelected && "border-primary/60 ring-2 ring-primary/15 hover:border-primary/60"
      )}
    >
      <div
        className={cn("p-4 sm:p-5", onSelectForComparison && "cursor-pointer")}
        onClick={() => onSelectForComparison?.(crop)}
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <RankMedal rank={rank} />
          <CropIcon name={crop.name} category={crop.category} className="hidden sm:inline-flex" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h3 className="text-lg font-bold tracking-tight text-foreground">{primaryName}</h3>
              {secondaryName && secondaryName !== primaryName && (
                <span className="text-sm text-muted-foreground">{secondaryName}</span>
              )}
              <FavoriteButton cropId={cropId} />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {crop.category && (
                <Badge variant="secondary">{common.categories[crop.category] ?? crop.category}</Badge>
              )}
              {crop.scientificName && (
                <span className="text-xs text-muted-foreground italic">{crop.scientificName}</span>
              )}
            </div>
          </div>
          <SuitabilityGauge score={crop.score} level={crop.level} size={72} strokeWidth={7} className="shrink-0" />
        </div>

        {crop.description && (
          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground sm:pl-27">{crop.description}</p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4 sm:pl-27">
          {nutrients.map((n, i) => (
            <BreakdownBar
              key={n.key}
              label={`${n.short} ${common.nutrients[n.key]}`}
              value={crop.breakdown[n.key]}
              delay={0.1 + i * 0.06}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border bg-muted/30 px-3 py-2 sm:px-4">
        <Button
          variant="ghost"
          size="sm"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
          className="h-10 text-primary"
        >
          <motion.span animate={{ rotate: expanded ? 180 : 0 }} className="inline-flex">
            <ChevronDown />
          </motion.span>
          {expanded ? t.hideDetails : t.showDetails(detailCount)}
        </Button>

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            render={<Link href={`/crops/${cropId}`} />}
            nativeButton={false}
            className="h-10 text-muted-foreground"
          >
            {t.cropInfo}
            <ArrowUpRight />
          </Button>
          {onSelectForComparison && (
            <Button
              variant={isSelected ? "default" : "outline"}
              size="sm"
              aria-pressed={isSelected}
              onClick={() => onSelectForComparison(crop)}
              className="h-10"
            >
              <Crosshair />
              <span className="hidden sm:inline">{isSelected ? t.viewing : t.compare}</span>
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <div className="grid gap-3 border-t border-border p-4 sm:grid-cols-2 sm:p-5">
              <div className="rounded-xl bg-success-soft/60 p-3.5">
                <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-success">
                  <CheckCircle2 className="size-4 shrink-0" />
                  {t.reasonsTitle}
                </h4>
                <ul className="space-y-1.5 text-sm leading-relaxed text-foreground/80">
                  {crop.reasons.map((r, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-2 size-1 shrink-0 rounded-full bg-success" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {crop.improvements && crop.improvements.length > 0 && (
                <div className="rounded-xl bg-warning-soft/70 p-3.5">
                  <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-warning">
                    <Lightbulb className="size-4 shrink-0" />
                    {t.improvementsTitle}
                  </h4>
                  <ul className="space-y-1.5 text-sm leading-relaxed text-foreground/80">
                    {crop.improvements.map((imp, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-2 size-1 shrink-0 rounded-full bg-warning" />
                        {imp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  )
}
