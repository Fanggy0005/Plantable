"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "motion/react"
import { toast } from "sonner"
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  History,
  LogIn,
  LogOut,
  Menu,
  Sprout,
  TestTube2,
  User,
  UserPlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher"
import { layoutMessages } from "@/components/layout/messages"
import { authClient } from "@/lib/auth-client"
import { useT } from "@/lib/i18n"
import { cn } from "@/lib/utils"

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

function Brand({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/" onClick={onClick} className="group flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center rounded-xl bg-forest-accent text-forest shadow-[0_0_18px_-2px_var(--forest-accent)] transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-6">
        <Sprout className="size-5" />
      </span>
      <span className="text-lg font-bold tracking-tight text-forest-foreground">Plantable</span>
    </Link>
  )
}

function UserInitial({ name, className }: { name?: string | null; className?: string }) {
  return (
    <span
      className={cn(
        "flex size-7 items-center justify-center rounded-full bg-forest-accent text-xs font-bold text-forest",
        className
      )}
    >
      {name?.[0]?.toUpperCase() || "U"}
    </span>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const t = useT(layoutMessages)
  const { data: session, isPending } = authClient.useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const user = session?.user

  const navItems = [
    { href: "/analyze", label: t.nav.analyze, icon: TestTube2 },
    { href: "/crops", label: t.nav.crops, icon: BookOpen },
    { href: "/history", label: t.nav.history, icon: History },
    { href: "/analytics", label: t.nav.analytics, icon: BarChart3 },
  ]

  const handleSignOut = async () => {
    await authClient.signOut()
    setMobileOpen(false)
    toast.success(t.account.loggedOut)
    router.push("/")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-forest-border/70 bg-forest/90 text-forest-foreground backdrop-blur-xl supports-backdrop-filter:bg-forest/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Brand />

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const active = isActivePath(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                  active ? "text-forest-foreground" : "text-forest-muted hover:text-forest-foreground"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-full bg-forest-elevated ring-1 ring-forest-border"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <item.icon className={cn("relative size-4", active && "text-forest-accent")} />
                <span className="relative">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          {/* Desktop account */}
          <div className="hidden items-center gap-2 md:flex">
            {isPending ? (
              <div className="size-9 animate-pulse rounded-full bg-forest-elevated" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="flex items-center gap-2 rounded-full border border-forest-border bg-forest-elevated/60 py-1 pr-2.5 pl-1 text-sm font-medium text-forest-foreground transition-colors outline-none hover:border-forest-accent/50 focus-visible:ring-2 focus-visible:ring-forest-accent/50"
                >
                  <UserInitial name={user.name} />
                  <span className="max-w-28 truncate">{user.name || user.email}</span>
                  <ChevronDown className="size-3.5 text-forest-muted" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={8} className="w-60">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>
                      <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                      <p className="truncate text-xs font-normal text-muted-foreground">{user.email}</p>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem render={<Link href="/profile" />}>
                    <User />
                    {t.account.profile}
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/history" />}>
                    <History />
                    {t.account.history}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                    <LogOut />
                    {t.account.logout}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  render={<Link href="/login" />}
                  nativeButton={false}
                  className="text-forest-muted hover:bg-forest-elevated hover:text-forest-foreground"
                >
                  {t.account.login}
                </Button>
                <Button
                  size="sm"
                  render={<Link href="/register" />}
                  nativeButton={false}
                  className="bg-forest-accent font-semibold text-forest hover:bg-forest-accent/90"
                >
                  {t.account.register}
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t.openMenu}
                  className="text-forest-foreground hover:bg-forest-elevated hover:text-forest-foreground md:hidden"
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[86%] max-w-sm gap-0 border-l-0 p-0">
              <SheetHeader className="bg-forest-gradient p-5 pr-14 text-forest-foreground">
                <SheetTitle className="sr-only">{t.menu}</SheetTitle>
                <Brand onClick={() => setMobileOpen(false)} />
                {user && (
                  <div className="mt-4 flex items-center gap-3 rounded-2xl bg-forest-elevated/70 p-3 ring-1 ring-forest-border">
                    <UserInitial name={user.name} className="size-10 text-sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{user.name}</p>
                      <p className="truncate text-xs text-forest-muted">{user.email}</p>
                    </div>
                  </div>
                )}
              </SheetHeader>

              <nav className="flex flex-col gap-1 p-3">
                {[...navItems, ...(user ? [{ href: "/profile", label: t.account.profile, icon: User }] : [])].map(
                  (item, i) => {
                    const active = isActivePath(pathname, item.href)
                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 + i * 0.04 }}
                      >
                        <SheetClose
                          render={<Link href={item.href} />}
                          nativeButton={false}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium transition-colors",
                            active
                              ? "bg-secondary text-primary"
                              : "text-foreground hover:bg-muted"
                          )}
                        >
                          <span
                            className={cn(
                              "flex size-9 items-center justify-center rounded-lg",
                              active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            )}
                          >
                            <item.icon className="size-4.5" />
                          </span>
                          {item.label}
                        </SheetClose>
                      </motion.div>
                    )
                  }
                )}
              </nav>

              <SheetFooter className="border-t border-border p-4">
                {user ? (
                  <Button variant="destructive" size="lg" className="w-full" onClick={handleSignOut}>
                    <LogOut />
                    {t.account.logout}
                  </Button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <SheetClose
                      render={<Button variant="outline" size="lg" render={<Link href="/login" />} nativeButton={false} />}
                      nativeButton={false}
                    >
                      <LogIn />
                      {t.account.login}
                    </SheetClose>
                    <SheetClose
                      render={<Button size="lg" render={<Link href="/register" />} nativeButton={false} />}
                      nativeButton={false}
                    >
                      <UserPlus />
                      {t.account.register}
                    </SheetClose>
                  </div>
                )}
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
