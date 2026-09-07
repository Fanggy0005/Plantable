"use client"

interface SuitabilityGaugeProps {
  score: number
  level?: string
  size?: number
  strokeWidth?: number
}

export function SuitabilityGauge({
  score,
  level,
  size = 110,
  strokeWidth = 9,
}: SuitabilityGaugeProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const normalizedScore = Math.max(0, Math.min(100, score))
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference

  // Color selection based on score tiers
  const getColor = (s: number) => {
    if (s >= 90) return { stroke: "#059669", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" } // Excellent
    if (s >= 75) return { stroke: "#16a34a", bg: "bg-green-50 text-green-800 border-green-200" }     // Good
    if (s >= 60) return { stroke: "#d97706", bg: "bg-amber-50 text-amber-800 border-amber-200" }     // Fair
    if (s >= 40) return { stroke: "#ea580c", bg: "bg-orange-50 text-orange-800 border-orange-200" }   // Poor
    return { stroke: "#dc2626", bg: "bg-rose-50 text-rose-800 border-rose-200" }                      // Not Recommended
  }

  const { stroke, bg } = getColor(normalizedScore)

  const getLevelThai = (lvl?: string, s?: number) => {
    const val = s ?? 0
    if (lvl === "Excellent" || val >= 90) return "เหมาะสมดีเลิศ"
    if (lvl === "Good" || val >= 75) return "เหมาะสมดี"
    if (lvl === "Fair" || val >= 60) return "ปานกลาง"
    if (lvl === "Poor" || val >= 40) return "ความเหมาะสมต่ำ"
    return "ไม่แนะนำ"
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-muted/40"
          />
          {/* Animated score circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: "stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
        </svg>

        {/* Center label */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black tracking-tight text-foreground">{normalizedScore}</span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">คะแนน</span>
        </div>
      </div>

      {level && (
        <span className={`mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${bg}`}>
          {getLevelThai(level, normalizedScore)}
        </span>
      )}
    </div>
  )
}
