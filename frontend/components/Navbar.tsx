"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sprout, TestTube2, BookOpen, History } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const pathname = usePathname()

  const navItems = [
    { href: "/analyze", label: "วิเคราะห์ดิน", icon: TestTube2 },
    { href: "/crops", label: "ฐานข้อมูลพืช", icon: BookOpen },
    { href: "/history", label: "ประวัติการวิเคราะห์", icon: History },
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
                Phase 1 MVP
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

          <Link href="/analyze" className="ml-2">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm transition-all hover:scale-[1.02]">
              วิเคราะห์ดินทันที
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}
