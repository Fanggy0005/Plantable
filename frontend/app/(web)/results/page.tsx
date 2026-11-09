"use client"

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { AnimatePresence, LayoutGroup, motion } from "motion/react"
import {
  AlertTriangle,
  Ban,
  Calendar,
  CloudSun,
  FileDown,
  HardDrive,
  Leaf,
  ListOrdered,
  Loader2,
  RefreshCw,
  SearchX,
  Sprout,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { EASE_OUT, FadeIn } from "@/components/motion"
import { PageHeader, SectionHeading } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/States"
import { CropRecommendationCard } from "@/features/recommendation/components/CropRecommendationCard"
import { SelectedCropPanel } from "@/features/recommendation/components/SelectedCropPanel"
import { recommendationMessages } from "@/features/recommendation/messages"
import { SoilSummary } from "@/features/soil-analysis/components/SoilSummary"
import { SoilPlanSection } from "@/features/soil-improvement/components/SoilPlanSection"
import { WeatherWidget } from "@/features/environment/components/WeatherWidget"
import { buildSoilPlan, fetchCropById } from "@/lib/api"
import { useFormat, useT } from "@/lib/i18n"
import { commonMessages } from "@/lib/i18n/messages/common"
import { CURRENT_CHECK_KEY, readCurrentCheck } from "@/lib/soil-check"
import { cn } from "@/lib/utils"
import type { CropGroup, CropRequirement, PlanMode, RankedCrop, SoilPlan } from "@/types"

type SectionId = "ranking" | "soil-plan" | "weather"

/** Sticky in-page navigation that highlights the section currently in view. */
function SectionNav({ items }: { items: { id: SectionId; label: string; icon: LucideIcon }[] }) {
  const [active, setActive] = useState<SectionId>(items[0].id)
  const ids = items.map((i) => i.id).join(",")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id as SectionId)
      },
      { rootMargin: "-140px 0px -55% 0px" }
    )
    ids.split(",").forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [ids])

  return (
    <div className="sticky top-16 z-30 -mx-4 border-b border-border bg-background/85 px-4 py-2 backdrop-blur-lg sm:-mx-6 sm:px-6">
      <nav className="flex gap-1 overflow-x-auto scrollbar-none">
        {items.map((item) => {
          const isActive = item.id === active
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setActive(item.id)}
              className={cn(
                "relative flex h-10 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-colors",
                isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="results-section-pill"
                  className="absolute inset-0 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <item.icon className="relative size-4" />
              <span className="relative">{item.label}</span>
            </a>
          )
        })}
      </nav>
    </div>
  )
}

function ResultsSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
      <div className="space-y-3 border-b border-border pb-6">
        <Skeleton className="h-6 w-40 rounded-full" />
        <Skeleton className="h-9 w-2/3 max-w-md" />
        <Skeleton className="h-5 w-1/2 max-w-sm" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
        <Skeleton className="hidden h-130 lg:block" />
      </div>
    </div>
  )
}

// sessionStorage has no change events within the same tab; the value is written before navigating here
const subscribeToNothing = () => () => {}

const MAX_AREA_RAI = 100_000
const PLAN_DEBOUNCE_MS = 300
const GROUP_ORDER: CropGroup[] = ["field_crop", "tree_crop", "horticulture"]

interface PlanResult {
  key: string
  plan: SoilPlan | null
  error: string | null
}

