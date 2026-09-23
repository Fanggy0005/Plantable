"use client"

import { useEffect, useState } from "react"
import {
  Banknote,
  Coins,
  Loader2,
  Minus,
  PiggyBank,
  Plus,
  Receipt,
  Scale,
  TrendingUp,
  Wheat,
} from "lucide-react"
import { Pie, PieChart } from "recharts"
import { FadeIn, Stagger, StaggerItem } from "@/components/motion"
import { ErrorState } from "@/components/shared/States"
import { StatCard } from "@/components/shared/StatCard"
import { Button } from "@/components/ui/button"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { calculateCropEconomics, fetchCropEconomics } from "@/lib/api"
import { useFormat, useT } from "@/lib/i18n"
import { commonMessages } from "@/lib/i18n/messages/common"
import { cn } from "@/lib/utils"
import type { CropEconomics, SoilInput } from "@/types"
import { economicsMessages } from "../messages"

interface CropEconomicsCardProps {
  cropId: string
  cropNameTh?: string
  soil?: SoilInput
  initialAreaRai?: number
}

const MIN_AREA = 0.5
const MAX_AREA = 500

const COST_COLORS: Record<string, string> = {
  fertilizer: "var(--chart-1)",
  land_prep_labor: "var(--chart-4)",
  seeds: "var(--chart-3)",
  protection: "var(--chart-2)",
  harvest_transport: "var(--chart-5)",
}

