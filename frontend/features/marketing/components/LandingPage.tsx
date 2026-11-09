"use client"

import Link from "next/link"
import { motion } from "motion/react"
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Compass,
  FileDown,
  FlaskConical,
  ShieldCheck,
  Sparkles,
  Sprout,
  TestTube2,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { CountUp, EASE_OUT, FadeIn, Stagger, StaggerItem } from "@/components/motion"
import { CropIcon } from "@/components/shared/CropIcon"
import { useT } from "@/lib/i18n"
import { commonMessages } from "@/lib/i18n/messages/common"
import { cn } from "@/lib/utils"
import { landingMessages } from "../messages"

const SAMPLE_BALANCE = [
  { key: "nitrogen", short: "N", value: 88, tone: "bg-chart-2" },
  { key: "phosphorus", short: "P", value: 94, tone: "bg-chart-2" },
  { key: "potassium", short: "K", value: 71, tone: "bg-chart-3" },
  { key: "ph", short: "pH", value: 96, tone: "bg-chart-2" },
] as const

/** Floating mock of a results card so visitors see what they'll get. */
function ProductPreview() {
  const t = useT(landingMessages)
  const c = useT(commonMessages)

  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* halo */}
      <div className="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-forest-accent/15 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30, rotate: -1.5 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.25 }}
        className="relative rounded-3xl border border-forest-border bg-card p-5 text-card-foreground shadow-2xl shadow-black/30 sm:p-6"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{t.preview.title}</p>
            <p className="truncate text-xs text-muted-foreground">{t.preview.subtitle}</p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-semibold text-success">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-70" />
              <span className="relative inline-flex size-1.5 rounded-full bg-success" />
            </span>
            {t.preview.live}
          </span>
        </div>

        {/* Top match */}
        <div className="mt-5 flex items-center gap-4 rounded-2xl bg-secondary/70 p-4">
          <CropIcon name="Rice" category="Grain" size="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-muted-foreground">{t.preview.topMatch}</p>
            <p className="truncate text-lg font-bold">{t.preview.crop}</p>
            <span className="mt-0.5 inline-flex rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-semibold text-success ring-1 ring-success/20">
              {c.levels.Excellent}
            </span>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold text-muted-foreground">{t.preview.score}</p>
            <p className="text-3xl font-bold tracking-tight text-primary">
              <CountUp value={92} duration={1.6} />
              <span className="text-sm font-semibold text-muted-foreground">/100</span>
            </p>
          </div>
        </div>

        {/* Nutrient balance */}
        <div className="mt-5">
          <p className="mb-3 text-xs font-semibold text-muted-foreground">{t.preview.balance}</p>
          <div className="space-y-2.5">
            {SAMPLE_BALANCE.map((row, i) => (
              <div key={row.key} className="flex items-center gap-3">
                <span className="w-7 text-xs font-bold text-foreground">{row.short}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className={cn("h-full rounded-full", row.tone)}
                    initial={{ width: 0 }}
                    animate={{ width: `${row.value}%` }}
                    transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.6 + i * 0.1 }}
                  />
                </div>
                <span className="w-8 text-right text-xs font-semibold text-muted-foreground tabular-nums">
                  <CountUp value={row.value} duration={1.3} />
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Runners-up */}
        <div className="mt-5 border-t border-border pt-4">
          <p className="mb-2.5 text-xs font-semibold text-muted-foreground">{t.preview.ranking}</p>
          <div className="space-y-2">
            {t.preview.others.map((o, i) => (
              <div key={o.nameEn} className="flex items-center gap-3">
                <span className="w-5 text-xs font-bold text-muted-foreground">#{i + 2}</span>
                <CropIcon name={o.nameEn} category={o.category} size="sm" />
                <span className="flex-1 truncate text-sm font-medium">{o.name}</span>
                <span className="text-sm font-bold tabular-nums">{o.score}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Floating chip */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: EASE_OUT, delay: 1.1 }}
        className="absolute -top-4 -right-2 hidden sm:block"
      >
        <div className="flex animate-float items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground shadow-xl">
          <span className="flex size-6 items-center justify-center rounded-lg bg-warning-soft text-warning">
            <FlaskConical className="size-3.5" />
          </span>
          pH 6.2
        </div>
      </motion.div>
    </div>
  )
}

