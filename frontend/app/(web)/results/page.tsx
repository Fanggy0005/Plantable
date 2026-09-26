"use client"

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { AnimatePresence, LayoutGroup, motion } from "motion/react"
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  CloudSun,
  Coins,
  FileDown,
  FlaskConical,
  Leaf,
  ListOrdered,
  Loader2,
  RefreshCw,
  SearchX,
  Sprout,
  TestTube2,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EASE_OUT, FadeIn, Stagger, StaggerItem } from "@/components/motion"
import { NPKRadarChart } from "@/components/charts/NPKRadarChart"
import { PHScaleGauge } from "@/components/charts/PHScaleGauge"
import { SuitabilityGauge } from "@/components/charts/SuitabilityGauge"
import { CropIcon } from "@/components/shared/CropIcon"
import { PageHeader, SectionHeading } from "@/components/shared/PageHeader"
import { StatCard } from "@/components/shared/StatCard"
import { EmptyState } from "@/components/shared/States"
import { CropRecommendationCard } from "@/features/recommendation/components/CropRecommendationCard"
import { recommendationMessages } from "@/features/recommendation/messages"
import { SoilImprovementSection } from "@/features/soil-improvement/components/SoilImprovementSection"
import { WeatherWidget } from "@/features/environment/components/WeatherWidget"
import { CropEconomicsCard } from "@/features/economics/components/CropEconomicsCard"
import { authClient } from "@/lib/auth-client"
import { fetchSoilImprovement } from "@/lib/api"
import { useFormat, useT } from "@/lib/i18n"
import { commonMessages } from "@/lib/i18n/messages/common"
import { levelFromScore } from "@/lib/score"
import { cn } from "@/lib/utils"
import type { AnalysisResult, RecommendedCrop, SoilImprovementPlan } from "@/types"

type SectionId = "ranking" | "soil-plan" | "economics" | "weather"

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

/** Right-hand panel describing the currently selected crop. */
function SelectedCropPanel({
  crop,
  soil,
}: {
  crop: RecommendedCrop
  soil: AnalysisResult["soil"]
}) {
  const t = useT(recommendationMessages).results
  const common = useT(commonMessages)
  const { pick } = useFormat()
  const name = pick(crop.nameTh, crop.name)
  const levelLabel = common.levels[crop.level ?? levelFromScore(crop.score)]

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={crop.plantId || crop.cropId}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: EASE_OUT }}
          className="surface flex items-center gap-4 p-4"
        >
          <CropIcon name={crop.name} category={crop.category} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-muted-foreground">{t.selectedCrop}</p>
            <p className="truncate text-xl font-bold tracking-tight text-foreground">{name}</p>
            {crop.category && (
              <p className="text-xs text-muted-foreground">{common.categories[crop.category] ?? crop.category}</p>
            )}
          </div>
          <SuitabilityGauge score={crop.score} size={64} strokeWidth={6} />
        </motion.div>
      </AnimatePresence>

      <Tabs defaultValue="radar" className="gap-3">
        <TabsList className="h-10 w-full">
          <TabsTrigger value="radar">
            <FlaskConical />
            N-P-K
          </TabsTrigger>
          <TabsTrigger value="ph">
            <TestTube2 />
            pH
          </TabsTrigger>
        </TabsList>
        <TabsContent value="radar">
          <NPKRadarChart soil={soil} breakdown={crop.breakdown} cropName={name} size={260} />
        </TabsContent>
        <TabsContent value="ph">
          <PHScaleGauge
            currentPh={soil.ph}
            targetMin={crop.cropRequirement?.phMin ?? 5.5}
            targetMax={crop.cropRequirement?.phMax ?? 7.0}
            cropName={name}
          />
        </TabsContent>
      </Tabs>

      <div className="surface space-y-3 p-4">
        <h4 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <CheckCircle2 className="size-4 text-success" />
          {t.summaryTitle}
        </h4>
        <p className="text-sm leading-relaxed text-muted-foreground">{t.summary(name, levelLabel, crop.score)}</p>
        {soil.notes && (
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{t.notes}:</span> {soil.notes}
          </p>
        )}
        {crop.improvements?.length > 0 && (
          <div className="flex items-start gap-2 rounded-xl bg-warning-soft p-3 text-sm">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
            <div>
              <p className="text-xs font-semibold text-warning">{t.urgentFix}</p>
              <p className="text-foreground/80">{crop.improvements[0]}</p>
            </div>
          </div>
        )}
      </div>
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
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
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

