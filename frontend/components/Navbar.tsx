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
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 transition-colors">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm group-hover:scale-105 transition-transform duration-200">
            <Sprout className="h-5 w-5 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-foreground">Plantable</span>
              <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:text-emerald-300">
                Phase 2
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
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
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </span>
              </Link>
            )
          })}

          {/* User Section */}
          <div className="ml-2 pl-2 border-l border-border/80 flex items-center gap-2">
            {isPending ? (
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            ) : session?.user ? (
              <div className="flex items-center gap-2">
                <Link href="/profile">
                  <span
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                      pathname === "/profile"
                        ? "bg-emerald-50 dark:bg-emerald-950 text-primary border-emerald-300"
                        : "bg-card border-border hover:border-emerald-300 text-foreground"
                    }`}
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px]">
                      {session.user.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <span className="hidden md:inline max-w-[100px] truncate">
                      {session.user.name || session.user.email}
                    </span>
                  </span>
                </Link>

                <button
                  onClick={handleSignOut}
                  title="ออกจากระบบ"
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-xs font-semibold">
                    เข้าสู่ระบบ
                  </Button>
                </Link>
                <Link href="/register" className="hidden sm:block">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-xs">
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
