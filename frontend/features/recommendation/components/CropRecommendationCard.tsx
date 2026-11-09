"use client"

import { useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import { ArrowUpRight, CheckCircle2, ChevronDown, Crosshair, ListChecks, Medal } from "lucide-react"
import { SuitabilityGauge } from "@/components/charts/SuitabilityGauge"
import { CropIcon } from "@/components/shared/CropIcon"
import { EASE_OUT } from "@/components/motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useFormat, useT } from "@/lib/i18n"
import { commonMessages } from "@/lib/i18n/messages/common"
import { DIFFICULTY_VARIANT } from "@/lib/score"
import { cn } from "@/lib/utils"
import type { RankedCrop } from "@/types"
import { recommendationMessages } from "../messages"

interface CropRecommendationCardProps {
  crop: RankedCrop
  rank: number
  isSelected?: boolean
  onSelect?: (crop: RankedCrop) => void
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

export function CropRecommendationCard({ crop, rank, isSelected = false, onSelect }: CropRecommendationCardProps) {
  const t = useT(recommendationMessages)
  const common = useT(commonMessages)
  const { pick, locale } = useFormat()
  const [expanded, setExpanded] = useState(rank === 1)

  const primaryName = pick(crop.cropNameTh, crop.cropName)
  const secondaryName = locale === "th" ? crop.cropName : crop.cropNameTh

  return (
    <article
      className={cn(
        "surface-interactive overflow-hidden",
        isSelected && "border-primary/60 ring-2 ring-primary/15 hover:border-primary/60"
      )}
    >
      <div className={cn("p-4 sm:p-5", onSelect && "cursor-pointer")} onClick={() => onSelect?.(crop)}>
        <div className="flex items-start gap-3 sm:gap-4">
          <RankMedal rank={rank} />
          <CropIcon name={crop.cropName} category={crop.category} className="hidden sm:inline-flex" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h3 className="text-lg font-bold tracking-tight text-foreground">{primaryName}</h3>
              {secondaryName && secondaryName !== primaryName && (
                <span className="text-sm text-muted-foreground">{secondaryName}</span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <Badge variant={DIFFICULTY_VARIANT[crop.difficulty]}>{common.difficulties[crop.difficulty]}</Badge>
              {crop.category && (
                <Badge variant="secondary">{common.categories[crop.category] ?? crop.category}</Badge>
              )}
            </div>
          </div>
          <SuitabilityGauge score={crop.score} level={crop.level} size={72} strokeWidth={7} className="shrink-0" />
        </div>

        <div className="mt-4 sm:pl-27">
          {crop.penalties.length === 0 ? (
            <p className="flex items-center gap-1.5 text-sm text-success">
              <CheckCircle2 className="size-4" />
              {t.card.noPenalties}
            </p>
          ) : (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-0.5 text-xs font-semibold text-muted-foreground">{t.card.penaltiesTitle}</span>
              {crop.penalties.map((p) => (
                <span
                  key={p.factor}
                  className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-foreground"
                >
                  {t.penalties[p.factor] ?? p.factor}
                  <span className="font-bold text-destructive tabular-nums">{t.card.points(p.points)}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border bg-muted/30 px-3 py-2 sm:px-4">
        {crop.reasons.length > 0 && (
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
            {expanded ? t.card.hideDetails : t.card.showDetails(crop.reasons.length)}
          </Button>
        )}

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            render={<Link href={`/crops/${crop.cropId}`} />}
            nativeButton={false}
            className="h-10 text-muted-foreground"
          >
            {t.card.cropInfo}
            <ArrowUpRight />
          </Button>
          {onSelect && (
            <Button
              variant={isSelected ? "default" : "outline"}
              size="sm"
              aria-pressed={isSelected}
              onClick={() => onSelect(crop)}
              className="h-10"
            >
              <Crosshair />
              <span className="hidden sm:inline">{isSelected ? t.card.viewing : t.card.select}</span>
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
            <div className="border-t border-border p-4 sm:p-5">
              <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-foreground">
                <ListChecks className="size-4 shrink-0 text-primary" />
                {t.card.reasonsTitle}
              </h4>
              <ul className="space-y-1.5 text-sm leading-relaxed text-foreground/80">
                {crop.reasons.map((r, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  )
}
