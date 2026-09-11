"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Sprout,
  TestTube2,
  BookOpen,
  History,
  User,
  LogOut,
  Sparkles,
  BarChart3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push("/")
    router.refresh()
  }

  const navItems = [
    { href: "/analyze", label: "วิเคราะห์ดิน", icon: TestTube2 },
    { href: "/crops", label: "ฐานข้อมูลพืช", icon: BookOpen },
    { href: "/history", label: "ประวัติการตรวจ", icon: History },
    { href: "/analytics", label: "สถิติ & แดชบอร์ด", icon: BarChart3 },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-emerald-950/80 bg-[#071e12]/95 backdrop-blur-md supports-[backdrop-filter]:bg-[#071e12]/90 transition-colors text-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-900/90 border border-emerald-500/40 text-emerald-300 shadow-[0_0_14px_rgba(16,185,129,0.25)] group-hover:scale-105 group-hover:border-emerald-400 transition-all duration-200">
            <Sprout className="h-5 w-5 text-emerald-300 group-hover:rotate-6 transition-transform" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-white">Plantable</span>
              <span className="rounded-full bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                Phase 4
              </span>
            </div>
            <p className="text-[11px] text-emerald-200/70 hidden sm:block">
              ระบบแนะนำพืชตามค่าธาตุอาหารในดิน
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <span
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-emerald-800/60 text-white font-semibold border border-emerald-500/30 shadow-xs backdrop-blur-xs"
                      : "text-emerald-100/75 hover:text-white hover:bg-emerald-900/40"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-emerald-300" : "text-emerald-200/70"}`} />
                  <span className="hidden sm:inline">{item.label}</span>
                </span>
              </Link>
            )
          })}

          {/* User Section */}
          <div className="ml-2 pl-2 border-l border-emerald-900/80 flex items-center gap-2">
            {isPending ? (
              <div className="h-8 w-8 rounded-full bg-emerald-950/80 animate-pulse border border-emerald-800/50" />
            ) : session?.user ? (
              <div className="flex items-center gap-2">
                <Link href="/profile">
                  <span
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      pathname === "/profile"
                        ? "bg-emerald-800/80 text-white border-emerald-400"
                        : "bg-emerald-950/60 border-emerald-800/70 hover:border-emerald-500/60 text-emerald-100 hover:text-white"
                    }`}
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[#071e12] font-black text-[10px]">
                      {session.user.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <span className="hidden md:inline max-w-[100px] truncate text-emerald-100">
                      {session.user.name || session.user.email}
                    </span>
                  </span>
                </Link>

                <button
                  onClick={handleSignOut}
                  title="ออกจากระบบ"
                  className="p-1.5 rounded-lg text-emerald-200/70 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-xs font-semibold text-emerald-100 hover:text-white hover:bg-emerald-900/60">
                    เข้าสู่ระบบ
                  </Button>
                </Link>
                <Link href="/register" className="hidden sm:block">
                  <Button size="sm" className="bg-white hover:bg-emerald-50 text-[#071e12] text-xs font-bold shadow-xs hover:shadow-[0_0_15px_rgba(255,255,255,0.25)] rounded-xl border-none transition-all">
                    สมัครสมาชิก
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
