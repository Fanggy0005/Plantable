"use client"

import { CheckCircle2, Clock, FlaskConical, Layers } from "lucide-react"
import { Stagger, StaggerItem } from "@/components/motion"
import { SectionHeading } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/States"
import { Badge } from "@/components/ui/badge"
import { useT } from "@/lib/i18n"
import { commonMessages } from "@/lib/i18n/messages/common"
import type { FertilizerScheduleItem } from "@/types"
import { soilImprovementMessages } from "../messages"

interface FertilizerScheduleCardProps {
  schedule: FertilizerScheduleItem[]
  cropNameTh?: string
  /** Hide the heading when rendered inside a tab that already labels it */
  hideHeading?: boolean
}

export function FertilizerScheduleCard({ schedule, cropNameTh, hideHeading = false }: FertilizerScheduleCardProps) {
  const t = useT(soilImprovementMessages)
  const common = useT(commonMessages)

  return (
    <div className="space-y-5">
      {!hideHeading && (
        <SectionHeading
          icon={FlaskConical}
          title={t.fertilizer.title}
          description={cropNameTh ? t.fertilizer.subtitleFor(cropNameTh) : t.fertilizer.subtitleGeneral}
          actions={
            schedule.length > 0 ? (
              <Badge variant="secondary">
                <Layers />
                {t.fertilizer.splitNote(schedule.length)}
              </Badge>
            ) : undefined
          }
        />
      )}

      {schedule.length === 0 ? (
        <EmptyState icon={CheckCircle2} title={t.fertilizer.empty} />
      ) : (
        <Stagger className="relative space-y-4 pl-11 sm:pl-14" stagger={0.08}>
          {/* Timeline rail */}
          <div
            aria-hidden
            className="absolute top-3 bottom-3 left-[15px] w-0.5 rounded-full bg-linear-to-b from-primary/60 via-primary/25 to-transparent sm:left-[19px]"
          />
          {schedule.map((step, idx) => (
            <StaggerItem key={idx} className="relative">
              <span className="absolute top-4 -left-11 flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-sm ring-4 ring-background sm:-left-14 sm:size-10">
                {idx + 1}
              </span>

              <div className="surface-interactive space-y-3 p-4 sm:p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                      {t.fertilizer.step(idx + 1)}
                    </p>
                    <h5 className="text-base font-bold text-foreground">{step.stage}</h5>
                  </div>
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-primary px-3 py-1 font-mono text-sm font-bold text-primary-foreground">
                    {step.formula}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1 font-semibold text-secondary-foreground">
                    {t.fertilizer.rate}: {step.rateKgPerRai} {common.units.kgPerRai}
                  </span>
                  <span className="rounded-lg bg-muted px-2.5 py-1 text-muted-foreground">
                    {step.rateKgPerHectare} {t.fertilizer.perHectare}
                  </span>
                </div>

                <p className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>
                    <span className="font-semibold text-foreground">{t.fertilizer.timing}: </span>
                    {step.timing}
                  </span>
                </p>

                {step.instructions && (
                  <p className="rounded-xl bg-muted/70 p-3 text-sm leading-relaxed text-muted-foreground">
                    {step.instructions}
                  </p>
                )}
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  )
}
