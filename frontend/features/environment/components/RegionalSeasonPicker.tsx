"use client"

import { CalendarRange, CloudRain, MapPin, Snowflake, Sun, type LucideIcon } from "lucide-react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useT } from "@/lib/i18n"
import { pickerMessages } from "../picker-messages"

interface RegionalSeasonPickerProps {
  selectedProvince: string
  selectedSeason: string
  onProvinceChange: (province: string) => void
  onSeasonChange: (season: string) => void
}

type RegionKey = "north" | "northeast" | "central" | "east" | "south" | "west"

export const THAI_PROVINCES_SELECT: { key: string; region: RegionKey }[] = [
  { key: "chiang_mai", region: "north" },
  { key: "nan", region: "north" },
  { key: "nakhon_ratchasima", region: "northeast" },
  { key: "khon_kaen", region: "northeast" },
  { key: "suphan_buri", region: "central" },
  { key: "ayutthaya", region: "central" },
  { key: "rayong", region: "east" },
  { key: "chanthaburi", region: "east" },
  { key: "surat_thani", region: "south" },
  { key: "songkhla", region: "south" },
  { key: "kanchanaburi", region: "west" },
]

const REGION_ORDER: RegionKey[] = ["north", "northeast", "central", "east", "south", "west"]

export const SEASONS_SELECT: { key: string; icon: LucideIcon }[] = [
  { key: "rainy", icon: CloudRain },
  { key: "winter", icon: Snowflake },
  { key: "summer", icon: Sun },
]

const triggerClass =
  "h-11 w-full rounded-xl border-input bg-card px-3.5 text-sm font-medium shadow-xs hover:border-primary/30"

export function RegionalSeasonPicker({
  selectedProvince,
  selectedSeason,
  onProvinceChange,
  onSeasonChange,
}: RegionalSeasonPickerProps) {
  const t = useT(pickerMessages)

  const provinceItems = Object.fromEntries(
    THAI_PROVINCES_SELECT.map((p) => [p.key, t.provinces[p.key] ?? p.key])
  )
  const seasonItems = Object.fromEntries(
    SEASONS_SELECT.map((s) => [s.key, t.seasons[s.key]?.label ?? s.key])
  )
  const regionOf = THAI_PROVINCES_SELECT.find((p) => p.key === selectedProvince)?.region
  const season = t.seasons[selectedSeason]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-foreground">
          <MapPin className="size-3.5 text-primary" />
          {t.province}
        </Label>
        <Select
          items={provinceItems}
          value={selectedProvince}
          onValueChange={(v) => v && onProvinceChange(v as string)}
        >
          <SelectTrigger className={triggerClass} aria-label={t.province}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-2xl">
            {REGION_ORDER.map((region) => (
              <SelectGroup key={region}>
                <SelectLabel>{t.regions[region]}</SelectLabel>
                {THAI_PROVINCES_SELECT.filter((p) => p.region === region).map((p) => (
                  <SelectItem key={p.key} value={p.key} className="rounded-xl">
                    {provinceItems[p.key]}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {regionOf ? `${t.regions[regionOf]} · ` : ""}
          {t.provinceHint}
        </p>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-foreground">
          <CalendarRange className="size-3.5 text-info" />
          {t.season}
        </Label>
        <Select
          items={seasonItems}
          value={selectedSeason}
          onValueChange={(v) => v && onSeasonChange(v as string)}
        >
          <SelectTrigger className={triggerClass} aria-label={t.season}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-2xl">
            {SEASONS_SELECT.map((s) => (
              <SelectItem key={s.key} value={s.key} className="rounded-xl py-2.5">
                <s.icon className="text-muted-foreground" />
                <span className="flex flex-col items-start">
                  <span>{t.seasons[s.key]?.label}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {t.seasons[s.key]?.months}
                  </span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {season ? `${season.months} · ${season.desc}` : t.seasonHint}
        </p>
      </div>
    </div>
  )
}
