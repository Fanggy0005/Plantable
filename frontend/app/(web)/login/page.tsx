"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Sprout, Mail, Lock, Loader2, ArrowRight } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error } = await authClient.signIn.email({
      email,
      password,
    })

    if (error) {
      setError(error.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง")
      setLoading(false)
      return
    }

    router.push("/history")
    router.refresh()
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 animate-fade-in-up">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Sprout className="h-6 w-6 text-emerald-300" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            เข้าสู่ระบบ Plantable
          </h1>
          <p className="text-xs text-muted-foreground">
            บันทึกและซิงค์ประวัติผลวิเคราะห์ดินของคุณบนคลาวด์
          </p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border bg-card p-6 sm:p-8 shadow-xs space-y-4"
        >
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 text-rose-800 dark:text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-bold text-foreground">
              อีเมล (Email)
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-9 text-sm focus-visible:ring-emerald-600"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-bold text-foreground">
                รหัสผ่าน (Password)
              </Label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-9 text-sm focus-visible:ring-emerald-600"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-5 rounded-xl shadow-xs transition-all hover:scale-[1.01]"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                กำลังเข้าสู่ระบบ...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                เข้าสู่ระบบ
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>

          <div className="pt-2 text-center text-xs text-muted-foreground">
            ยังไม่มีบัญชีผู้ใช้?{" "}
            <Link
              href="/register"
              className="font-bold text-primary hover:underline"
            >
              สมัครสมาชิกฟรี
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
