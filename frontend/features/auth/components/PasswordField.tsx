"use client"

import { useState } from "react"
import { Eye, EyeOff, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useT } from "@/lib/i18n"
import { authMessages } from "../messages"
import { IconField } from "./AuthShell"

export function PasswordField(
  props: Omit<React.ComponentProps<typeof IconField>, "icon" | "type" | "trailing">
) {
  const t = useT(authMessages)
  const [visible, setVisible] = useState(false)

  return (
    <IconField
      {...props}
      icon={Lock}
      type={visible ? "text" : "password"}
      trailing={
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? t.fields.hidePassword : t.fields.showPassword}
          aria-pressed={visible}
          className="text-muted-foreground"
        >
          {visible ? <EyeOff /> : <Eye />}
        </Button>
      }
    />
  )
}
