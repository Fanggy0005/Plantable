"use client"

import { MapPin, Calendar, Compass } from "lucide-react"

interface RegionalSeasonPickerProps {
  selectedProvince: string
  selectedSeason: string
  onProvinceChange: (province: string) => void
  onSeasonChange: (season: string) => void
}

export const THAI_PROVINCES_SELECT = [
  { key: "nakhon_ratchasima", labelTh: "นครราชสีมา (อีสานตอนล่าง)", regionTh: "ภาคตะวันออกเฉียงเหนือ" },
  { key: "khon_kaen", labelTh: "ขอนแก่น (อีสานตอนบน)", regionTh: "ภาคตะวันออกเฉียงเหนือ" },
  { key: "chiang_mai", labelTh: "เชียงใหม่ (ภาคเหนือ)", regionTh: "ภาคเหนือ" },
  { key: "nan", labelTh: "น่าน (ภาคเหนือ)", regionTh: "ภาคเหนือ" },
  { key: "suphan_buri", labelTh: "สุพรรณบุรี (ภาคกลาง)", regionTh: "ภาคกลาง" },
  { key: "ayutthaya", labelTh: "พระนครศรีอยุธยา (ภาคกลาง)", regionTh: "ภาคกลาง" },
  { key: "rayong", labelTh: "ระยอง (ภาคตะวันออก)", regionTh: "ภาคตะวันออก" },
  { key: "chanthaburi", labelTh: "จันทบุรี (ภาคตะวันออก)", regionTh: "ภาคตะวันออก" },
  { key: "surat_thani", labelTh: "สุราษฎร์ธานี (ภาคใต้)", regionTh: "ภาคใต้" },
  { key: "songkhla", labelTh: "สงขลา (ภาคใต้ตอนล่าง)", regionTh: "ภาคใต้" },
  { key: "kanchanaburi", labelTh: "กาญจนบุรี (ภาคตะวันตก)", regionTh: "ภาคตะวันตก" },
]

export const SEASONS_SELECT = [
  { key: "rainy", labelTh: "ฤดูฝน (พ.ค. - ต.ค.) - น้ำสมบูรณ์ นาข้าว พืชไร่", description: "เหมาะแก่การปลูกพืชที่ใช้น้ำมาก" },
  { key: "winter", labelTh: "ฤดูหนาว (พ.ย. - ก.พ.) - อากาศเย็น ผักเมืองหนาว", description: "ผักสลัด มะเขือเทศ ข้าวโพดหลังนา" },
  { key: "summer", labelTh: "ฤดูร้อน (มี.ค. - เม.ย.) - แดดจัด พืชทนแล้ง", description: "มันสำปะหลัง อ้อย สับปะรด" },
]

export function RegionalSeasonPicker({
  selectedProvince,
  selectedSeason,
  onProvinceChange,
  onSeasonChange,
}: RegionalSeasonPickerProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border bg-muted/20">
      {/* Province Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          จังหวัด / ภูมิภาคเพาะปลูก
        </label>
        <div className="relative">
          <select
            value={selectedProvince}
            onChange={(e) => onProvinceChange(e.target.value)}
            className="w-full text-xs bg-background border border-input rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs font-medium"
          >
            {THAI_PROVINCES_SELECT.map((prov) => (
              <option key={prov.key} value={prov.key}>
                {prov.labelTh}
              </option>
            ))}
          </select>
        </div>
        <p className="text-[11px] text-muted-foreground">
          ใช้คำนวณความเข้ากันได้ของสภาพภูมิอากาศและแหล่งน้ำ
        </p>
      </div>

      {/* Season Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          ฤดูกาลเพาะปลูกที่วางแผน
        </label>
        <div className="relative">
          <select
            value={selectedSeason}
            onChange={(e) => onSeasonChange(e.target.value)}
            className="w-full text-xs bg-background border border-input rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs font-medium"
          >
            {SEASONS_SELECT.map((season) => (
              <option key={season.key} value={season.key}>
                {season.labelTh}
              </option>
            ))}
          </select>
        </div>
        <p className="text-[11px] text-muted-foreground">
          ปรับเกณฑ์การประเมินตามปริมาณฝนและอุณหภูมิตามฤดู
        </p>
      </div>
    </div>
  )
}
