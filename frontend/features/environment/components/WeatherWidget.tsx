"use client"

import { useState, useEffect } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  CloudRain,
  CloudSun,
  Droplets,
  MapPin,
  RefreshCw,
  Sun,
  Thermometer,
  Wind,
  type LucideIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { CountUp, Stagger, StaggerItem } from "@/components/motion"
import { ErrorState } from "@/components/shared/States"
import { useFormat, useT } from "@/lib/i18n"
import { commonMessages } from "@/lib/i18n/messages/common"
import { cn } from "@/lib/utils"
import type { WeatherData } from "@/types"
import { fetchWeather } from "@/lib/api"
import { weatherMessages } from "../weather-messages"

interface WeatherWidgetProps {
  initialProvince?: string
  onLocationChange?: (province: string, region: string) => void
}

const PROVINCE_KEYS = [
  "nakhon_ratchasima",
  "khon_kaen",
  "chiang_mai",
  "nan",
  "suphan_buri",
  "ayutthaya",
  "rayong",
  "chanthaburi",
  "surat_thani",
  "kanchanaburi",
]

const SEASON_STYLE: Record<string, { icon: LucideIcon; variant: "info" | "secondary" | "warning" }> = {
  rainy: { icon: CloudRain, variant: "info" },
  winter: { icon: Wind, variant: "secondary" },
  summer: { icon: Sun, variant: "warning" },
}

const ALERT_STYLE = {
  high: { box: "bg-danger-soft border-destructive/20", text: "text-destructive", badge: "destructive" },
  medium: { box: "bg-warning-soft border-warning/25", text: "text-warning", badge: "warning" },
  low: { box: "bg-success-soft border-success/20", text: "text-success", badge: "success" },
} as const

function MetricTile({
  icon: Icon,
  label,
  value,
  decimals = 0,
  unit,
  tone,
}: {
  icon: LucideIcon
  label: string
  value: number
  decimals?: number
  unit: string
  tone: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", tone)}>
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[11px] text-muted-foreground">{label}</p>
        <p className="text-lg leading-tight font-bold text-foreground">
          <CountUp value={value} decimals={decimals} />
          <span className="ml-0.5 text-xs font-medium text-muted-foreground">{unit}</span>
        </p>
      </div>
    </div>
  )
}