const RESULT_KEY = "plantResult"

// sessionStorage has no change events within the same tab; the value is written before navigating here
const subscribeToNothing = () => () => {}

function parseStoredResult(raw: string | null): AnalysisResult | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as AnalysisResult
  } catch (e) {
    console.error("Failed to parse analysis results", e)
    return null
  }
}

export default function ResultsPage() {
  const router = useRouter()
  const t = useT(recommendationMessages).results
  const common = useT(commonMessages)
  const fmt = useFormat()
  const { data: session } = authClient.useSession()
  const storedResult = useSyncExternalStore(
    subscribeToNothing,
    () => sessionStorage.getItem(RESULT_KEY),
    () => null
  )
  const result = useMemo(() => parseStoredResult(storedResult), [storedResult])
  const [pickedCrop, setSelectedCrop] = useState<RecommendedCrop | null>(null)
  // Default to the top-ranked crop until the user picks one
  const selectedCrop = pickedCrop ?? result?.rankings[0] ?? null
  const [categoryFilter, setCategoryFilter] = useState<string>("All")
  const [exporting, setExporting] = useState(false)
  const [fetchedSoilPlan, setSoilPlan] = useState<SoilImprovementPlan | null>(null)
  const soilPlan = fetchedSoilPlan ?? result?.soilImprovement ?? null
  const panelRef = useRef<HTMLDivElement>(null)
  const [viewedAt] = useState(() => Date.now())

  useEffect(() => {
    // Read storage directly: during hydration `result` is still the server snapshot (null)
    if (!parseStoredResult(sessionStorage.getItem(RESULT_KEY))) {
      router.push("/analyze")
    }
  }, [router])

  // Fetch or update soil improvement plan tailored to selected crop
  useEffect(() => {
    if (!result) return
    const cropId = selectedCrop?.cropId || selectedCrop?.plantId
    fetchSoilImprovement(result.soil, cropId)
      .then((plan) => setSoilPlan(plan))
      .catch((err) => console.error("Failed to fetch soil improvement plan", err))
  }, [result, selectedCrop])

  const handleExportPDF = async () => {
    if (!result) return
    setExporting(true)
    try {
      const { exportToPDF } = await import("@/lib/export-pdf")
      await exportToPDF(result, { locale: fmt.locale })
      toast.success(t.exportSuccess)
    } catch (error) {
      console.error("PDF export failed:", error)
      toast.error(t.exportError)
    } finally {
      setExporting(false)
    }
  }

  const handleSelectCrop = (crop: RecommendedCrop) => {
    setSelectedCrop(crop)
    // On small screens the panel sits above the list, so bring it into view
    if (window.matchMedia("(max-width: 1023px)").matches) {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  if (!result) return <ResultsSkeleton />

  const categories = [
    "All",
    ...Array.from(new Set(result.rankings.map((r) => r.category).filter(Boolean) as string[])),
  ]

  const filteredRankings = result.rankings
    .map((crop, index) => ({ crop, rank: index + 1 }))
    .filter(({ crop }) => categoryFilter === "All" || crop.category === categoryFilter)

  const topCrop = result.rankings[0]
  const selectedName = selectedCrop ? fmt.pick(selectedCrop.nameTh, selectedCrop.name) : undefined
  const decimalsOf = (n: number) => (Number.isInteger(n) ? 0 : 1)

  const sections: { id: SectionId; label: string; icon: LucideIcon }[] = [
    { id: "ranking", label: t.sections.ranking, icon: ListOrdered },
    { id: "soil-plan", label: t.sections.soilPlan, icon: Leaf },
    { id: "economics", label: t.sections.economics, icon: Coins },
    { id: "weather", label: t.sections.weather, icon: CloudSun },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
      <PageHeader
        eyebrow={
          <>
            <Calendar className="size-3.5" />
            {fmt.date(result.createdAt ?? viewedAt)}
          </>
        }
        title={t.title}
        description={
          <span className="flex flex-col gap-2.5">
            {topCrop && <span>{t.topPick(fmt.pick(topCrop.nameTh, topCrop.name), topCrop.score)}</span>}
            {session?.user ? (
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-xs font-semibold text-success">
                <CheckCircle2 className="size-3.5" />
                {t.savedAccount}
              </span>
            ) : (
              <span className="inline-flex w-fit flex-wrap items-center gap-1.5 rounded-full bg-warning-soft px-2.5 py-1 text-xs font-medium text-warning">
                {t.savedLocal}
                <span aria-hidden>·</span>
                <Link href="/login" className="font-semibold underline underline-offset-2">
                  {t.signInToSync}
                </Link>
              </span>
            )}
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

      {/* Measured soil values */}
      <section aria-label={t.soilValues}>
        <Stagger immediate className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(
            [
              ["nitrogen", "N", result.soil.nitrogen, common.units.mgPerKg],
              ["phosphorus", "P", result.soil.phosphorus, common.units.mgPerKg],
              ["potassium", "K", result.soil.potassium, common.units.mgPerKg],
              ["ph", "pH", result.soil.ph, undefined],
            ] as const
          ).map(([key, short, value, unit]) => (
            <StaggerItem key={key}>
              <StatCard
                label={`${short} · ${common.nutrients[key]}`}
                value={value}
                decimals={key === "ph" ? 1 : decimalsOf(value)}
                unit={unit}
              />
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <SectionNav items={sections} />

      {/* 1. Ranking */}
      <section id="ranking" className="scroll-mt-32 space-y-5">
        <SectionHeading icon={Sprout} title={t.rankingTitle} description={t.rankingDesc} />

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* Selected crop panel: above the list on mobile, sticky sidebar on desktop */}
          <aside ref={panelRef} className="scroll-mt-32 lg:sticky lg:top-36 lg:order-last">
            {selectedCrop && <SelectedCropPanel crop={selectedCrop} soil={result.soil} />}
          </aside>

          <div className="min-w-0 space-y-4">
            <LayoutGroup id="category-filter">
              <div
                role="radiogroup"
                aria-label={t.filterLabel}
                className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0"
              >
                {categories.map((cat) => {
                  const active = categoryFilter === cat
                  return (
                    <button
                      key={cat}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setCategoryFilter(cat)}
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
                        {cat === "All" ? t.allCount(result.rankings.length) : (common.categories[cat] ?? cat)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </LayoutGroup>

            {filteredRankings.length === 0 ? (
              <EmptyState
                icon={SearchX}
                title={t.noCropsInCategory}
                description={t.noCropsInCategoryDesc}
                action={
                  <Button variant="outline" onClick={() => setCategoryFilter("All")}>
                    {t.allCount(result.rankings.length)}
                  </Button>
                }
              />
            ) : (
              <motion.div layout className="space-y-3">
                <AnimatePresence mode="popLayout" initial={false}>
                  {filteredRankings.map(({ crop, rank }, i) => (
                    <motion.div
                      key={crop.plantId || crop.cropId || rank}
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT, delay: Math.min(i, 6) * 0.04 } }}
                      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.2 } }}
                    >
                      <CropRecommendationCard
                        crop={crop}
                        rank={rank}
                        isSelected={
                          (selectedCrop?.plantId || selectedCrop?.cropId) === (crop.plantId || crop.cropId)
                        }
                        onSelectForComparison={handleSelectCrop}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Soil improvement plan */}
      <section id="soil-plan" className="scroll-mt-32">
        <FadeIn>
          {soilPlan ? (
            <SoilImprovementSection plan={soilPlan} cropNameTh={selectedName} />
          ) : (
            <Skeleton className="h-72" />
          )}
        </FadeIn>
      </section>

      {/* 3. Economics */}
      <section id="economics" className="scroll-mt-32">
        <FadeIn>
          {selectedCrop && (
            <CropEconomicsCard
              cropId={selectedCrop.cropId || selectedCrop.plantId}
              cropNameTh={selectedName ?? selectedCrop.nameTh}
              soil={result.soil}
            />
          )}
        </FadeIn>
      </section>

      {/* 4. Weather */}
      <section id="weather" className="scroll-mt-32">
        <FadeIn>
          <WeatherWidget initialProvince={result.soil.province || "nakhon_ratchasima"} />
        </FadeIn>
      </section>
    </div>
  )
}