function Hero() {
  const t = useT(landingMessages)
  const trustIcons = [ShieldCheck, CheckCircle2, ClipboardList]

  return (
    <section className="relative w-full overflow-hidden bg-forest-gradient text-forest-foreground">
      <div className="pointer-events-none absolute inset-0 bg-dot-grid-dark opacity-60 mask-[radial-gradient(70%_60%_at_50%_30%,black,transparent)]" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-120 w-195 -translate-x-1/2 rounded-full bg-forest-accent/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
        <Stagger immediate stagger={0.08} className="space-y-7 text-center lg:text-left">
          <StaggerItem>
            <span className="inline-flex items-center gap-2 rounded-full border border-forest-border bg-forest-elevated/70 px-3.5 py-1.5 text-xs font-semibold text-forest-accent backdrop-blur-sm">
              <Sparkles className="size-3.5" />
              {t.hero.badge}
            </span>
          </StaggerItem>

          <StaggerItem>
            <h1 className="text-4xl leading-[1.15] font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              {t.hero.titleLead}
              <br />
              <span className="text-gradient-forest">{t.hero.titleAccent}</span>
            </h1>
          </StaggerItem>

          <StaggerItem>
            <p className="mx-auto max-w-xl text-base leading-relaxed text-forest-muted sm:text-lg lg:mx-0">
              {t.hero.description}
            </p>
          </StaggerItem>

          <StaggerItem className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center lg:justify-start">
            <Button
              size="lg"
              render={<Link href="/analyze" />}
              nativeButton={false}
              className="group h-12 bg-forest-accent px-6 text-base font-bold text-forest shadow-[0_8px_30px_-6px_var(--forest-accent)] hover:bg-forest-accent/90"
            >
              {t.hero.primaryCta}
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              render={<Link href="/crops" />}
              nativeButton={false}
              className="h-12 border-forest-border bg-forest-elevated/50 px-6 text-base font-semibold text-forest-foreground hover:bg-forest-elevated hover:text-forest-foreground"
            >
              <Compass className="size-5 text-forest-accent" />
              {t.hero.secondaryCta}
            </Button>
          </StaggerItem>

          <StaggerItem>
            <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-sm text-forest-muted lg:justify-start">
              {t.hero.trust.map((item, i) => {
                const Icon = trustIcons[i]
                return (
                  <li key={item} className="flex items-center gap-2">
                    <Icon className="size-4 text-forest-accent" />
                    {item}
                  </li>
                )
              })}
            </ul>
          </StaggerItem>
        </Stagger>

        <ProductPreview />
      </div>
    </section>
  )
}

function StatsStrip() {
  const t = useT(landingMessages)
  const stats = [
    { id: "crops", value: 12, label: t.stats.crops, icon: Sprout },
    { id: "params", value: 4, label: t.stats.params, icon: TestTube2 },
    { id: "score", value: 100, label: t.stats.score, icon: BarChart3 },
  ]

  return (
    <section className="relative z-10 mx-auto -mt-10 w-full max-w-5xl px-4 sm:px-6">
      <Stagger className="surface grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {stats.map((s) => (
          <StaggerItem key={s.id} className="flex items-center gap-4 px-6 py-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
              <s.icon className="size-5" />
            </span>
            <div>
              <p className="text-3xl font-bold tracking-tight text-foreground">
                <CountUp value={s.value} />
              </p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  )
}

function SectionIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <FadeIn className="mx-auto mb-12 max-w-2xl space-y-3 text-center">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
        <Sprout className="size-3.5" />
        {eyebrow}
      </span>
      <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h2>
      {description && <p className="text-base text-muted-foreground">{description}</p>}
    </FadeIn>
  )
}

