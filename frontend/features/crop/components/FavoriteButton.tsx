"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Heart } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { addFavorite, removeFavorite, fetchFavorites } from "@/lib/api"

interface FavoriteButtonProps {
  cropId: string
  className?: string
}

export function FavoriteButton({ cropId, className = "" }: FavoriteButtonProps) {
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const [isFav, setIsFav] = useState(false)
  const [loading, setLoading] = useState(false)

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
      if (confirm("กรุณาเข้าสู่ระบบเพื่อบันทึกพืชในรายการโปรด ต้องการเข้าสู่ระบบตอนนี้หรือไม่?")) {
        router.push("/login")
      }
      return
    }

    setLoading(true)
    const nextState = !isFav
    setIsFav(nextState) // Optimistic update

    try {
      if (nextState) {
        await addFavorite(cropId)
      } else {
        await removeFavorite(cropId)
      }
    } catch (err) {
      console.error("Favorite toggle failed:", err)
      setIsFav(!nextState) // Revert on failure
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      title={isFav ? "นำออกจากรายการโปรด" : "เพิ่มในรายการโปรด"}
      className={`p-1.5 rounded-lg transition-transform active:scale-90 ${
        isFav
          ? "text-rose-500 hover:text-rose-600 bg-rose-50 dark:bg-rose-950/40"
          : "text-muted-foreground/60 hover:text-rose-500 hover:bg-rose-50/50"
      } ${className}`}
    >
      <Heart className={`h-4 w-4 transition-colors ${isFav ? "fill-rose-500" : ""}`} />
    </button>
  )
}