export function WeatherWidget({ initialProvince = "nakhon_ratchasima", onLocationChange }: WeatherWidgetProps) {
  const t = useT(weatherMessages)
  const common = useT(commonMessages)
  const fmt = useFormat()
  const [selectedProvince, setSelectedProvince] = useState(initialProvince)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadWeather = async (provKey: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchWeather(provKey)
      setWeather(data)
      if (onLocationChange) {
        onLocationChange(data.province, data.region)
      }
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : t.loadError)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWeather(selectedProvince)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProvince])

  const provinceKeys = PROVINCE_KEYS.includes(selectedProvince)
    ? PROVINCE_KEYS
    : [selectedProvince, ...PROVINCE_KEYS]
  const provinceItems = provinceKeys.map((key) => ({ value: key, label: t.provinces[key] ?? key }))

  const season = weather ? (SEASON_STYLE[weather.season] ?? SEASON_STYLE.summer) : null
  const SeasonIcon = season?.icon

  return (
    <div className="surface overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-info-soft text-info">
            <CloudSun className="size-5" />
          </span>
          <div>
            <h3 className="text-base font-bold text-foreground">{t.title}</h3>
            <p className="text-xs text-muted-foreground">{t.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select
            items={provinceItems}
            value={selectedProvince}
            onValueChange={(v) => v && setSelectedProvince(v as string)}
          >
            <SelectTrigger aria-label={t.province} className="h-10 min-w-0 flex-1 border-border bg-card sm:w-52 sm:flex-none">
              <MapPin className="text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {provinceItems.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className="size-10"
                  aria-label={t.refresh}
                  onClick={() => loadWeather(selectedProvince)}
                />
              }
            >
              <RefreshCw className={cn(loading && "animate-spin")} />
            </TooltipTrigger>
            <TooltipContent>{t.refresh}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {loading && !weather ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-12 rounded-xl" />
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 flex-1 rounded-xl" />
              ))}
            </div>
          </div>
        ) : error && !weather ? (
          <ErrorState title={t.loadError} description={error} onRetry={() => loadWeather(selectedProvince)} />
        ) : weather ? (
          <div className={cn("space-y-5 transition-opacity", loading && "opacity-60")}>
            <Stagger immediate className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StaggerItem>
                <MetricTile icon={Thermometer} label={t.temperature} value={weather.temperature} decimals={1} unit="°C" tone="bg-danger-soft text-chart-5" />
              </StaggerItem>
              <StaggerItem>
                <MetricTile icon={Droplets} label={t.humidity} value={weather.humidity} unit="%" tone="bg-info-soft text-info" />
              </StaggerItem>
              <StaggerItem>
                <MetricTile icon={CloudRain} label={t.rainfall} value={weather.precipitation} decimals={1} unit={t.mm} tone="bg-secondary text-primary" />
              </StaggerItem>
              <StaggerItem>
                <MetricTile icon={Wind} label={t.wind} value={weather.windSpeed} decimals={1} unit={t.kmh} tone="bg-muted text-muted-foreground" />
              </StaggerItem>
            </Stagger>

            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted/60 px-3.5 py-2.5">
              <div className="flex min-w-0 items-center gap-2 text-sm">
                <MapPin className="size-4 shrink-0 text-primary" />
                <span className="font-semibold text-foreground">
                  {t.provinces[selectedProvince] ?? weather.province}
                </span>
                {fmt.locale === "th" && <span className="truncate text-muted-foreground">· {weather.regionTh}</span>}
                {fmt.locale === "th" && weather.conditionTh && (
                  <span className="hidden truncate text-muted-foreground sm:inline">· {weather.conditionTh}</span>
                )}
                {fmt.locale === "en" && weather.condition && (
                  <span className="truncate text-muted-foreground">· {weather.condition}</span>
                )}
              </div>
              {season && SeasonIcon && (
                <Badge variant={season.variant} className="py-1">
                  <SeasonIcon />
                  {common.seasons[weather.season] ?? weather.seasonLabelTh}
                </Badge>
              )}
            </div>

            {weather.agriculturalAlerts?.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">{t.alerts}</p>
                <Stagger immediate className="grid gap-2 md:grid-cols-2">
                  {weather.agriculturalAlerts.map((alert, idx) => {
                    const style = ALERT_STYLE[alert.severity] ?? ALERT_STYLE.low
                    const Icon = alert.severity === "low" ? CheckCircle2 : AlertTriangle
                    return (
                      <StaggerItem key={idx} className={cn("flex items-start gap-3 rounded-xl border p-3.5", style.box)}>
                        <Icon className={cn("mt-0.5 size-4 shrink-0", style.text)} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className={cn("text-sm font-semibold", style.text)}>{alert.titleTh}</p>
                            <Badge variant={style.badge} className="shrink-0">
                              {t.severity[alert.severity] ?? alert.severity}
                            </Badge>
                          </div>
                          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{alert.messageTh}</p>
                        </div>
                      </StaggerItem>
                    )
                  })}
                </Stagger>
              </div>
            )}

            {weather.forecast?.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">{t.forecast}</p>
                <Stagger
                  immediate
                  stagger={0.05}
                  className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0"
                >
                  {weather.forecast.map((day, idx) => (
                    <StaggerItem
                      key={idx}
                      className="flex min-w-24 shrink-0 snap-start flex-col items-center gap-1 rounded-xl border border-border bg-card p-3 text-center transition-colors hover:border-primary/30 sm:min-w-0"
                    >
                      <p className="text-[11px] font-medium text-muted-foreground">
                        {fmt.date(day.date, { weekday: "short", day: "numeric", month: "short" })}
                      </p>
                      <p className="text-sm">
                        <span className="font-bold text-foreground">{day.tempMax}°</span>
                        <span className="ml-1 text-xs text-muted-foreground">{day.tempMin}°</span>
                      </p>
                      {fmt.locale === "th" && (
                        <p className="line-clamp-1 text-[10px] text-muted-foreground" title={day.conditionTh}>
                          {day.conditionTh}
                        </p>
                      )}
                      {day.precipitationSum > 0 && (
                        <span className="text-[10px] font-medium text-info">{t.rain(day.precipitationSum)}</span>
                      )}
                    </StaggerItem>
                  ))}
                </Stagger>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
