"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"
import { toast } from "sonner"
import { Heart } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { authClient } from "@/lib/auth-client"
import { addFavorite, removeFavorite, fetchFavorites } from "@/lib/api"
import { useT } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { favoriteMessages } from "../messages"

interface FavoriteButtonProps {
  cropId: string
  className?: string
}

export function FavoriteButton({ cropId, className = "" }: FavoriteButtonProps) {
  const router = useRouter()
  const t = useT(favoriteMessages)
  const { data: session } = authClient.useSession()
  const [isFav, setIsFav] = useState(false)
  const [loading, setLoading] = useState(false)
  // Bumped on each "add" so the burst animation replays
  const [burst, setBurst] = useState(0)

  useEffect(() => {
    if (!session?.user || !cropId) return

    fetchFavorites()
      .then((favs) => {
        setIsFav(favs.some((c) => c.id === cropId))
      })
      .catch(() => {})
  }, [session, cropId])

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session?.user) {
      toast(t.loginTitle, {
        icon: <Heart className="size-4 text-destructive" />,
        action: { label: t.loginAction, onClick: () => router.push("/login") },
      })
      return
    }

    setLoading(true)
    const nextState = !isFav
    setIsFav(nextState) // Optimistic update
    if (nextState) setBurst((b) => b + 1)

    try {
      const ok = nextState ? await addFavorite(cropId) : await removeFavorite(cropId)
      if (!ok) throw new Error("Favorite request failed")
      toast.success(nextState ? t.added : t.removed)
    } catch (err) {
      console.error("Favorite toggle failed:", err)
      setIsFav(!nextState) // Revert on failure
      toast.error(t.failed)
    } finally {
      setLoading(false)
    }
  }

  const label = isFav ? t.remove : t.add

  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        onClick={handleToggle}
        disabled={loading}
        aria-label={label}
        aria-pressed={isFav}
        className={cn(
          "relative inline-flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/30 disabled:opacity-70",
          isFav
            ? "bg-danger-soft text-destructive hover:bg-danger-soft/70"
            : "text-muted-foreground hover:bg-danger-soft hover:text-destructive",
          className
        )}
      >
        <AnimatePresence>
          {burst > 0 && isFav && (
            <motion.span
              key={burst}
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-destructive/40"
              initial={{ opacity: 0.8, scale: 0.6 }}
              animate={{ opacity: 0, scale: 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>
        <motion.span
          key={isFav ? "on" : "off"}
          initial={{ scale: isFav ? 0.5 : 1 }}
          animate={{ scale: 1 }}
          whileTap={{ scale: 0.8 }}
          transition={{ type: "spring", stiffness: 520, damping: 14 }}
          className="inline-flex"
        >
          <Heart className={cn("size-4.5 transition-colors", isFav && "fill-destructive")} />
        </motion.span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