function Workflow() {
  const t = useT(landingMessages)
  const icons: LucideIcon[] = [TestTube2, BarChart3, Sprout]

  return (
    <section className="w-full py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionIntro eyebrow={t.steps.eyebrow} title={t.steps.title} description={t.steps.description} />

        <Stagger stagger={0.12} className="relative grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* connector line */}
          <div className="pointer-events-none absolute top-11 right-[16%] left-[16%] hidden h-px bg-linear-to-r from-transparent via-border to-transparent md:block" />
          {t.steps.items.map((step, i) => {
            const Icon = icons[i]
            // Key by position, not translated text: a new key on language switch remounts the card
            // in its hidden variant, and the once-only reveal never replays, so it stays invisible
            return (
              <StaggerItem key={i} className="surface-interactive group relative p-6 sm:p-7">
                <div className="flex items-center justify-between">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                    <Icon className="size-6" />
                  </span>
                  <span className="text-5xl font-extrabold text-muted transition-colors group-hover:text-secondary">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-bold tracking-tight text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </StaggerItem>
            )
          })}
        </Stagger>
      </div>
    </section>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  body,
  className,
  children,
}: {
  icon: LucideIcon
  title: string
  body: string
  className?: string
  children?: React.ReactNode
}) {
  return (
    <StaggerItem className={cn("surface-interactive group flex flex-col overflow-hidden p-6", className)}>
      <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-4 text-lg font-bold tracking-tight text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
      {children}
    </StaggerItem>
  )
}

function Features() {
  const t = useT(landingMessages)
  const c = useT(commonMessages)

  return (
    <section className="w-full bg-dot-grid py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionIntro eyebrow={t.features.eyebrow} title={t.features.title} />

        <Stagger stagger={0.08} className="grid grid-cols-1 gap-5 md:grid-cols-6">
          <FeatureCard icon={ClipboardList} title={t.features.entry.title} body={t.features.entry.body} className="md:col-span-3">
            {/* mini entry visual */}
            <div className="relative mt-6 overflow-hidden rounded-xl border border-border bg-muted/50 p-4">
              <div className="space-y-2">
                {[
                  [c.nutrients.nitrogen, "120"],
                  [c.nutrients.phosphorus, "45"],
                  [c.nutrients.potassium, "50"],
                ].map(([label, v]) => (
                  <div key={label} className="flex items-center justify-between rounded-lg bg-card px-3 py-2 text-xs shadow-xs">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-bold text-foreground tabular-nums">
                      {v} <span className="font-medium text-muted-foreground">{c.units.mgPerKg}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </FeatureCard>

          <FeatureCard icon={FlaskConical} title={t.features.plan.title} body={t.features.plan.body} className="md:col-span-3">
            <div className="mt-6 grid grid-cols-3 gap-2">
              {[
                { label: "N", status: "bg-warning", w: "45%" },
                { label: "P", status: "bg-success", w: "82%" },
                { label: "K", status: "bg-chart-2", w: "68%" },
              ].map((b) => (
                <div key={b.label} className="rounded-xl border border-border bg-muted/50 p-3">
                  <p className="text-xs font-bold text-foreground">{b.label}</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-card">
                    <motion.div
                      className={cn("h-full rounded-full", b.status)}
                      initial={{ width: 0 }}
                      whileInView={{ width: b.w }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: EASE_OUT, delay: 0.2 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </FeatureCard>

          <FeatureCard icon={FileDown} title={t.features.history.title} body={t.features.history.body} className="md:col-span-3" />
          <FeatureCard icon={BookOpen} title={t.features.database.title} body={t.features.database.body} className="md:col-span-3" />
        </Stagger>
      </div>
    </section>
  )
}

function FinalCta() {
  const t = useT(landingMessages)

  return (
    <section className="w-full px-4 pb-24 sm:px-6">
      <FadeIn className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-forest-gradient p-8 text-forest-foreground shadow-2xl sm:p-14">
        <div className="pointer-events-none absolute inset-0 bg-dot-grid-dark opacity-50" />
        <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-forest-accent/15 blur-3xl" />

        <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="max-w-xl space-y-3">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t.cta.title}</h2>
            <p className="text-base text-forest-muted">{t.cta.body}</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row md:flex-col lg:flex-row">
            <Button
              size="lg"
              render={<Link href="/analyze" />}
              nativeButton={false}
              className="group h-12 bg-forest-accent px-6 text-base font-bold text-forest hover:bg-forest-accent/90"
            >
              {t.cta.primary}
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              render={<Link href="/register" />}
              nativeButton={false}
              className="h-12 border-forest-border bg-transparent px-6 text-base font-semibold text-forest-foreground hover:bg-forest-elevated hover:text-forest-foreground"
            >
              {t.cta.secondary}
            </Button>
          </div>
        </div>
      </FadeIn>
    </section>
  )
}

export function LandingPage() {
  return (
    <div className="flex w-full flex-col">
      <Hero />
      <StatsStrip />
      <Workflow />
      <Features />
      <FinalCta />
    </div>
  )
}
