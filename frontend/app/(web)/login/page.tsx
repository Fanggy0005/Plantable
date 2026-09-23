"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { ArrowRight, Loader2, Mail } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { useT } from "@/lib/i18n"
import { AuthShell, FormError, IconField } from "@/features/auth/components/AuthShell"
import { PasswordField } from "@/features/auth/components/PasswordField"
import { authMessages } from "@/features/auth/messages"

export default function LoginPage() {
  const router = useRouter()
  const t = useT(authMessages)
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
      setError(error.message || t.login.invalid)
      setLoading(false)
      return
    }

    toast.success(t.login.success)
    router.push("/history")
    router.refresh()
  }

  return (
    <AuthShell
      title={t.login.title}
      description={t.login.description}
      footer={
        <p>
          {t.login.noAccount}{" "}
          <Link href="/register" className="font-semibold text-primary underline-offset-4 hover:underline">
            {t.login.toRegister}
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormError message={error} />

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

        <PasswordField
          id="password"
          autoComplete="current-password"
          label={t.fields.password}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button type="submit" size="lg" className="group h-11 w-full text-base font-semibold" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="animate-spin" />
              {t.login.submitting}
            </>
          ) : (
            <>
              {t.login.submit}
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </Button>
      </form>
    </AuthShell>
  )
}
