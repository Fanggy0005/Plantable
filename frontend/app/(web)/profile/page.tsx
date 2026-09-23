"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import { toast } from "sonner"
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Heart,
  Loader2,
  LogOut,
  Mail,
  Save,
  Search,
  TestTube2,
  Trash2,
  UserRound,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { FadeIn, Stagger, StaggerItem } from "@/components/motion"
import { CropIcon } from "@/components/shared/CropIcon"
import { SectionHeading } from "@/components/shared/PageHeader"
import { StatCard } from "@/components/shared/StatCard"
import { EmptyState } from "@/components/shared/States"
import { authClient } from "@/lib/auth-client"
import {
  fetchUserProfile,
  updateUserProfile,
  fetchFavorites,
  removeFavorite,
} from "@/lib/api"
import { useFormat, useT } from "@/lib/i18n"
import { commonMessages } from "@/lib/i18n/messages/common"
import { profileMessages } from "@/features/profile/messages"
import type { Crop } from "@/types"

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
  const c = useT(commonMessages)
  const fmt = useFormat()
  const { data: session, isPending: sessionPending } = authClient.useSession()

  const [profile, setProfile] = useState<any>(null)
  const [favorites, setFavorites] = useState<Crop[]>([])
  const [loading, setLoading] = useState(true)
  const [editingName, setEditingName] = useState("")
  const [savingName, setSavingName] = useState(false)

  useEffect(() => {
    if (!sessionPending && !session?.user) {
      router.push("/login")
      return
    }

    if (session?.user) {
      loadData()
    }
  }, [session, sessionPending, router])

  const loadData = async () => {
    setLoading(true)
    try {
      const [profileData, favData] = await Promise.all([
        fetchUserProfile().catch(() => null),
        fetchFavorites().catch(() => []),
      ])

      if (profileData) {
        setProfile(profileData)
        setEditingName(profileData.name || "")
      }
      setFavorites(favData)
    } catch (e) {
      console.error("Failed to load profile data", e)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingName(true)
    try {
      const updated = await updateUserProfile({ name: editingName })
      setProfile((prev: any) => ({ ...prev, name: updated.name }))
      toast.success(t.edit.saved)
    } catch (err) {
      console.error("Failed to update profile", err)
      toast.error(t.edit.failed)
    } finally {
      setSavingName(false)
    }
  }

  const handleRemoveFavorite = async (crop: Crop) => {
    try {
      const ok = await removeFavorite(crop.id)
      if (!ok) throw new Error("Remove favorite failed")
      setFavorites((prev) => prev.filter((f) => f.id !== crop.id))
      toast.success(t.favorites.removed(fmt.pick(crop.nameTh, crop.name)))
    } catch (err) {
      console.error("Failed to remove favorite", err)
      toast.error(t.favorites.removeFailed)
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
      <Stagger immediate className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StaggerItem>
          <StatCard
            label={t.stats.analyses}
            value={profile?._count?.analyses ?? 0}
            icon={TestTube2}
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
          <StatCard label={t.stats.favorites} value={favorites.length} icon={Heart} />
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

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_1.4fr]">
        {/* Edit details */}
        <FadeIn className="surface space-y-6 p-6 sm:p-7">
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

        {/* Favorites */}
        <FadeIn delay={0.05} className="surface space-y-5 p-6 sm:p-7">
          <SectionHeading
            icon={Heart}
            title={`${t.favorites.title} (${favorites.length})`}
            description={t.favorites.description}
            actions={
              favorites.length > 0 && (
                <Button variant="ghost" size="sm" render={<Link href="/crops" />} nativeButton={false}>
                  <Search />
                  {t.favorites.browse}
                </Button>
              )
            }
          />

          {favorites.length === 0 ? (
            <EmptyState
              icon={Heart}
              title={t.favorites.emptyTitle}
              description={t.favorites.emptyBody}
              action={
                <Button render={<Link href="/crops" />} nativeButton={false}>
                  {t.favorites.emptyAction}
                  <ArrowRight />
                </Button>
              }
            />
          ) : (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <AnimatePresence initial={false}>
                {favorites.map((crop) => {
                  const name = fmt.pick(crop.nameTh, crop.name)
                  const secondary = fmt.locale === "th" ? crop.name : crop.nameTh
                  return (
                    <motion.li
                      key={crop.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                      className="group relative flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/25 hover:bg-secondary/40"
                    >
                      <CropIcon name={crop.name} category={crop.category} />
                      <Link
                        href={`/crops/${crop.id}`}
                        className="min-w-0 flex-1 after:absolute after:inset-0 after:rounded-xl"
                        aria-label={`${t.favorites.open}: ${name}`}
                      >
                        <p className="truncate text-sm font-bold text-foreground">{name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {secondary} · {c.categories[crop.category] ?? crop.category}
                        </p>
                      </Link>
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="relative z-10 size-10 text-muted-foreground hover:bg-danger-soft hover:text-destructive"
                              onClick={() => handleRemoveFavorite(crop)}
                              aria-label={t.favorites.remove}
                            />
                          }
                        >
                          <Trash2 />
                        </TooltipTrigger>
                        <TooltipContent>{t.favorites.remove}</TooltipContent>
                      </Tooltip>
                    </motion.li>
                  )
                })}
              </AnimatePresence>
            </ul>
          )}
        </FadeIn>
      </div>
    </div>
  )
}
