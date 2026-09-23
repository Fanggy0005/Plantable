"use client"

import { useState } from "react"
import { Activity, FlaskConical, Leaf, Lightbulb, Sprout, TestTube } from "lucide-react"
import { motion } from "motion/react"
import { CountUp, EASE_OUT, FadeIn, Stagger, StaggerItem } from "@/components/motion"
import { SectionHeading } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/States"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useT } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import type { SoilImprovementPlan } from "@/types"
import { soilImprovementMessages } from "../messages"
import { FertilizerScheduleCard } from "./FertilizerScheduleCard"
import { NutrientDeficiencyCard, STATUS_TONE } from "./NutrientDeficiencyCard"
import { OrganicAlternativesCard, PhCorrectionCard } from "./SoilAmendmentCard"

interface SoilImprovementSectionProps {
  plan: SoilImprovementPlan
  cropNameTh?: string
}

type TabKey = "fertilizer" | "organic" | "ph" | "tips"

function healthTone(score: number) {
  if (score >= 80) return { color: "var(--success)", key: "good" as const }
  if (score >= 60) return { color: "var(--warning)", key: "fair" as const }
  return { color: "var(--destructive)", key: "poor" as const }
}

function HealthRing({ score }: { score: number }) {
  const size = 132
  const stroke = 11
  const r = (size - stroke) / 2
  const { color } = healthTone(score)
  const clamped = Math.max(0, Math.min(100, score))

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: clamped / 100 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: EASE_OUT }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold tracking-tight text-foreground">
          <CountUp value={clamped} />
        </span>
        <span className="text-xs font-medium text-muted-foreground">/ 100</span>
      </div>
    </div>
  )
}

export function SoilImprovementSection({ plan, cropNameTh }: SoilImprovementSectionProps) {
  const t = useT(soilImprovementMessages)
  const [tab, setTab] = useState<TabKey>("fertilizer")

  const score = plan.soilHealthScore
  const tone = healthTone(score)
  const counts = plan.diagnostics.reduce(
    (acc, d) => {
      const tn = STATUS_TONE[d.status]
      if (tn === "success") acc.optimal++
      else if (tn === "info") acc.excess++
      else acc.deficient++
      return acc
    },
    { optimal: 0, deficient: 0, excess: 0 }
  )

  const tabs: { key: TabKey; label: string; icon: typeof Leaf }[] = [
    { key: "fertilizer", label: t.tabs.fertilizer, icon: FlaskConical },
    { key: "organic", label: t.tabs.organic, icon: Leaf },
    { key: "ph", label: t.tabs.ph, icon: TestTube },
    { key: "tips", label: t.tabs.tips, icon: Lightbulb },
  ]

  return (
    <section className="space-y-6">
      <SectionHeading
        icon={Sprout}
        title={cropNameTh ? t.titleFor(cropNameTh) : t.title}
        description={plan.overallConditionTh}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]">
        {/* Soil health overview */}
        <FadeIn className="surface flex flex-col items-center gap-4 p-6 text-center lg:self-start">
          <p className="text-sm font-semibold text-muted-foreground">{t.health.label}</p>
          <HealthRing score={score} />
          <Badge
            variant={tone.key === "good" ? "success" : tone.key === "fair" ? "warning" : "destructive"}
            className="px-3 py-1 text-sm"
          >
            {t.health[tone.key]}
          </Badge>
          <div className="grid w-full grid-cols-3 gap-2 border-t border-border pt-4">
            {[
              { label: t.health.optimalCount, value: counts.optimal, cls: "text-success" },
              { label: t.health.deficientCount, value: counts.deficient, cls: "text-warning" },
              { label: t.health.excessCount, value: counts.excess, cls: "text-info" },
            ].map((c) => (
              <div key={c.label}>
                <p className={cn("text-xl font-bold", c.cls)}>{c.value}</p>
                <p className="text-[11px] text-muted-foreground">{c.label}</p>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Diagnostics */}
        <div className="min-w-0 space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Activity className="size-4 text-primary" />
            {t.diagnostics.title}
          </h3>
          <NutrientDeficiencyCard diagnostics={plan.diagnostics} />
        </div>
      </div>

      {/* Action plan tabs */}
      <FadeIn className="surface p-3 sm:p-5">
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="gap-5">
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-2xl p-1 group-data-horizontal/tabs:h-auto sm:grid-cols-4">
            {tabs.map((item) => (
              <TabsTrigger
                key={item.key}
                value={item.key}
                className="h-10 rounded-xl data-active:bg-transparent data-active:text-primary data-active:shadow-none"
              >
                {tab === item.key && (
                  <motion.span
                    layoutId="soil-plan-tab"
                    className="absolute inset-0 rounded-xl bg-card shadow-sm ring-1 ring-border"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <item.icon className="relative" />
                <span className="relative">{item.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="fertilizer" className="px-1 sm:px-2">
            <PanelMotion>
              <FertilizerScheduleCard schedule={plan.fertilizerRecommendations} cropNameTh={cropNameTh} />
            </PanelMotion>
          </TabsContent>

          <TabsContent value="organic" className="px-1 sm:px-2">
            <PanelMotion>
              <OrganicAlternativesCard organicAlternatives={plan.organicAlternatives} />
            </PanelMotion>
          </TabsContent>

          <TabsContent value="ph" className="px-1 sm:px-2">
            <PanelMotion>
              <PhCorrectionCard phCorrection={plan.phCorrection} />
            </PanelMotion>
          </TabsContent>

          <TabsContent value="tips" className="px-1 sm:px-2">
            <PanelMotion>
              {plan.generalTipsTh?.length ? (
                <div className="space-y-4">
                  <SectionHeading icon={Lightbulb} title={t.tips.title} />
                  <Stagger className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {plan.generalTipsTh.map((tip, idx) => (
                      <StaggerItem
                        key={idx}
                        className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-sm leading-relaxed text-muted-foreground"
                      >
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-primary">
                          {idx + 1}
                        </span>
                        {tip}
                      </StaggerItem>
                    ))}
                  </Stagger>
                </div>
              ) : (
                <EmptyState icon={Lightbulb} title={t.tips.empty} />
              )}
            </PanelMotion>
          </TabsContent>
        </Tabs>
      </FadeIn>
    </section>
  )
}

/** Soft enter animation each time a tab panel mounts. */
function PanelMotion({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  )
}
