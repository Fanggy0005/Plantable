"use client"

import { MapPin } from "lucide-react"
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

export function ProvincePicker({
  value,
  onChange,
}: {
  value: string
  onChange: (province: string) => void
}) {
  const t = useT(pickerMessages)

  const provinceItems = Object.fromEntries(
    THAI_PROVINCES_SELECT.map((p) => [p.key, t.provinces[p.key] ?? p.key])
  )
  const regionOf = THAI_PROVINCES_SELECT.find((p) => p.key === value)?.region

  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold text-foreground">
        <MapPin className="size-4 text-primary" />
        {t.province}
      </Label>
      <Select items={provinceItems} value={value} onValueChange={(v) => v && onChange(v as string)}>
        <SelectTrigger
          className="h-11 w-full rounded-xl border-input bg-card px-3.5 text-sm font-medium shadow-xs hover:border-primary/30"
          aria-label={t.province}
        >
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
  )
}
