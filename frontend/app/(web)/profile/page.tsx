"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  User,
  Mail,
  Calendar,
  Heart,
  TestTube2,
  Trash2,
  ArrowRight,
  Loader2,
  Save,
  CheckCircle2,
  AlertCircle,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"
import {
  fetchUserProfile,
  updateUserProfile,
  fetchFavorites,
  removeFavorite,
} from "@/lib/api"
import type { Crop } from "@/types"

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, isPending: sessionPending } = authClient.useSession()

  const [profile, setProfile] = useState<any>(null)
  const [favorites, setFavorites] = useState<Crop[]>([])
  const [loading, setLoading] = useState(true)
  const [editingName, setEditingName] = useState("")
  const [savingName, setSavingName] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

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
    setSaveSuccess(false)
    try {
      const updated = await updateUserProfile({ name: editingName })
      setProfile((prev: any) => ({ ...prev, name: updated.name }))
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error("Failed to update profile", err)
    } finally {
      setSavingName(false)
    }
  }

  const handleRemoveFavorite = async (cropId: string) => {
    try {
      await removeFavorite(cropId)
      setFavorites((prev) => prev.filter((c) => c.id !== cropId))
    } catch (err) {
      console.error("Failed to remove favorite", err)
    }
  }

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push("/")
    router.refresh()
  }

  if (sessionPending || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="text-xs">กำลังโหลดข้อมูลโปรไฟล์...</p>
        </div>
      </div>
    )
  }

  const memberDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "เมื่อเร็วๆ นี้"

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 sm:py-14 animate-fade-in-up space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white text-2xl font-extrabold shadow-md">
            {profile?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {profile?.name || session?.user?.name || "เกษตรกร Plantable"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              {session?.user?.email}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 self-start sm:self-auto text-xs font-semibold"
        >
          <LogOut className="mr-1.5 h-3.5 w-3.5" />
          ออกจากระบบ
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <TestTube2 className="h-3.5 w-3.5 text-emerald-600" />
            จำนวนการวิเคราะห์ดิน
          </span>
          <p className="text-3xl font-black text-foreground">
            {profile?._count?.analyses ?? 0}
          </p>
          <Link
            href="/history"
            className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold hover:underline inline-flex items-center gap-1 pt-1"
          >
            ดูประวัติทั้งหมด
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Heart className="h-3.5 w-3.5 text-rose-500" />
            พืชที่บันทึกเป็นรายการโปรด
          </span>
          <p className="text-3xl font-black text-foreground">
            {favorites.length}
          </p>
          <span className="text-[11px] text-muted-foreground block pt-1">
            พร้อมดูเกณฑ์ธาตุอาหารทันที
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-blue-500" />
            สมาชิกตั้งแต่
          </span>
          <p className="text-sm font-bold text-foreground mt-2">
            {memberDate}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold block pt-1">
            สถานะบัญชี: ยืนยันแล้ว
          </span>
        </div>
      </div>

      {/* Edit Profile Section */}
      <div className="rounded-2xl border bg-card p-6 sm:p-7 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <User className="h-4 w-4 text-emerald-600" />
          แก้ไขข้อมูลส่วนตัว
        </h3>

        <form onSubmit={handleUpdateName} className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-xs font-bold text-foreground">
              ชื่อที่แสดง (Display Name)
            </Label>
            <Input
              id="displayName"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              placeholder="ระบุชื่อของคุณ"
              className="text-sm focus-visible:ring-emerald-600"
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              size="sm"
              disabled={savingName}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs"
            >
              {savingName ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  กำลังบันทึก...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Save className="h-3.5 w-3.5" />
                  บันทึกการเปลี่ยนแปลง
                </span>
              )}
            </Button>

            {saveSuccess && (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 animate-fade-in">
                <CheckCircle2 className="h-4 w-4" />
                อัปเดตข้อมูลสำเร็จ
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Favorite Crops Section */}
      <div className="rounded-2xl border bg-card p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
            พืชที่คุณติดตาม ({favorites.length})
          </h3>
          <Link
            href="/crops"
            className="text-xs font-semibold text-primary hover:underline"
          >
            ค้นหาพืชเพิ่มเติม
          </Link>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-8 border border-dashed rounded-xl text-muted-foreground space-y-2">
            <p className="text-xs">ยังไม่มีพืชในรายการโปรด</p>
            <Link href="/crops">
              <Button size="sm" variant="outline" className="text-xs">
                สำรวจพืชทั้งหมด 12 ชนิด
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {favorites.map((crop) => (
              <div
                key={crop.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-border/70 hover:border-emerald-300 bg-muted/20 hover-lift"
              >
                <div>
                  <Link
                    href={`/crops/${crop.id}`}
                    className="font-bold text-sm text-foreground hover:text-primary transition-colors"
                  >
                    {crop.nameTh}
                  </Link>
                  <p className="text-[11px] text-muted-foreground">
                    {crop.name} • {crop.category}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <Link href={`/crops/${crop.id}`}>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                      ดูคู่มือ
                    </Button>
                  </Link>
                  <button
                    onClick={() => handleRemoveFavorite(crop.id)}
                    title="ลบออกจากรายการโปรด"
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
