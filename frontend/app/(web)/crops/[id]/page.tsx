"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { motion } from "motion/react"
import { ArrowLeft, BookOpen, CalendarClock, Droplets, FlaskConical, Info, Layers, Map as MapIcon, Sprout, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { PHScaleGauge } from "@/components/charts/PHScaleGauge"
import { CropIcon } from "@/components/shared/CropIcon"
import { SectionHeading } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/States"
import { FadeIn, Stagger, StaggerItem } from "@/components/motion"
import { cropCatalogMessages } from "@/features/crop/catalog-messages"
import { fetchCropById } from "@/lib/api"
import { useFormat, useT } from "@/lib/i18n"
import { commonMessages } from "@/lib/i18n/messages/common"
import { LEVEL_VARIANT } from "@/lib/score"
import type { CropDetail, CropRequirement, FertilizerStage } from "@/types"

export default function CropDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const t = useT(cropCatalogMessages).detail
  const common = useT(commonMessages)
  const { pick, locale } = useFormat()

  const [crop, setCrop] = useState<CropDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    fetchCropById(id)
      .then((data) => !cancelled && setCrop(data))
      .catch((err) => {
        console.error("Failed to load crop", err)
        if (!cancelled) setError(true)
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) return <CropDetailSkeleton />

  if (error || !crop) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <EmptyState
          icon={Sprout}
          title={t.notFoundTitle}
          description={t.notFoundDescription}
          action={
            <Button variant="outline" render={<Link href="/crops" />} nativeButton={false}>
              <ArrowLeft />
              {t.backToList}
            </Button>
          }
        />
      </div>
    )
  }

  const req = crop.requirement
  const displayName = pick(crop.nameTh, crop.name)
  const secondaryName = locale === "th" ? crop.name : crop.nameTh

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
      <Link
        href="/crops"
        className="inline-flex h-10 items-center gap-1.5 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        {t.back}
      </Link>

      {/* Hero */}
      <FadeIn immediate className="surface relative overflow-hidden p-5 sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-60 mask-[linear-gradient(to_left,black,transparent_70%)]" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4 sm:items-center sm:gap-5">
            <motion.div
              initial={{ scale: 0.8, rotate: -8, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
            >
              <CropIcon name={crop.name} category={crop.category} size="xl" />
            </motion.div>
            <div className="min-w-0 space-y-1.5">
              <Badge variant="secondary">{common.categories[crop.category] ?? crop.category}</Badge>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{displayName}</h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                {secondaryName}
                {crop.scientificName && (
                  <>
                    <span className="mx-1.5">·</span>
                    <span className="sr-only">{t.scientificName}: </span>
                    <span className="italic">{crop.scientificName}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <Button size="lg" className="h-11 w-full px-5 sm:w-auto" render={<Link href="/analyze" />} nativeButton={false}>
            <FlaskConical />
            {t.testSoil}
          </Button>
        </div>

        {crop.description && (
          <div className="relative mt-6 flex gap-3 rounded-xl bg-muted/70 p-4">
            <Info className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <p className="text-xs font-semibold text-muted-foreground">{t.overview}</p>
              <p className="mt-1 text-sm leading-relaxed text-foreground">{crop.description}</p>
            </div>
          </div>
        )}
      </FadeIn>

      <section className="space-y-5">
        <SectionHeading icon={Target} title={t.requirementsTitle} description={t.requirementsDescription} />
        {req ? <Requirements requirement={req} cropName={displayName} /> : <EmptyState icon={Target} title={t.noRequirement} />}
      </section>

      {crop.fertilizerStages.length > 0 && <FertilizerStages stages={crop.fertilizerStages} />}
    </div>
  )
}

function Requirements({ requirement: req, cropName }: { requirement: CropRequirement; cropName: string }) {
  const t = useT(cropCatalogMessages).detail
  const common = useT(commonMessages)

  const siteRows = [
    { icon: MapIcon, label: t.landTypes, values: req.allowedLandTypes.map((v) => common.landTypes[v]) },
    { icon: Droplets, label: t.minWater, values: [common.waterSupplies[req.minWaterSupply]] },
    { icon: Layers, label: t.textures, values: req.preferredTextures.map((v) => common.soilTextures[v]) },
  ]
  const nutrientRows = [
    { key: "organicMatter", level: req.minOrganicMatterLevel },
    { key: "nitrogen", level: req.minNitrogenLevel },
    { key: "phosphorus", level: req.minPhosphorusLevel },
    { key: "potassium", level: req.minPotassiumLevel },
  ] as const

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <FadeIn className="surface space-y-5 p-5 sm:p-6 lg:col-span-3">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground">{t.siteTitle}</h3>
            <dl className="space-y-2.5">
              {siteRows.map(({ icon: Icon, label, values }) => (
                <div key={label} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon className="size-4 text-primary" />
                    {label}
                  </dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {values.map((v) => (
                      <Badge key={v} variant="outline">
                        {v}
                      </Badge>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="space-y-3 border-t border-border pt-5">
            <h3 className="text-sm font-bold text-foreground">{t.nutrientsTitle}</h3>
            <dl className="grid grid-cols-2 gap-2">
              {nutrientRows.map(({ key, level }) => (
                <div key={key} className="rounded-xl bg-muted/60 p-3">
                  <dt className="text-xs text-muted-foreground">{common.nutrients[key]}</dt>
                  <dd className="mt-1">
                    <Badge variant={LEVEL_VARIANT[level]}>{t.atLeast(common.nutrientLevels[level])}</Badge>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </FadeIn>

        <FadeIn delay={0.1} className="flex flex-col gap-4 lg:col-span-2">
          <div className="surface flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">{t.phTitle}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
                {req.phMin}–{req.phMax}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-muted-foreground">{t.optimal}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-primary">{req.phOptimal}</p>
            </div>
          </div>
          <PHScaleGauge currentPh={req.phOptimal} targetMin={req.phMin} targetMax={req.phMax} cropName={cropName} />
        </FadeIn>
      </div>

      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <BookOpen className="mt-px size-3.5 shrink-0" />
        <span>
          <span className="font-semibold">{t.source}:</span> {req.source}
        </span>
      </p>
    </div>
  )
}

function FertilizerStages({ stages }: { stages: FertilizerStage[] }) {
  const t = useT(cropCatalogMessages).detail
  const { pick, number } = useFormat()
  const pct = (share: number) => `${number(Math.round(share * 100))}%`

  return (
    <section className="space-y-5">
      <SectionHeading icon={CalendarClock} title={t.stagesTitle} description={t.stagesDescription} />
      <Stagger className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stages.map((stage) => (
          <StaggerItem key={stage.id} className="surface space-y-3 p-4">
            <div className="flex items-start gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-primary">
                {stage.order}
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-foreground">{pick(stage.nameTh, stage.nameEn)}</p>
                <p className="text-xs text-muted-foreground">{t.day(stage.daysAfterPlanting)}</p>
              </div>
            </div>
            <dl className="grid grid-cols-3 gap-1.5 text-center">
              {[
                ["N", stage.nitrogenShare],
                ["P₂O₅", stage.phosphorusShare],
                ["K₂O", stage.potassiumShare],
              ].map(([k, v]) => (
                <div key={k as string} className="rounded-lg bg-muted px-2 py-1.5">
                  <dt className="text-[11px] font-semibold text-muted-foreground">{k}</dt>
                  <dd className="text-sm font-bold text-foreground tabular-nums">{pct(v as number)}</dd>
                </div>
              ))}
            </dl>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  )
}

function CropDetailSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
      <Skeleton className="h-5 w-32 rounded-md" />
      <div className="surface space-y-6 p-5 sm:p-8">
        <div className="flex items-center gap-5">
          <Skeleton className="size-20 rounded-3xl" />
          <div className="flex-1 space-y-2.5">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-9 w-48 rounded-lg" />
            <Skeleton className="h-4 w-64 max-w-full rounded-md" />
          </div>
        </div>
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <Skeleton className="h-72 lg:col-span-3" />
        <Skeleton className="h-72 lg:col-span-2" />
      </div>
    </div>
  )
}