export function CropEconomicsCard({
  cropId,
  cropNameTh,
  soil,
  initialAreaRai = 1,
}: CropEconomicsCardProps) {
  const t = useT(economicsMessages)
  const common = useT(commonMessages)
  const f = useFormat()

  const [landArea, setLandArea] = useState<number>(initialAreaRai)
  const [areaInput, setAreaInput] = useState<string>(String(initialAreaRai))
  const [economics, setEconomics] = useState<CropEconomics | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadEconomics = async (area: number) => {
    try {
      setLoading(true)
      setError(null)
      const data = await calculateCropEconomics({
        cropId,
        landAreaRai: area,
        soil,
      })
      setEconomics(data)
    } catch {
      // Fallback to fetchCropEconomics without soil if calculate fails
      try {
        const fallback = await fetchCropEconomics(cropId, area)
        setEconomics(fallback)
      } catch (err) {
        setError(err instanceof Error && err.message ? err.message : t.error)
      }
    } finally {
      setLoading(false)
    }
  }

  // Debounced so typing "12" doesn't fire a request for "1" first
  useEffect(() => {
    const id = setTimeout(() => loadEconomics(landArea), 250)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropId, landArea])

  const handleAreaChange = (val: number) => {
    if (val >= MIN_AREA && val <= MAX_AREA) {
      setLandArea(val)
      setAreaInput(String(val))
    }
  }

  const money = (n: number) => f.currency(n)
  const price = (n: number) =>
    f.number(n, { style: "currency", currency: "THB", maximumFractionDigits: 2 })
  const costLabel = (category: string, categoryTh: string) =>
    f.locale === "th" ? categoryTh || t.costCategories[category] : t.costCategories[category] ?? categoryTh

  const chartConfig: ChartConfig = Object.fromEntries(
    (economics?.costBreakdown ?? []).map((item) => [
      item.category,
      { label: costLabel(item.category, item.categoryTh), color: COST_COLORS[item.category] ?? "var(--muted-foreground)" },
    ])
  )
  const chartData = (economics?.costBreakdown ?? []).map((item) => ({
    category: item.category,
    amount: item.amountThb,
    fill: `var(--color-${item.category})`,
  }))

  const profitable = (economics?.marketPricePerKg ?? 0) >= (economics?.breakEvenPricePerKg ?? 0)

  return (
    <section className="surface overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border bg-muted/40 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-warning-soft text-warning">
            <Coins className="size-5" />
          </span>
          <div className="space-y-0.5">
            <h3 className="text-lg font-bold tracking-tight text-foreground">
              {cropNameTh ? t.titleFor(cropNameTh) : t.title}
            </h3>
            <p className="text-sm text-muted-foreground">{t.description}</p>
          </div>
        </div>

        {/* Area stepper */}
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <label htmlFor={`area-${cropId}`} className="text-sm font-medium text-muted-foreground">
            {t.area}
          </label>
          <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-xs">
            <Button
              variant="ghost"
              size="icon"
              aria-label={t.decrease}
              className="size-9 rounded-full"
              disabled={landArea <= MIN_AREA}
              onClick={() => handleAreaChange(Math.max(MIN_AREA, landArea - 1))}
            >
              <Minus />
            </Button>
            <input
              id={`area-${cropId}`}
              type="number"
              inputMode="decimal"
              min={MIN_AREA}
              max={MAX_AREA}
              step="0.5"
              value={areaInput}
              onChange={(e) => {
                setAreaInput(e.target.value)
                const v = parseFloat(e.target.value)
                if (!isNaN(v) && v >= MIN_AREA && v <= MAX_AREA) setLandArea(v)
              }}
              onBlur={() => setAreaInput(String(landArea))}
              className="w-14 bg-transparent text-center text-base font-bold text-foreground tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <Button
              variant="ghost"
              size="icon"
              aria-label={t.increase}
              className="size-9 rounded-full"
              disabled={landArea >= MAX_AREA}
              onClick={() => handleAreaChange(Math.min(MAX_AREA, landArea + 1))}
            >
              <Plus />
            </Button>
            <span className="pr-3 pl-1 text-sm text-muted-foreground">{common.units.rai}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="relative p-5 sm:p-6">
        {loading && economics && (
          <div className="absolute top-3 right-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            {t.updating}
          </div>
        )}

        {loading && !economics ? (
          <EconomicsSkeleton />
        ) : error && !economics ? (
          <ErrorState title={t.error} description={error} onRetry={() => loadEconomics(landArea)} />
        ) : economics ? (
          <div className={cn("space-y-6 transition-opacity", loading && "opacity-60")}>
            {/* KPIs */}
            <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StaggerItem>
                <StatCard
                  label={t.kpi.revenue}
                  value={economics.totalProjectedRevenue}
                  format={money}
                  icon={Banknote}
                  hint={t.kpi.perRai(money(economics.grossRevenuePerRai))}
                  className="h-full"
                />
              </StaggerItem>
              <StaggerItem>
                <StatCard
                  label={t.kpi.cost}
                  value={economics.totalProjectedCost}
                  format={money}
                  icon={Receipt}
                  hint={t.kpi.perRai(money(economics.totalCostPerRai))}
                  className="h-full"
                />
              </StaggerItem>
              <StaggerItem>
                <StatCard
                  label={t.kpi.profit}
                  value={economics.totalProjectedProfit}
                  format={money}
                  icon={PiggyBank}
                  hint={t.kpi.perRai(money(economics.netProfitPerRai))}
                  className={cn("h-full", economics.totalProjectedProfit < 0 && "[&_p:nth-of-type(1)]:text-destructive")}
                />
              </StaggerItem>
              <StaggerItem>
                <StatCard
                  label={t.kpi.roi}
                  value={economics.roiPercentage}
                  decimals={Number.isInteger(economics.roiPercentage) ? 0 : 1}
                  format={(n) => `${n > 0 ? "+" : ""}${f.number(n)}%`}
                  icon={TrendingUp}
                  className={cn(
                    "h-full",
                    economics.roiPercentage >= 20
                      ? "[&_p:nth-of-type(1)]:text-success"
                      : economics.roiPercentage < 0 && "[&_p:nth-of-type(1)]:text-destructive"
                  )}
                />
              </StaggerItem>
            </Stagger>

            {/* Quick facts */}
            <FadeIn className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {[
                {
                  icon: Wheat,
                  label: t.facts.yield,
                  value: `${f.number(economics.expectedYieldPerRai)} ${common.units.kgPerRai}`,
                },
                {
                  icon: Banknote,
                  label: t.facts.price,
                  value: `${price(economics.marketPricePerKg)} / ${f.locale === "th" ? "กก." : "kg"}`,
                },
                {
                  icon: Receipt,
                  label: t.facts.fertilizer,
                  value: `${money(economics.fertilizerCostPerRai)} / ${common.units.rai}`,
                },
              ].map((fact) => (
                <div key={fact.label} className="flex items-center gap-3 rounded-xl bg-muted/70 px-4 py-3">
                  <fact.icon className="size-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{fact.label}</p>
                    <p className="truncate text-sm font-bold text-foreground">{fact.value}</p>
                  </div>
                </div>
              ))}
            </FadeIn>

            {/* Cost breakdown */}
            {economics.costBreakdown.length > 0 && (
              <FadeIn className="grid grid-cols-1 items-center gap-6 rounded-2xl border border-border p-4 sm:p-5 md:grid-cols-[220px_minmax(0,1fr)]">
                <div className="relative mx-auto size-[200px] sm:size-[220px]">
                  <ChartContainer config={chartConfig} className="aspect-square size-full">
                    <PieChart>
                      <ChartTooltip
                        cursor={false}
                        content={
                          <ChartTooltipContent
                            hideLabel
                            nameKey="category"
                            formatter={(value, _name, item) => (
                              <div className="flex w-full items-center justify-between gap-3">
                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                  <span
                                    className="size-2.5 rounded-[3px]"
                                    style={{ background: item.payload?.fill }}
                                  />
                                  {chartConfig[item.payload?.category]?.label}
                                </span>
                                <span className="font-semibold text-foreground tabular-nums">
                                  {money(Number(value))}
                                </span>
                              </div>
                            )}
                          />
                        }
                      />
                      <Pie
                        data={chartData}
                        dataKey="amount"
                        nameKey="category"
                        innerRadius="62%"
                        outerRadius="100%"
                        paddingAngle={2}
                        cornerRadius={6}
                        strokeWidth={0}
                        animationDuration={900}
                      />
                    </PieChart>
                  </ChartContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs text-muted-foreground">{t.breakdown.total}</span>
                    <span className="text-lg font-bold text-foreground tabular-nums">
                      {money(economics.totalCostPerRai)}
                    </span>
                    <span className="text-[11px] text-muted-foreground">/ {common.units.rai}</span>
                  </div>
                </div>

                <div className="min-w-0 space-y-3">
                  <p className="text-sm font-bold text-foreground">{t.breakdown.title}</p>
                  <ul className="space-y-2.5">
                    {economics.costBreakdown.map((item) => (
                      <li key={item.category} className="space-y-1">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                            <span
                              className="size-2.5 shrink-0 rounded-[3px]"
                              style={{ background: COST_COLORS[item.category] ?? "var(--muted-foreground)" }}
                            />
                            <span className="truncate">{costLabel(item.category, item.categoryTh)}</span>
                          </span>
                          <span className="shrink-0 font-semibold text-foreground tabular-nums">
                            {money(item.amountThb)}
                            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                              {item.percentage}%
                            </span>
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full transition-[width] duration-700 ease-out"
                            style={{
                              width: `${Math.min(100, item.percentage)}%`,
                              background: COST_COLORS[item.category] ?? "var(--muted-foreground)",
                            }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            )}

            {/* Break-even callout */}
            <FadeIn
              className={cn(
                "flex items-start gap-3 rounded-2xl border p-4",
                profitable ? "border-success/20 bg-success-soft" : "border-warning/25 bg-warning-soft"
              )}
            >
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg bg-card",
                  profitable ? "text-success" : "text-warning"
                )}
              >
                <Scale className="size-4.5" />
              </span>
              <div className="min-w-0 space-y-0.5">
                <p className="flex flex-wrap items-baseline gap-x-2 text-sm font-bold text-foreground">
                  {t.breakEven.title}
                  <span className={cn("text-lg", profitable ? "text-success" : "text-warning")}>
                    {price(economics.breakEvenPricePerKg)}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    · {profitable ? t.breakEven.safe : t.breakEven.risk}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {t.breakEven.body(price(economics.breakEvenPricePerKg), price(economics.marketPricePerKg))}
                </p>
              </div>
            </FadeIn>
          </div>
        ) : null}
      </div>
    </section>
  )
}

function EconomicsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
        <Skeleton className="mx-auto size-[200px] rounded-full" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-6 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
