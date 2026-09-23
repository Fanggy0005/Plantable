"use client"

import { CheckCircle2, Leaf, TestTube, Wrench } from "lucide-react"
import { Stagger, StaggerItem } from "@/components/motion"
import { SectionHeading } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/States"
import { Badge } from "@/components/ui/badge"
import { useFormat, useT } from "@/lib/i18n"
import { commonMessages } from "@/lib/i18n/messages/common"
import type { OrganicAlternative, PhCorrectionPlan } from "@/types"
import { soilImprovementMessages } from "../messages"

/** pH amendment recommendation: material, dosage and method. */
export function PhCorrectionCard({ phCorrection }: { phCorrection: PhCorrectionPlan }) {
  const t = useT(soilImprovementMessages)
  const common = useT(commonMessages)
  const { locale } = useFormat()
  const isOptimal = phCorrection.dosageKgPerRai === 0
  const category =
    locale === "th"
      ? phCorrection.categoryTh
      : t.phCategory[phCorrection.category] ?? phCorrection.categoryTh

  return (
    <div className="surface space-y-4 p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
            <TestTube className="size-5" />
          </span>
          <div>
            <h4 className="text-base font-bold text-foreground">{t.ph.title}</h4>
            <p className="text-sm text-muted-foreground">
              {t.ph.current}: <strong className="text-foreground">{phCorrection.currentPh}</strong> · {category}
            </p>
          </div>
        </div>
        <Badge variant={isOptimal ? "success" : "warning"} className="w-fit">
          {isOptimal ? <CheckCircle2 /> : <Wrench />}
          {isOptimal ? t.ph.noNeed : t.ph.needed}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-muted/70 p-4">
          <p className="text-xs font-semibold text-muted-foreground">{t.ph.material}</p>
          <p className="mt-1 text-sm font-bold text-foreground">{phCorrection.recommendedMaterial}</p>
        </div>
        <div className="rounded-xl bg-muted/70 p-4">
          <p className="text-xs font-semibold text-muted-foreground">{t.ph.dosage}</p>
          <p className="mt-1 text-sm font-bold text-primary">
            {phCorrection.dosageKgPerRai} {common.units.kgPerRai}
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
              ({phCorrection.dosageKgPerHectare} {t.ph.perHectare})
            </span>
          </p>
        </div>
      </div>

      {phCorrection.applicationMethodTh && (
        <div className="rounded-xl border border-border p-4 text-sm leading-relaxed text-muted-foreground">
          <p className="mb-1 font-semibold text-foreground">{t.ph.method}</p>
          {phCorrection.applicationMethodTh}
        </div>
      )}
    </div>
  )
}

/** Grid of organic / biological fertilizer options. */
export function OrganicAlternativesCard({
  organicAlternatives,
  hideHeading = false,
}: {
  organicAlternatives: OrganicAlternative[]
  hideHeading?: boolean
}) {
  const t = useT(soilImprovementMessages)

  return (
    <div className="space-y-4">
      {!hideHeading && (
        <SectionHeading icon={Leaf} title={t.organic.title} description={t.organic.description} />
      )}
      {organicAlternatives.length === 0 ? (
        <EmptyState icon={Leaf} title={t.organic.empty} />
      ) : (
        <Stagger className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {organicAlternatives.map((item, idx) => (
            <StaggerItem key={idx} className="surface-interactive flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-success-soft text-success">
                    <Leaf className="size-4" />
                  </span>
                  <div>
                    <h5 className="text-sm font-bold text-foreground">{item.nameTh}</h5>
                    <p className="text-xs text-muted-foreground">{t.organic.types[item.type] ?? item.type}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {item.targetNutrient}
                </Badge>
              </div>
              <p className="text-sm font-semibold text-primary">
                {t.organic.rate}: <span className="font-medium">{item.rateTh}</span>
              </p>
              <p className="mt-auto border-t border-border pt-3 text-sm leading-relaxed text-muted-foreground">
                {item.benefitTh}
              </p>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  )
}

interface SoilAmendmentCardProps {
  phCorrection: PhCorrectionPlan
  organicAlternatives: OrganicAlternative[]
}

/** pH correction followed by organic alternatives. */
export function SoilAmendmentCard({ phCorrection, organicAlternatives }: SoilAmendmentCardProps) {
  return (
    <div className="space-y-6">
      <PhCorrectionCard phCorrection={phCorrection} />
      <OrganicAlternativesCard organicAlternatives={organicAlternatives} />
    </div>
  )
}
