"use client"

interface PHScaleGaugeProps {
  currentPh: number
  targetMin?: number
  targetMax?: number
  cropName?: string
}

export function PHScaleGauge({
  currentPh,
  targetMin = 5.5,
  targetMax = 7.0,
  cropName,
}: PHScaleGaugeProps) {
  // Clamp values between 0 and 14
  const clampedPh = Math.max(0, Math.min(14, currentPh))
  const percentage = (clampedPh / 14) * 100

  const targetMinPct = (Math.max(0, Math.min(14, targetMin)) / 14) * 100
  const targetMaxPct = (Math.max(0, Math.min(14, targetMax)) / 14) * 100
  const targetWidth = Math.max(1, targetMaxPct - targetMinPct)

  const getPhStatus = (ph: number) => {
    if (ph < 4.5) return { label: "ดินเป็นกรดรุนแรงมาก", color: "text-rose-600 bg-rose-50 border-rose-200" }
    if (ph < 5.5) return { label: "ดินเป็นกรดปานกลาง", color: "text-amber-600 bg-amber-50 border-amber-200" }
    if (ph <= 6.5) return { label: "ดินเป็นกรดอ่อน (เหมาะสมยิ่ง)", color: "text-emerald-700 bg-emerald-50 border-emerald-200" }
    if (ph <= 7.5) return { label: "ดินเป็นกลาง (เหมาะสม)", color: "text-emerald-700 bg-emerald-50 border-emerald-200" }
    if (ph <= 8.5) return { label: "ดินเป็นด่างอ่อน", color: "text-blue-600 bg-blue-50 border-blue-200" }
    return { label: "ดินเป็นด่างรุนแรง", color: "text-purple-600 bg-purple-50 border-purple-200" }
  }

  const status = getPhStatus(clampedPh)

  return (
    <div className="bg-card rounded-2xl p-4 border border-border/60 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
            สเกลความเป็นกรด-ด่างของดิน (pH Comparison)
          </h4>
          <p className="text-[11px] text-muted-foreground">
            วัดค่า pH: <span className="font-bold text-foreground text-sm">{clampedPh}</span>
          </p>
        </div>

        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${status.color}`}>
          {status.label}
        </span>
      </div>

      {/* Target crop optimal range banner */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5 px-0.5">
        <span>0 (กรดเข้มข้น)</span>
        <span className="text-emerald-800 dark:text-emerald-300 font-medium">
          {cropName ? `ช่วงที่เหมาะกับ ${cropName}: pH ${targetMin} - ${targetMax}` : `ช่วงพืชทั่วไป: pH ${targetMin} - ${targetMax}`}
        </span>
        <span>14 (ด่างเข้มข้น)</span>
      </div>

      {/* The Spectrum Bar */}
      <div className="relative h-6 w-full rounded-xl overflow-hidden bg-linear-to-r from-red-500 via-amber-400 via-emerald-500 via-sky-400 to-indigo-700 shadow-inner">
        {/* Target range highlight bracket overlay */}
        <div
          className="absolute top-0 bottom-0 border-2 border-white/90 bg-white/25 backdrop-blur-[1px] rounded-sm transition-all duration-500 shadow-sm"
          style={{
            left: `${targetMinPct}%`,
            width: `${targetWidth}%`,
          }}
          title={`ช่วงที่เหมาะสม: pH ${targetMin} - ${targetMax}`}
        />

        {/* User measurement pin indicator */}
        <div
          className="absolute top-0 bottom-0 w-1.5 bg-gray-900 dark:bg-white shadow-md transition-all duration-700 ease-out"
          style={{
            left: `calc(${percentage}% - 3px)`,
          }}
        >
          {/* Top pin arrow */}
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 dark:bg-white rotate-45 rounded-xs shadow-xs" />
        </div>
      </div>

      {/* Numbers legend */}
      <div className="flex justify-between text-[10px] text-muted-foreground font-mono mt-1.5 px-1">
        <span>0</span>
        <span>2</span>
        <span>4</span>
        <span className="font-bold text-emerald-700 dark:text-emerald-400">6</span>
        <span className="font-bold text-emerald-700 dark:text-emerald-400">7</span>
        <span>8</span>
        <span>10</span>
        <span>12</span>
        <span>14</span>
      </div>
    </div>
  )
}
