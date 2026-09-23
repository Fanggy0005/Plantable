"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { ArrowRight, BookOpen, Search, SearchX, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState, ErrorState } from "@/components/shared/States"
import { CropIcon } from "@/components/shared/CropIcon"
import { Stagger, StaggerItem } from "@/components/motion"
import { fetchCrops } from "@/lib/api"
import { useFormat, useT } from "@/lib/i18n"
import { commonMessages } from "@/lib/i18n/messages/common"
import { cropCatalogMessages } from "@/features/crop/catalog-messages"
import { cn } from "@/lib/utils"
import type { Crop } from "@/types"

const CATEGORIES = ["All", "Grain", "Cash Crop", "Fruit", "Vegetable"]

export default function CropsCatalogPage() {
  const t = useT(cropCatalogMessages).list
  const common = useT(commonMessages)

  const [crops, setCrops] = useState<Crop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")
  const [reloadKey, setReloadKey] = useState(0)
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function loadCrops() {
      setLoading(true)
      setError(false)
      try {
        const data = await fetchCrops({
          search: search || undefined,
          category: category !== "All" ? category : undefined,
        })
        if (!cancelled) setCrops(data)
      } catch (err) {
        console.error("Failed to fetch crops", err)
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) {
          setLoading(false)
          setHasLoaded(true)
        }
      }
    }

    const timeout = setTimeout(loadCrops, 250)
    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [search, category, reloadKey])

  const clearFilters = () => {
    setSearch("")
    setCategory("All")
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
      <PageHeader
        eyebrow={t.eyebrow}
        icon={BookOpen}
        title={t.title}
        description={t.description}
      />

      {/* Search & category filter */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            aria-label={t.searchLabel}
            className="h-11 rounded-xl border-border bg-card pr-10 pl-10 shadow-(--shadow-card)"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label={common.actions.close}
              className="absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div
          role="radiogroup"
          aria-label={t.filterLabel}
          className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 lg:pb-0"
        >
          <div className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-card p-1 shadow-(--shadow-card)">
            {CATEGORIES.map((cat) => {
              const active = category === cat
              return (
                <button
                  key={cat}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "relative h-9 shrink-0 rounded-full px-4 text-sm font-medium whitespace-nowrap transition-colors",
                    active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="crop-category-pill"
                      className="absolute inset-0 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 480, damping: 36 }}
                    />
                  )}
                  <span className="relative">{common.categories[cat] ?? cat}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Results */}
      {!hasLoaded ? (
        <CropGridSkeleton />
      ) : error ? (
        <ErrorState title={t.loadError} onRetry={() => setReloadKey((k) => k + 1)} />
      ) : crops.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={t.emptyTitle}
          description={t.emptyDescription}
          action={
            <Button variant="outline" onClick={clearFilters}>
              {t.clearFilters}
            </Button>
          }
        />
      ) : (
        <div className={cn("space-y-4 transition-opacity duration-200", loading && "opacity-60")} aria-busy={loading}>
          <p className="text-sm text-muted-foreground">{t.resultCount(crops.length)}</p>
          <Stagger
            immediate
            key={crops.map((c) => c.id).join(",")}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5"
          >
            {crops.map((crop) => (
              <StaggerItem key={crop.id} className="h-full">
                <CropCard crop={crop} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      )}
    </div>
  )
}

function CropCard({ crop }: { crop: Crop }) {
  const t = useT(cropCatalogMessages).list
  const common = useT(commonMessages)
  const { pick, locale } = useFormat()
  const req = crop.requirement
  const secondaryName = locale === "th" ? crop.name : crop.nameTh

  const chips = req
    ? [
        { key: "N", label: common.nutrients.nitrogen, optimal: req.nitrogenOptimal, min: req.nitrogenMin, max: req.nitrogenMax },
        { key: "P", label: common.nutrients.phosphorus, optimal: req.phosphorusOptimal, min: req.phosphorusMin, max: req.phosphorusMax },
        { key: "K", label: common.nutrients.potassium, optimal: req.potassiumOptimal, min: req.potassiumMin, max: req.potassiumMax },
        { key: "pH", label: common.nutrients.ph, optimal: req.phOptimal, min: req.phMin, max: req.phMax },
      ]
    : []

  return (
    <Link
      href={`/crops/${crop.id}`}
      className="surface-interactive group flex h-full flex-col p-5 outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
    >
      <div className="flex items-start gap-3.5">
        <CropIcon name={crop.name} category={crop.category} size="lg" className="transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
              {pick(crop.nameTh, crop.name)}
            </h3>
            <Badge variant="secondary" className="shrink-0">
              {common.categories[crop.category] ?? crop.category}
            </Badge>
          </div>
          <p className="truncate text-sm text-muted-foreground">
            {secondaryName}
            {crop.scientificName && (
              <span className="italic"> · {crop.scientificName}</span>
            )}
          </p>
        </div>
      </div>

      {crop.description && (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{crop.description}</p>
      )}

      {chips.length > 0 && (
        <div className="mt-4 grid grid-cols-4 gap-1.5 border-t border-border pt-4">
          {chips.map((c) => (
            <div key={c.key} title={`${c.label}: ${c.min}–${c.max}`} className="rounded-lg bg-muted px-2 py-1.5 text-center">
              <span className="block text-[11px] font-semibold text-muted-foreground">{c.key}</span>
              <span className="block text-sm font-bold tabular-nums text-foreground">{c.optimal}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between pt-4 text-sm font-semibold text-primary">
        <span className="text-xs font-medium text-muted-foreground">
          {t.optimal} · {common.units.mgPerKg}
        </span>
        <span className="inline-flex items-center gap-1">
          {t.viewGuide}
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  )
}

function CropGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="surface space-y-4 p-5">
          <div className="flex items-start gap-3.5">
            <Skeleton className="size-14 rounded-2xl" />
            <div className="flex-1 space-y-2 pt-1">
              <Skeleton className="h-5 w-2/3 rounded-md" />
              <Skeleton className="h-4 w-1/2 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-4/5 rounded-md" />
          <div className="grid grid-cols-4 gap-1.5 pt-2">
            {Array.from({ length: 4 }).map((__, j) => (
              <Skeleton key={j} className="h-12 rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
