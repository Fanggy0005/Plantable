"use client"

import { TestTube2 } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { SoilInputForm } from "@/features/soil-analysis/components/SoilInputForm"
import { soilAnalysisMessages } from "@/features/soil-analysis/messages"
import { useT } from "@/lib/i18n"

export default function AnalyzePage() {
  const t = useT(soilAnalysisMessages)

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full bg-dot-grid">
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
        <PageHeader
          eyebrow={t.page.eyebrow}
          icon={TestTube2}
          title={t.page.title}
          description={t.page.description}
        />
        <SoilInputForm />
      </div>
    </div>
  )
}
