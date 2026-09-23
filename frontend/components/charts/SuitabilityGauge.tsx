"use client"

import { motion } from "motion/react"
import { CountUp, EASE_OUT } from "@/components/motion"
import { useT } from "@/lib/i18n"
import { commonMessages } from "@/lib/i18n/messages/common"
import { levelFromScore, scoreTone, TONE_BADGE, TONE_COLOR } from "@/lib/score"
import { cn } from "@/lib/utils"
import { chartMessages } from "./messages"

interface SuitabilityGaugeProps {
  score: number
  level?: string
  size?: number
  strokeWidth?: number
  className?: string
}

/** Animated ring showing a 0–100 suitability score. */
export function SuitabilityGauge({
  score,
  level,
  size = 110,
  strokeWidth = 9,
  className,
}: SuitabilityGaugeProps) {
  const t = useT(chartMessages)
  const common = useT(commonMessages)
  const value = Math.max(0, Math.min(100, score))
  const tone = scoreTone(value)
  const radius = (size - strokeWidth) / 2
  const levelKey = level && common.levels[level] ? level : levelFromScore(value)
  const compact = size < 96

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className="stroke-muted"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={TONE_COLOR[tone]}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: value / 100 }}
            transition={{ duration: 1.1, ease: EASE_OUT }}
          />
        </svg>
        <div className="absolute flex flex-col items-center leading-none">
          <CountUp
            value={value}
            className={cn("font-bold tracking-tight text-foreground", compact ? "text-xl" : "text-2xl")}
          />
          <span className="mt-1 text-[10px] font-semibold text-muted-foreground">{t.score}</span>
        </div>
      </div>
      {level && (
        <span
          className={cn(
            "mt-2 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap",
            TONE_BADGE[tone]
          )}
        >
          {common.levels[levelKey]}
        </span>
      )}
    </div>
  )
}
