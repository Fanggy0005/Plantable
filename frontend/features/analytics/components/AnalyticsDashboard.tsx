"use client"

import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { Bar, BarChart, CartesianGrid, Cell, Label, LabelList, Pie, PieChart, XAxis, YAxis } from "recharts"
import {
  Activity,
  Award,
  BarChart3,
  Clock,
  FlaskConical,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Sprout,
  TestTubes,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { PageHeader } from "@/components/shared/PageHeader"
import { ErrorState } from "@/components/shared/States"
import { StatCard } from "@/components/shared/StatCard"
import { CountUp, EASE_OUT, FadeIn, Stagger, StaggerItem } from "@/components/motion"
import { fetchAnalyticsDashboard } from "@/lib/api"
import { useFormat, useT } from "@/lib/i18n"
import { commonMessages } from "@/lib/i18n/messages/common"
import { scoreTone, TONE_BADGE } from "@/lib/score"
import { cn } from "@/lib/utils"
import { analyticsMessages } from "../messages"
import type { AnalyticsDashboardData } from "@/types"

const PH_COLORS: Record<string, string> = {
  strongly_acidic: "var(--destructive)",
  moderately_acidic: "var(--chart-3)",
  optimal: "var(--chart-2)",
  alkaline: "var(--chart-4)",
}

/** General target ranges (mg/kg) used for the averages comparison */
const TARGETS = {
  nitrogen: [100, 160],
  phosphorus: [30, 60],
  potassium: [60, 120],
} as const

export function AnalyticsDashboard() {
  const t = useT(analyticsMessages)
  const [data, setData] = useState<AnalyticsDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    fetchAnalyticsDashboard()
      .then((res) => {
        if (cancelled) return
        setData(res)
        setError(null)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const reload = () => {
    setLoading(true)
    setReloadKey((k) => k + 1)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t.eyebrow}
        icon={BarChart3}
        title={t.title}
        description={t.description}
        actions={
          <Button variant="outline" className="h-10" onClick={reload} disabled={loading}>
            <RefreshCw className={cn(loading && "animate-spin")} />
            {t.refresh}
          </Button>
        }
      />

      {loading && !data ? (
        <DashboardSkeleton />
      ) : error || !data ? (
        <ErrorState title={t.loadError} description={error?.message || undefined} onRetry={reload} />
      ) : (
        <DashboardContent data={data} />
      )}
    </div>
  )
}

function DashboardContent({ data }: { data: AnalyticsDashboardData }) {
  const t = useT(analyticsMessages)
  const f = useFormat()

  const kpis = data.kpis || {
    totalAnalyses: data.totalAnalyses,
    totalCrops: data.totalCrops,
    totalUsers: data.totalUsers,
  }
  const timeline = data.recentActivityTimeline || data.recentAnalysesTimeline || []

  return (
    <div className="space-y-5">
      <Stagger immediate className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StaggerItem>
          <StatCard label={t.kpi.analyses} value={kpis.totalAnalyses} icon={TestTubes} hint={t.kpi.analysesHint} format={(n) => f.number(n)} />
        </StaggerItem>
        <StaggerItem>
          <StatCard label={t.kpi.crops} value={kpis.totalCrops} icon={Sprout} hint={t.kpi.cropsHint} />
        </StaggerItem>
        <StaggerItem>
          <StatCard label={t.kpi.users} value={kpis.totalUsers} icon={Users} hint={t.kpi.usersHint} format={(n) => f.number(n)} />
        </StaggerItem>
      </Stagger>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SoilHealthCard data={data} />
        <PhDistributionCard data={data} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <AveragesCard data={data} className="lg:col-span-3" />
        <RegionsCard data={data} className="lg:col-span-2" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <PopularityCard data={data} className="lg:col-span-3" />
        <TimelineCard timeline={timeline} className="lg:col-span-2" />
      </div>
    </div>
  )
}

/* ---------- Building blocks ---------- */

function Panel({
  icon: Icon,
  title,
  description,
  className,
  children,
}: {
  icon: typeof Activity
  title: string
  description?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <FadeIn className={cn("surface flex flex-col p-5 sm:p-6", className)}>
      <div className="mb-5 flex items-start gap-3">
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
          <Icon className="size-4.5" />
        </span>
        <div>
          <h2 className="text-base font-bold text-foreground">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      <div className="flex-1">{children}</div>
    </FadeIn>
  )
}

function SoilHealthCard({ data }: { data: AnalyticsDashboardData }) {
  const t = useT(analyticsMessages).health
  const d = data.soilHealthDistribution
  const segments = [
    { key: "optimal", label: t.optimal, value: d.optimalPercentage, color: "var(--chart-2)" },
    { key: "deficient", label: t.deficient, value: d.deficientPercentage, color: "var(--chart-3)" },
    { key: "excess", label: t.excess, value: d.excessPercentage, color: "var(--chart-5)" },
  ]

  return (
    <Panel icon={ShieldCheck} title={t.title} description={t.description}>
      <div className="flex h-5 w-full overflow-hidden rounded-full bg-muted">
        {segments.map((s, i) => (
          <motion.div
            key={s.key}
            className="h-full first:rounded-l-full last:rounded-r-full"
            style={{ backgroundColor: s.color }}
            initial={{ width: 0 }}
            whileInView={{ width: `${s.value}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.15 + i * 0.12 }}
            title={`${s.label}: ${s.value}%`}
          />
        ))}
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
        {segments.map((s) => (
          <div key={s.key} className="rounded-xl bg-muted/60 p-3">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="truncate text-xs font-medium text-muted-foreground">{s.label}</span>
            </div>
            <p className="mt-1 text-xl font-bold text-foreground sm:text-2xl">
              <CountUp value={s.value} decimals={s.value % 1 ? 1 : 0} />%
            </p>
          </div>
        ))}
      </div>
    </Panel>
  )
}

function PhDistributionCard({ data }: { data: AnalyticsDashboardData }) {
  const t = useT(analyticsMessages).ph
  const f = useFormat()
  const rows = data.phCategoryDistribution.map((p) => ({
    ...p,
    label: t.categories[p.category] ?? p.labelTh,
    fill: PH_COLORS[p.category] ?? "var(--chart-1)",
  }))
  const total = rows.reduce((sum, r) => sum + r.count, 0)
  const config = Object.fromEntries(
    rows.map((r) => [r.category, { label: r.label, color: r.fill }])
  ) satisfies ChartConfig

  return (
    <Panel icon={FlaskConical} title={t.title} description={t.description}>
      <div className="flex flex-col items-center gap-5 sm:flex-row">
        <ChartContainer config={config} className="aspect-square h-52 w-52 shrink-0" initialDimension={{ width: 208, height: 208 }}>
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="category" />} />
            <Pie data={rows} dataKey="count" nameKey="category" innerRadius={62} outerRadius={96} paddingAngle={2} strokeWidth={0} cornerRadius={4}>
              {rows.map((r) => (
                <Cell key={r.category} fill={r.fill} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (!viewBox || !("cx" in viewBox)) return null
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                      <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) - 6} className="fill-foreground text-2xl font-bold">
                        {f.number(total)}
                      </tspan>
                      <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 16} className="fill-muted-foreground text-xs">
                        {t.total}
                      </tspan>
                    </text>
                  )
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <ul className="w-full flex-1 space-y-2">
          {rows.map((r) => (
            <li key={r.category} className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-muted/60">
              <span className="flex min-w-0 items-center gap-2">
                <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: r.fill }} />
                <span className="truncate text-muted-foreground">{r.label}</span>
              </span>
              <span className="shrink-0 font-semibold tabular-nums text-foreground">
                {r.percentage}%
                <span className="ml-1 text-xs font-normal text-muted-foreground">({f.number(r.count)})</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  )
}

function AveragesCard({ data, className }: { data: AnalyticsDashboardData; className?: string }) {
  const t = useT(analyticsMessages).averages
  const common = useT(commonMessages)
  const avg = data.averageSoilMetrics

  const rows = (["nitrogen", "phosphorus", "potassium"] as const).map((k) => ({
    nutrient: common.nutrients[k],
    average: avg[k],
    target: (TARGETS[k][0] + TARGETS[k][1]) / 2,
    range: `${TARGETS[k][0]}–${TARGETS[k][1]}`,
  }))

  const config = {
    average: { label: t.average, color: "var(--chart-1)" },
    target: { label: t.target, color: "var(--chart-2)" },
  } satisfies ChartConfig

  const phPct = Math.min(100, (avg.ph / 14) * 100)

  return (
    <Panel icon={Activity} title={t.title} description={t.description} className={className}>
      <ChartContainer config={config} className="aspect-auto h-60 w-full">
        <BarChart data={rows} margin={{ top: 20, right: 4, left: -16, bottom: 0 }} barGap={4}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="nutrient" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis tickLine={false} axisLine={false} width={48} />
          <ChartTooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltipContent />} />
          <Bar dataKey="average" fill="var(--color-average)" radius={[6, 6, 0, 0]} maxBarSize={44}>
            <LabelList dataKey="average" position="top" className="fill-foreground text-xs font-semibold" />
          </Bar>
          <Bar dataKey="target" fill="var(--color-target)" fillOpacity={0.45} radius={[6, 6, 0, 0]} maxBarSize={44} />
        </BarChart>
      </ChartContainer>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-chart-1" />
          {t.average}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-chart-2/45" />
          {t.target}
        </span>
      </div>

      <div className="mt-5 rounded-xl bg-muted/60 p-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm font-medium text-muted-foreground">{t.phAverage}</span>
          <span className="text-2xl font-bold text-foreground">
            <CountUp value={avg.ph} decimals={1} />
          </span>
        </div>
        <div className="relative mt-3 h-2.5 rounded-full bg-[linear-gradient(90deg,var(--destructive),var(--chart-3),var(--chart-2),var(--chart-4))] opacity-90">
          <div
            className="absolute inset-y-0 rounded-full ring-2 ring-card"
            style={{ left: `${(6 / 14) * 100}%`, width: `${(1 / 14) * 100}%` }}
          />
          <motion.div
            className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-foreground shadow"
            initial={{ left: "0%" }}
            whileInView={{ left: `${phPct}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: EASE_OUT, delay: 0.2 }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
          <span>0</span>
          <span>{t.phTarget}</span>
          <span>14</span>
        </div>
      </div>
    </Panel>
  )
}

function RegionsCard({ data, className }: { data: AnalyticsDashboardData; className?: string }) {
  const t = useT(analyticsMessages).regions
  const f = useFormat()
  const rows = [...data.regionalActivity]
    .sort((a, b) => b.count - a.count)
    .map((r) => ({ ...r, label: f.pick(r.regionTh, r.region) }))
  const config = { count: { label: t.count, color: "var(--chart-1)" } } satisfies ChartConfig

  return (
    <Panel icon={MapPin} title={t.title} description={t.description} className={className}>
      <ChartContainer config={config} className="aspect-auto w-full" style={{ height: Math.max(180, rows.length * 44) }}>
        <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 36, left: 0, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="label" tickLine={false} axisLine={false} width={96} tick={{ fontSize: 12 }} />
          <ChartTooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltipContent hideLabel nameKey="count" />} />
          <Bar dataKey="count" fill="var(--color-count)" radius={6} maxBarSize={26} background={{ fill: "var(--muted)", radius: 6 }}>
            <LabelList dataKey="count" position="right" className="fill-foreground text-xs font-semibold" />
          </Bar>
        </BarChart>
      </ChartContainer>
    </Panel>
  )
}

function PopularityCard({ data, className }: { data: AnalyticsDashboardData; className?: string }) {
  const t = useT(analyticsMessages).popularity
  const f = useFormat()
  const rows = data.cropPopularityRanking.slice(0, 8).map((c, i) => ({
    ...c,
    label: f.pick(c.nameTh, c.name),
    fill: i === 0 ? "var(--chart-1)" : i < 3 ? "var(--chart-2)" : "color-mix(in oklch, var(--chart-2) 45%, transparent)",
  }))
  const config = { count: { label: t.count, color: "var(--chart-1)" } } satisfies ChartConfig

  return (
    <Panel icon={Award} title={t.title} description={t.description} className={className}>
      {rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">—</p>
      ) : (
        <>
          <ChartContainer config={config} className="aspect-auto w-full" style={{ height: Math.max(200, rows.length * 40) }}>
            <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 40, left: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="label" tickLine={false} axisLine={false} width={92} tick={{ fontSize: 12 }} />
              <ChartTooltip
                cursor={{ fill: "var(--muted)" }}
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value, _name, item) => (
                      <div className="flex w-full items-center justify-between gap-4">
                        <span className="font-semibold text-foreground">{item.payload.label}</span>
                        <span className="tabular-nums text-muted-foreground">
                          {t.times(Number(value))} · {t.avgScore(item.payload.averageScore)}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <Bar dataKey="count" radius={6} maxBarSize={24}>
                {rows.map((r) => (
                  <Cell key={r.cropId} fill={r.fill} />
                ))}
                <LabelList dataKey="count" position="right" className="fill-foreground text-xs font-semibold" />
              </Bar>
            </BarChart>
          </ChartContainer>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {rows.slice(0, 3).map((r, i) => (
              <span
                key={r.cropId}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold",
                  TONE_BADGE[scoreTone(r.averageScore)]
                )}
              >
                #{i + 1} {r.label} · {t.avgScore(r.averageScore)}
              </span>
            ))}
          </div>
        </>
      )}
    </Panel>
  )
}

function TimelineCard({
  timeline,
  className,
}: {
  timeline: AnalyticsDashboardData["recentActivityTimeline"]
  className?: string
}) {
  const t = useT(analyticsMessages).timeline
  const common = useT(commonMessages)
  const f = useFormat()

  return (
    <Panel icon={Clock} title={t.title} description={t.description} className={className}>
      {timeline.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">{t.empty}</p>
      ) : (
        <Stagger className="relative space-y-1">
          <span className="absolute top-3 bottom-3 left-1.75 w-px bg-border" aria-hidden />
          {timeline.slice(0, 6).map((item, i) => {
            const tone = scoreTone(item.suitabilityScore)
            return (
              <StaggerItem key={item.id} className="relative flex items-start gap-3 rounded-xl py-2 pr-2">
                <span className="relative mt-1.5 flex size-3.75 shrink-0 items-center justify-center">
                  {i === 0 && <span className="absolute inset-0 animate-ping rounded-full bg-success/40" />}
                  <span className="relative size-2.5 rounded-full bg-primary ring-4 ring-card" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">{item.cropNameTh}</p>
                    <span
                      className={cn(
                        "shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold tabular-nums",
                        TONE_BADGE[tone]
                      )}
                    >
                      {t.match(item.suitabilityScore)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {f.relative(item.createdAt)}
                    {item.recommendationLevel && ` · ${common.levels[item.recommendationLevel] ?? item.recommendationLevel}`}
                  </p>
                </div>
              </StaggerItem>
            )
          })}
        </Stagger>
      )}
    </Panel>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="surface space-y-3 p-5">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="size-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-3 w-36 rounded-md" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <Skeleton className="h-96 lg:col-span-3" />
        <Skeleton className="h-96 lg:col-span-2" />
      </div>
    </div>
  )
}
