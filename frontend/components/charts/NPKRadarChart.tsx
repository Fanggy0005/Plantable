"use client"

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { useT } from "@/lib/i18n"
import { commonMessages } from "@/lib/i18n/messages/common"
import { cn } from "@/lib/utils"
import { chartMessages } from "./messages"

interface NPKRadarChartProps {
  soil: {
    nitrogen: number
    phosphorus: number
    potassium: number
    ph: number
  }
  breakdown?: {
    nitrogen: number
    phosphorus: number
    potassium: number
    ph: number
  }
  cropName?: string
  /** Chart height in px */
  size?: number
  className?: string
}

interface AxisDatum {
  key: string
  label: string
  value: string
  soil: number
  score: number
  target: number
}

/** Radar of per-nutrient match scores (0–100) against the crop's 100% requirement. */
export function NPKRadarChart({ soil, breakdown, cropName, size = 280, className }: NPKRadarChartProps) {
  const t = useT(chartMessages).radar
  const common = useT(commonMessages)

  const axes: AxisDatum[] = (
    [
      ["nitrogen", "N", `${soil.nitrogen} ${common.units.mgPerKg}`],
      ["phosphorus", "P", `${soil.phosphorus} ${common.units.mgPerKg}`],
      ["potassium", "K", `${soil.potassium} ${common.units.mgPerKg}`],
      ["ph", "pH", `${soil.ph}`],
    ] as const
  ).map(([key, short, value]) => {
    const score = breakdown?.[key] ?? 100
    return {
      key: short,
      label: `${short} · ${common.nutrients[key]}`,
      value,
      score,
      // Keep a visible minimum so a 0 score still draws a shape
      soil: Math.max(15, Math.min(100, score)),
      target: 100,
    }
  })

  const config = {
    soil: { label: t.soil, color: "var(--chart-2)" },
    target: { label: t.target, color: "var(--chart-1)" },
  } satisfies ChartConfig

  return (
    <div className={cn("surface p-4 sm:p-5", className)}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold text-foreground">{t.title}</h4>
          <p className="mt-0.5 text-xs text-muted-foreground">{t.subtitle}</p>
        </div>
        {cropName && (
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-secondary-foreground">
            {t.vs(cropName)}
          </span>
        )}
      </div>

      <ChartContainer config={config} className="mx-auto aspect-auto w-full" style={{ height: size }}>
        <RadarChart data={axes} outerRadius="68%" margin={{ top: 16, right: 24, bottom: 16, left: 24 }}>
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => {
                  const d = payload?.[0]?.payload as AxisDatum | undefined
                  return d ? `${d.label} (${d.value})` : ""
                }}
                formatter={(_, name, item) => {
                  const d = item.payload as AxisDatum
                  const isSoil = name === "soil"
                  return (
                    <div className="flex w-full items-center justify-between gap-3">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <span
                          className="size-2 rounded-[2px]"
                          style={{ background: isSoil ? "var(--color-soil)" : "var(--color-target)" }}
                        />
                        {isSoil ? t.soil : t.target}
                      </span>
                      <span className="font-mono font-medium text-foreground tabular-nums">
                        {isSoil ? d.score : 100}%
                      </span>
                    </div>
                  )
                }}
              />
            }
          />
          <PolarGrid gridType="polygon" className="stroke-border" />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} tickCount={5} />
          <PolarAngleAxis
            dataKey="key"
            tick={({ x, y, textAnchor, index }) => {
              const d = axes[index]
              if (!d) return <g />
              return (
                <text x={x} y={y} textAnchor={textAnchor} dominantBaseline="central">
                  <tspan x={x} className="fill-foreground text-[12px] font-semibold">
                    {d.key}
                  </tspan>
                  <tspan x={x} dy="1.2em" className="fill-muted-foreground text-[10px]">
                    {d.score}%
                  </tspan>
                </text>
              )
            }}
          />
          <Radar
            dataKey="target"
            stroke="var(--color-target)"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            fill="var(--color-target)"
            fillOpacity={0.04}
            isAnimationActive={false}
          />
          <Radar
            dataKey="soil"
            stroke="var(--color-soil)"
            strokeWidth={2.5}
            fill="var(--color-soil)"
            fillOpacity={0.3}
            dot={{ r: 4, fillOpacity: 1, fill: "var(--card)", strokeWidth: 2 }}
            animationDuration={900}
            animationEasing="ease-out"
          />
        </RadarChart>
      </ChartContainer>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {axes.map((a) => (
          <div key={a.key} className="rounded-lg bg-muted/60 px-2.5 py-1.5">
            <p className="truncate text-[11px] text-muted-foreground">{a.label}</p>
            <p className="text-xs font-semibold text-foreground tabular-nums">{a.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-chart-2" />
          {t.soil}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm border border-dashed border-chart-1" />
          {t.target} (100%)
        </span>
      </div>
    </div>
  )
}