export default function ResultsPage() {
  const router = useRouter()
  const t = useT(recommendationMessages).results
  const common = useT(commonMessages)
  const fmt = useFormat()
  const stored = useSyncExternalStore(
    subscribeToNothing,
    () => sessionStorage.getItem(CURRENT_CHECK_KEY),
    () => null
  )
  const check = useMemo(() => readCurrentCheck(stored), [stored])
  const ranked = useMemo(() => check?.result.ranked ?? [], [check])

  const [pickedId, setPickedId] = useState<string | null>(null)
  // Default to the top-ranked crop until the user picks one
  const selectedCrop = ranked.find((c) => c.cropId === pickedId) ?? ranked[0] ?? null
  const selectedCropId = selectedCrop?.cropId ?? null
  const [groupFilter, setGroupFilter] = useState<string>("All")
  const [exporting, setExporting] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Crop requirements, loaded on demand for the side panel
  const [requirements, setRequirements] = useState<Record<string, CropRequirement | null>>({})

  // Soil plan inputs and the latest response
  const [areaInput, setAreaInput] = useState("1")
  const [mode, setMode] = useState<PlanMode>("combined")
  const [planResult, setPlanResult] = useState<PlanResult | null>(null)
  const area = parseFloat(areaInput)
  const areaRai = area > 0 && area <= MAX_AREA_RAI ? area : null
  const planKey = check && selectedCropId && areaRai ? `${selectedCropId}|${areaRai}|${mode}` : null

  useEffect(() => {
    // Read storage directly: during hydration `check` is still the server snapshot (null)
    if (!readCurrentCheck(sessionStorage.getItem(CURRENT_CHECK_KEY))) {
      router.push("/analyze")
    }
  }, [router])

  useEffect(() => {
    if (!selectedCropId || selectedCropId in requirements) return
    fetchCropById(selectedCropId)
      .then((crop) => setRequirements((prev) => ({ ...prev, [selectedCropId]: crop.requirement })))
      .catch((err) => console.error("Failed to load crop requirement", err))
  }, [selectedCropId, requirements])

  useEffect(() => {
    if (!check || !selectedCropId || !areaRai || !planKey) return
    let cancelled = false
    const timer = setTimeout(() => {
      buildSoilPlan({ cropId: selectedCropId, areaRai, mode, site: check.site, soil: check.soil })
        .then((plan) => !cancelled && setPlanResult({ key: planKey, plan, error: null }))
        .catch((err: Error) => !cancelled && setPlanResult({ key: planKey, plan: null, error: err.message }))
    }, PLAN_DEBOUNCE_MS)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [check, selectedCropId, areaRai, mode, planKey])

  const planLoading = planKey !== null && planResult?.key !== planKey
  // Keep the previous plan on screen (dimmed) while the next one loads
  const plan = planResult?.plan ?? null
  const planError = planResult?.key === planKey ? planResult.error : null

  const handleExportPDF = async () => {
    if (!check) return
    setExporting(true)
    try {
      const { exportToPDF } = await import("@/lib/export-pdf")
      await exportToPDF(
        {
          check,
          plan: planResult?.key === planKey ? plan : null,
          planCropName: selectedCrop ? fmt.pick(selectedCrop.cropNameTh, selectedCrop.cropName) : undefined,
        },
        { locale: fmt.locale }
      )
      toast.success(t.exportSuccess)
    } catch (error) {
      console.error("PDF export failed:", error)
      toast.error(t.exportError)
    } finally {
      setExporting(false)
    }
  }

  const handleSelectCrop = (crop: RankedCrop) => {
    setPickedId(crop.cropId)
    // On small screens the panel sits above the list, so bring it into view
    if (window.matchMedia("(max-width: 1023px)").matches) {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  if (!check) return <ResultsSkeleton />

  const { result } = check
  const groups = ["All", ...GROUP_ORDER.filter((g) => ranked.some((r) => r.group === g))]
  const filteredRankings = ranked
    .map((crop, index) => ({ crop, rank: index + 1 }))
    .filter(({ crop }) => groupFilter === "All" || crop.group === groupFilter)

  const topCrop = ranked[0]
  const selectedName = selectedCrop ? fmt.pick(selectedCrop.cropNameTh, selectedCrop.cropName) : undefined

  const sections: { id: SectionId; label: string; icon: LucideIcon }[] = [
    { id: "ranking", label: t.sections.ranking, icon: ListOrdered },
    { id: "soil-plan", label: t.sections.soilPlan, icon: Leaf },
    { id: "weather", label: t.sections.weather, icon: CloudSun },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
      <PageHeader
        eyebrow={
          <>
            <Calendar className="size-3.5" />
            {fmt.date(check.createdAt)}
          </>
        }
        title={t.title}
        description={
          <span className="flex flex-col gap-2.5">
            <span>{topCrop ? t.topPick(fmt.pick(topCrop.cropNameTh, topCrop.cropName), topCrop.score) : t.noneRanked}</span>
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              <HardDrive className="size-3.5" />
              {t.savedLocal}
            </span>
          </span>
        }
        actions={
          <>
            <Button variant="outline" size="lg" onClick={handleExportPDF} disabled={exporting}>
              {exporting ? <Loader2 className="animate-spin" /> : <FileDown />}
              {exporting ? t.exporting : t.exportPdf}
            </Button>
            <Button size="lg" render={<Link href="/analyze" />} nativeButton={false}>
              <RefreshCw />
              {t.newAnalysis}
            </Button>
          </>
        }
      />

      {result.warnings.length > 0 && (
        <div role="alert" className="rounded-2xl border border-warning/30 bg-warning-soft p-4 sm:p-5">
          <h2 className="mb-1.5 flex items-center gap-2 text-sm font-bold text-warning">
            <AlertTriangle className="size-4.5" />
            {t.warningsTitle}
          </h2>
          <ul className="space-y-1 text-sm leading-relaxed text-foreground/85">
            {result.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <SoilSummary site={check.site} soil={check.soil} levels={result.levels} />

      <SectionNav items={sections} />

      {/* 1. Ranking */}
      <section id="ranking" className="scroll-mt-32 space-y-5">
        <SectionHeading icon={Sprout} title={t.rankingTitle} description={t.rankingDesc} />

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* Selected crop panel: above the list on mobile, sticky sidebar on desktop */}
          <aside ref={panelRef} className="scroll-mt-32 lg:sticky lg:top-36 lg:order-last">
            {selectedCrop && (
              <SelectedCropPanel
                crop={selectedCrop}
                check={check}
                requirement={requirements[selectedCrop.cropId] ?? null}
              />
            )}
          </aside>

          <div className="min-w-0 space-y-4">
            {ranked.length > 0 && (
              <LayoutGroup id="category-filter">
                <div
                  role="radiogroup"
                  aria-label={t.filterLabel}
                  className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0"
                >
                  {groups.map((cat) => {
                    const active = groupFilter === cat
                    return (
                      <button
                        key={cat}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setGroupFilter(cat)}
                        className={cn(
                          "relative h-10 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors",
                          active
                            ? "border-primary text-primary-foreground"
                            : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
                        )}
                      >
                        {active && (
                          <motion.span
                            layoutId="category-pill"
                            className="absolute inset-0 rounded-full bg-primary"
                            transition={{ type: "spring", stiffness: 420, damping: 34 }}
                          />
                        )}
                        <span className="relative">
                          {cat === "All" ? t.allCount(ranked.length) : (common.groups[cat] ?? cat)}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </LayoutGroup>
            )}

            {filteredRankings.length === 0 ? (
              <EmptyState
                icon={SearchX}
                title={ranked.length === 0 ? t.noneRanked : t.noCropsInCategory}
                description={ranked.length === 0 ? t.ineligibleDesc : t.noCropsInCategoryDesc}
                action={
                  ranked.length > 0 && (
                    <Button variant="outline" onClick={() => setGroupFilter("All")}>
                      {t.allCount(ranked.length)}
                    </Button>
                  )
                }
              />
            ) : (
              <motion.div layout className="space-y-3">
                <AnimatePresence mode="popLayout" initial={false}>
                  {filteredRankings.map(({ crop, rank }, i) => (
                    <motion.div
                      key={crop.cropId}
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT, delay: Math.min(i, 6) * 0.04 } }}
                      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.2 } }}
                    >
                      <CropRecommendationCard
                        crop={crop}
                        rank={rank}
                        isSelected={selectedCropId === crop.cropId}
                        onSelect={handleSelectCrop}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            {result.ineligible.length > 0 && (
              <details className="surface group p-4 sm:p-5">
                <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-bold text-foreground">
                  <Ban className="size-4 text-muted-foreground" />
                  {t.ineligibleTitle(result.ineligible.length)}
                </summary>
                <p className="mt-2 text-xs text-muted-foreground">{t.ineligibleDesc}</p>
                <ul className="mt-3 divide-y divide-border">
                  {result.ineligible.map((crop) => (
                    <li key={crop.cropId} className="py-2.5">
                      <p className="text-sm font-semibold text-foreground">{fmt.pick(crop.cropNameTh, crop.cropName)}</p>
                      <ul className="mt-0.5 text-xs text-muted-foreground">
                        {crop.reasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        </div>
      </section>

      {/* 2. Soil improvement plan */}
      <section id="soil-plan" className="scroll-mt-32">
        <FadeIn>
          <SoilPlanSection
            plan={plan}
            cropName={selectedName}
            areaRai={areaInput}
            onAreaChange={setAreaInput}
            mode={mode}
            onModeChange={setMode}
            loading={planLoading}
            error={planError}
          />
        </FadeIn>
      </section>

      {/* 3. Weather */}
      <section id="weather" className="scroll-mt-32">
        <FadeIn>
          <WeatherWidget initialProvince={check.province} />
        </FadeIn>
      </section>
    </div>
  )
}
