"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { motion } from "motion/react"
import { ArrowLeft, Coins, FlaskConical, Info, Leaf, Sprout, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { PHScaleGauge } from "@/components/charts/PHScaleGauge"
import { CropIcon } from "@/components/shared/CropIcon"
import { SectionHeading } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/States"
import { EASE_OUT, FadeIn } from "@/components/motion"
import { FavoriteButton } from "@/features/crop/components/FavoriteButton"
import { FertilizerScheduleCard } from "@/features/soil-improvement/components/FertilizerScheduleCard"
import { SoilAmendmentCard } from "@/features/soil-improvement/components/SoilAmendmentCard"
import { CropEconomicsCard } from "@/features/economics/components/CropEconomicsCard"
import { cropCatalogMessages } from "@/features/crop/catalog-messages"
import { fetchCropById, fetchSoilImprovement } from "@/lib/api"
import { useFormat, useT } from "@/lib/i18n"
import { commonMessages } from "@/lib/i18n/messages/common"
import type { Crop, SoilImprovementPlan } from "@/types"

export default function CropDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const t = useT(cropCatalogMessages).detail
  const common = useT(commonMessages)
  const { pick, locale } = useFormat()

  const [crop, setCrop] = useState<Crop | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [soilPlan, setSoilPlan] = useState<SoilImprovementPlan | null>(null)

  useEffect(() => {
    async function loadCrop() {
      if (!id) return
      setLoading(true)
      try {
        const data = await fetchCropById(id)
        setCrop(data)
        if (data.requirement) {
          const plan = await fetchSoilImprovement(
            {
              nitrogen: data.requirement.nitrogenOptimal,
              phosphorus: data.requirement.phosphorusOptimal,
              potassium: data.requirement.potassiumOptimal,
              ph: data.requirement.phOptimal,
            },
            data.id
          )
          setSoilPlan(plan)
        }
      } catch (err) {
        setError(err instanceof Error && err.message ? err.message : "Failed to load crop details")
      } finally {
        setLoading(false)
      }
    }
    loadCrop()
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

  const nutrients = req
    ? [
        { letter: "N", label: common.nutrients.nitrogen, min: req.nitrogenMin, max: req.nitrogenMax, optimal: req.nitrogenOptimal, color: "var(--chart-1)" },
        { letter: "P", label: common.nutrients.phosphorus, min: req.phosphorusMin, max: req.phosphorusMax, optimal: req.phosphorusOptimal, color: "var(--chart-3)" },
        { letter: "K", label: common.nutrients.potassium, min: req.potassiumMin, max: req.potassiumMax, optimal: req.potassiumOptimal, color: "var(--chart-4)" },
      ]
    : []

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
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{common.categories[crop.category] ?? crop.category}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{displayName}</h1>
                <FavoriteButton cropId={crop.id} />
              </div>
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

      {req && (
        <section className="space-y-5">
          <SectionHeading icon={Target} title={t.requirementsTitle} description={t.requirementsDescription} />

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
            <FadeIn className="surface space-y-6 p-5 sm:p-6 lg:col-span-3">
              {nutrients.map((n, i) => (
                <RangeBar key={n.letter} {...n} delay={i * 0.1} optimalLabel={t.optimal} rangeLabel={t.range} unit={common.units.mgPerKg} />
              ))}
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
              <PHScaleGauge
                currentPh={req.phOptimal}
                targetMin={req.phMin}
                targetMax={req.phMax}
                cropName={displayName}
              />
            </FadeIn>
          </div>
        </section>
      )}

      {soilPlan && (
        <section className="space-y-5">
          <SectionHeading icon={Leaf} title={t.managementTitle} description={t.managementDescription} />
          <FadeIn className="space-y-5">
            <FertilizerScheduleCard schedule={soilPlan.fertilizerRecommendations} cropNameTh={displayName} />
            <SoilAmendmentCard
              phCorrection={soilPlan.phCorrection}
              organicAlternatives={soilPlan.organicAlternatives}
            />
          </FadeIn>
        </section>
      )}

      {req && (
        <section className="space-y-5">
          <SectionHeading icon={Coins} title={t.economicsTitle} />
          <FadeIn>
            <CropEconomicsCard cropId={crop.id} cropNameTh={displayName} />
          </FadeIn>
        </section>
      )}
    </div>
  )
}

/** Horizontal track showing the acceptable range as a band and the optimal value as a dot. */
function RangeBar({
  letter,
  label,
  min,
  max,
  optimal,
  color,
  delay,
  optimalLabel,
  rangeLabel,
  unit,
}: {
  letter: string
  label: string
  min: number
  max: number
  optimal: number
  color: string
  delay: number
  optimalLabel: string
  rangeLabel: string
  unit: string
}) {
  const scaleMax = Math.max(max * 1.25, 1)
  const left = (min / scaleMax) * 100
  const width = ((max - min) / scaleMax) * 100
  const dot = (optimal / scaleMax) * 100

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className="flex size-9 items-center justify-center rounded-lg text-sm font-bold text-primary-foreground"
            style={{ backgroundColor: color }}
          >
            {letter}
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">
              {rangeLabel} {min}–{max} {unit}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-medium text-muted-foreground">{optimalLabel}</p>
          <p className="text-xl font-bold tabular-nums text-foreground">{optimal}</p>
        </div>
      </div>

      <div className="relative h-3 rounded-full bg-muted">
        <motion.div
          className="absolute inset-y-0 rounded-full"
          style={{ left: `${left}%`, backgroundColor: `color-mix(in oklch, ${color} 28%, transparent)` }}
          initial={{ width: 0 }}
          whileInView={{ width: `${width}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE_OUT, delay }}
        />
        <motion.div
          className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card shadow-sm"
          style={{ left: `${dot}%`, backgroundColor: color }}
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 400, damping: 18, delay: delay + 0.5 }}
        />
      </div>
      <div className="flex justify-between text-[11px] tabular-nums text-muted-foreground">
        <span>0</span>
        <span>{Math.round(scaleMax)}</span>
      </div>
    </div>
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
