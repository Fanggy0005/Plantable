"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { ArrowRight, Loader2, Mail, User } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { useT } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { AuthShell, FormError, IconField } from "@/features/auth/components/AuthShell"
import { PasswordField } from "@/features/auth/components/PasswordField"
import { authMessages } from "@/features/auth/messages"

export default function RegisterPage() {
  const router = useRouter()
  const t = useT(authMessages)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (password.length < 6) {
      setError(t.register.tooShort)
      setLoading(false)
      return
    }

    const { error } = await authClient.signUp.email({
      email,
      password,
      name,
    })

    if (error) {
      setError(error.message || t.register.failed)
      setLoading(false)
      return
    }

    toast.success(t.register.success)
    router.push("/analyze")
    router.refresh()
  }

  // 0–3 strength hint based on length only (matches the 6-char rule)
  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3

  return (
    <AuthShell
      title={t.register.title}
      description={t.register.description}
      footer={
        <p>
          {t.register.hasAccount}{" "}
          <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
            {t.register.toLogin}
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormError message={error} />

        <IconField
          id="name"
          type="text"
          autoComplete="name"
          label={t.fields.name}
          icon={User}
          placeholder={t.fields.namePlaceholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <IconField
          id="email"
          type="email"
          autoComplete="email"
          label={t.fields.email}
          icon={Mail}
          placeholder={t.fields.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="space-y-2">
          <PasswordField
            id="password"
            autoComplete="new-password"
            label={t.fields.password}
            hint={t.fields.passwordHint}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="grid grid-cols-3 gap-1.5" aria-hidden>
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={cn(
                  "h-1 rounded-full bg-muted transition-colors duration-300",
                  strength >= step && (strength === 1 ? "bg-destructive" : strength === 2 ? "bg-warning" : "bg-success")
                )}
              />
            ))}
          </div>
        </div>

        <Button type="submit" size="lg" className="group h-11 w-full text-base font-semibold" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="animate-spin" />
              {t.register.submitting}
            </>
          ) : (
            <>
              {t.register.submit}
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </Button>
      </form>
    </AuthShell>
  )
}
