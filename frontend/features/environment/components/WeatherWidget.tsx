"use client"

import { useState, useEffect } from "react"
import {
  CloudSun,
  CloudRain,
  Sun,
  Wind,
  Droplets,
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Calendar,
  RefreshCw,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { WeatherData } from "@/types"
import { fetchWeather } from "@/lib/api"

interface WeatherWidgetProps {
  initialProvince?: string
  onLocationChange?: (province: string, region: string) => void
}

const PROVINCE_OPTIONS = [
  { key: "nakhon_ratchasima", label: "นครราชสีมา (อีสานตอนล่าง)", region: "Northeastern" },
  { key: "khon_kaen", label: "ขอนแก่น (อีสานตอนบน)", region: "Northeastern" },
  { key: "chiang_mai", label: "เชียงใหม่ (ภาคเหนือ)", region: "Northern" },
  { key: "nan", label: "น่าน (ภาคเหนือ)", region: "Northern" },
  { key: "suphan_buri", label: "สุพรรณบุรี (ภาคกลาง)", region: "Central" },
  { key: "ayutthaya", label: "พระนครศรีอยุธยา (ภาคกลาง)", region: "Central" },
  { key: "rayong", label: "ระยอง (ภาคตะวันออก)", region: "Eastern" },
  { key: "chanthaburi", label: "จันทบุรี (ภาคตะวันออก)", region: "Eastern" },
  { key: "surat_thani", label: "สุราษฎร์ธานี (ภาคใต้)", region: "Southern" },
  { key: "kanchanaburi", label: "กาญจนบุรี (ภาคตะวันตก)", region: "Western" },
]

export function WeatherWidget({ initialProvince = "nakhon_ratchasima", onLocationChange }: WeatherWidgetProps) {
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
    } catch (err: any) {
      setError(err.message || "ไม่สามารถโหลดข้อมูลสภาพอากาศได้")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWeather(selectedProvince)
  }, [selectedProvince])

  const handleProvinceSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    setSelectedProvince(val)
  }

  const getSeasonBadge = (season: string) => {
    switch (season) {
      case "rainy":
        return {
          label: "ฤดูฝน (ความชื้นสูง)",
          color: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200",
          icon: CloudRain,
        }
      case "winter":
        return {
          label: "ฤดูหนาว (อากาศเย็น)",
          color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-200",
          icon: Wind,
        }
      default:
        return {
          label: "ฤดูร้อน (แดดจัด)",
          color: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200",
          icon: Sun,
        }
    }
  }

  const seasonInfo = weather ? getSeasonBadge(weather.season) : getSeasonBadge("rainy")
  const SeasonIcon = seasonInfo.icon

  return (
    <Card className="border-border/60 shadow-sm overflow-hidden">
      <CardHeader className="bg-muted/30 border-b pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CloudSun className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <CardTitle className="text-lg font-bold">สภาพภูมิอากาศและแจ้งเตือนการเกษตร</CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              ข้อมูลสภาพอากาศเรียลไทม์จากดาวเทียม & การประเมินความเสี่ยงต่อแปลงเพาะปลูก
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={selectedProvince}
                onChange={handleProvinceSelect}
                className="text-xs bg-background border border-input rounded-md px-2.5 py-1.5 font-medium pr-7 focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
              >
                {PROVINCE_OPTIONS.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.label}
                  </option>
                ))}
              </select>
              <MapPin className="h-3.5 w-3.5 text-muted-foreground absolute right-2 top-2.5 pointer-events-none" />
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => loadWeather(selectedProvince)}
              title="รีเฟรชสภาพอากาศ"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {loading && !weather ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            <RefreshCw className="h-5 w-5 animate-spin mr-2" />
            กำลังดึงข้อมูลสภาพอากาศ...
          </div>
        ) : weather ? (
          <>
            {/* Top Stat Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  <Thermometer className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">อุณหภูมิปัจจุบัน</p>
                  <p className="text-xl font-bold">{weather.temperature}°C</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  <Droplets className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">ความชื้นสัมพัทธ์</p>
                  <p className="text-xl font-bold">{weather.humidity}%</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border">
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  <CloudRain className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">ปริมาณน้ำฝน</p>
                  <p className="text-xl font-bold">{weather.precipitation} <span className="text-xs font-normal">มม.</span></p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                  <Wind className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">ความเร็วลม</p>
                  <p className="text-xl font-bold">{weather.windSpeed} <span className="text-xs font-normal">กม./ชม.</span></p>
                </div>
              </div>
            </div>

            {/* Current Region & Season Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/40">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-sm">
                  {weather.province} ({weather.regionTh})
                </span>
                <span className="text-xs text-muted-foreground">· {weather.conditionTh}</span>
              </div>

              <Badge variant="outline" className={`flex items-center gap-1.5 font-medium text-xs px-3 py-1 ${seasonInfo.color}`}>
                <SeasonIcon className="h-3.5 w-3.5" />
                {seasonInfo.label}
              </Badge>
            </div>

            {/* Agricultural Risk Alerts */}
            {weather.agriculturalAlerts && weather.agriculturalAlerts.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  การแจ้งเตือนสภาวะแปลงเกษตร
                </p>
                <div className="grid gap-2">
                  {weather.agriculturalAlerts.map((alert, idx) => {
                    const isWarning = alert.severity === "high" || alert.severity === "medium"
                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
                          alert.severity === "high"
                            ? "bg-red-50/70 border-red-200 dark:bg-red-950/30 dark:border-red-900/50"
                            : alert.severity === "medium"
                            ? "bg-amber-50/70 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50"
                            : "bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/50"
                        }`}
                      >
                        {isWarning ? (
                          <AlertTriangle
                            className={`h-4 w-4 mt-0.5 shrink-0 ${
                              alert.severity === "high" ? "text-red-600" : "text-amber-600"
                            }`}
                          />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-600" />
                        )}
                        <div>
                          <p
                            className={`text-xs font-bold ${
                              alert.severity === "high"
                                ? "text-red-900 dark:text-red-300"
                                : alert.severity === "medium"
                                ? "text-amber-900 dark:text-amber-300"
                                : "text-emerald-900 dark:text-emerald-300"
                            }`}
                          >
                            {alert.titleTh}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                            {alert.messageTh}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 5-Day Forecast Grid */}
            {weather.forecast && weather.forecast.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    พยากรณ์อากาศล่วงหน้า 5 วัน
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {weather.forecast.map((day, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg border bg-card text-center flex flex-col justify-between space-y-1 shadow-2xs hover:border-primary/40 transition-colors"
                    >
                      <p className="text-[11px] font-medium text-muted-foreground">
                        {new Date(day.date).toLocaleDateString("th-TH", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                      <div className="py-1">
                        <span className="text-sm font-bold text-foreground">{day.tempMax}°</span>
                        <span className="text-xs text-muted-foreground ml-1">/ {day.tempMin}°</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground line-clamp-1" title={day.conditionTh}>
                        {day.conditionTh}
                      </p>
                      {day.precipitationSum > 0 && (
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                          ฝน {day.precipitationSum} มม.
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : error ? (
          <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-center text-xs text-destructive">
            {error}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
