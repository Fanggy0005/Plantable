"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "motion/react"
import { toast } from "sonner"
import { ArrowRight, BadgeCheck, CalendarDays, Loader2, LogOut, Mail, Map as MapIcon, Save, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { FadeIn, Stagger, StaggerItem } from "@/components/motion"
import { SectionHeading } from "@/components/shared/PageHeader"
import { StatCard } from "@/components/shared/StatCard"
import { authClient } from "@/lib/auth-client"
import { fetchUserProfile, updateUserProfile } from "@/lib/api"
import { useFormat, useT } from "@/lib/i18n"
import { profileMessages } from "@/features/profile/messages"
import type { UserProfile } from "@/types"

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6 sm:py-14">
      <Skeleton className="h-40 w-full rounded-3xl" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const t = useT(profileMessages)
  const fmt = useFormat()
  const { data: session, isPending: sessionPending } = authClient.useSession()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingName, setEditingName] = useState("")
  const [savingName, setSavingName] = useState(false)

  useEffect(() => {
    if (!sessionPending && !session?.user) {
      router.push("/login")
      return
    }

    if (!session?.user) return

    let cancelled = false
    fetchUserProfile()
      .then((profileData) => {
        if (cancelled) return
        setProfile(profileData)
        setEditingName(profileData.name || "")
      })
      .catch((e) => console.error("Failed to load profile data", e))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [session, sessionPending, router])

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingName(true)
    try {
      const updated = await updateUserProfile({ name: editingName })
      setProfile((prev) => (prev ? { ...prev, name: updated.name } : prev))
      toast.success(t.edit.saved)
    } catch (err) {
      console.error("Failed to update profile", err)
      toast.error(t.edit.failed)
    } finally {
      setSavingName(false)
    }
  }

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push("/")
    router.refresh()
  }

  if (sessionPending || loading) {
    return <ProfileSkeleton />
  }

  const displayName = profile?.name || session?.user?.name || t.fallbackName
  const initial = (profile?.name?.[0] || session?.user?.email?.[0] || "U").toUpperCase()
  const memberDate = profile?.createdAt ? fmt.date(profile.createdAt) : t.stats.recently
  const nameUnchanged = editingName.trim() === (profile?.name || "").trim()

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6 sm:py-14">
      {/* Identity header */}
      <FadeIn
        immediate
        className="relative overflow-hidden rounded-3xl bg-forest-gradient p-6 text-forest-foreground sm:p-8"
      >
        <div className="pointer-events-none absolute inset-0 bg-dot-grid-dark opacity-50" />
        <div className="pointer-events-none absolute -top-20 -right-16 size-72 rounded-full bg-forest-accent/15 blur-3xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4 sm:gap-5">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
              className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-forest-accent text-2xl font-extrabold text-forest shadow-[0_0_30px_-6px_var(--forest-accent)] sm:size-20 sm:text-3xl"
            >
              {initial}
            </motion.div>
            <div className="min-w-0 space-y-1">
              <p className="text-xs font-semibold tracking-wide text-forest-accent uppercase">{t.eyebrow}</p>
              <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">{displayName}</h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-forest-muted">
                <span className="flex min-w-0 items-center gap-1.5">
                  <Mail className="size-3.5 shrink-0" />
                  <span className="truncate">{session?.user?.email}</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-forest-elevated/80 px-2 py-0.5 text-xs font-semibold text-forest-accent ring-1 ring-forest-border">
                  <BadgeCheck className="size-3.5" />
                  {t.verified}
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleSignOut}
            className="h-10 self-start border-forest-border bg-forest-elevated/50 text-forest-foreground hover:bg-forest-elevated hover:text-forest-foreground sm:self-auto"
          >
            <LogOut />
            {t.logout}
          </Button>
        </div>
      </FadeIn>

      {/* Stats */}
      <Stagger immediate className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StaggerItem>
          <StatCard
            label={t.stats.plots}
            value={profile?._count.plots ?? 0}
            icon={MapIcon}
            hint={
              <Link
                href="/history"
                className="group inline-flex items-center gap-1 font-semibold text-primary hover:underline"
              >
                {t.stats.viewHistory}
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            }
          />
        </StaggerItem>
        <StaggerItem>
          <div className="surface-interactive h-full p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-muted-foreground">{t.stats.memberSince}</span>
              <span className="inline-flex size-8 items-center justify-center rounded-lg bg-secondary text-primary">
                <CalendarDays className="size-4" />
              </span>
            </div>
            <p className="mt-2 text-lg font-bold tracking-tight text-foreground sm:text-xl">{memberDate}</p>
          </div>
        </StaggerItem>
      </Stagger>

      {/* Edit details */}
      <FadeIn className="surface max-w-2xl space-y-6 p-6 sm:p-7">
        <SectionHeading icon={UserRound} title={t.edit.title} description={t.edit.description} />

        <form onSubmit={handleUpdateName} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-sm font-semibold text-foreground">
              {t.edit.label}
            </Label>
            <Input
              id="displayName"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              placeholder={t.edit.placeholder}
              className="h-11 rounded-xl border-input bg-card text-base shadow-xs md:text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-foreground">
              {t.edit.email}
            </Label>
            <Input
              id="email"
              value={session?.user?.email ?? ""}
              disabled
              className="h-11 rounded-xl bg-muted text-base md:text-sm"
            />
            <p className="text-xs text-muted-foreground">{t.edit.emailHint}</p>
          </div>

          <Button type="submit" className="h-10 w-full sm:w-auto" disabled={savingName || nameUnchanged}>
            {savingName ? (
              <>
                <Loader2 className="animate-spin" />
                {t.edit.saving}
              </>
            ) : (
              <>
                <Save />
                {t.edit.save}
              </>
            )}
          </Button>
        </form>
      </FadeIn>
    </div>
  )
}
