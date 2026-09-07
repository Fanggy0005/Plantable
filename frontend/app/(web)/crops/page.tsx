"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Search, Sprout, Tag, ArrowRight, BookOpen, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { fetchCrops } from "@/lib/api"
import type { Crop } from "@/types"

export default function CropsCatalogPage() {
  const [crops, setCrops] = useState<Crop[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")

  useEffect(() => {
    async function loadCrops() {
      setLoading(true)
      try {
        const data = await fetchCrops({
          search: search || undefined,
          category: category !== "All" ? category : undefined,
        })
        setCrops(data)
      } catch (err) {
        console.error("Failed to fetch crops", err)
      } finally {
        setLoading(false)
      }
    }

    const timeout = setTimeout(loadCrops, 200)
    return () => clearTimeout(timeout)
  }, [search, category])

  const categories = ["All", "Grain", "Cash Crop", "Fruit", "Vegetable"]

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14 animate-fade-in-up space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
          <BookOpen className="h-3.5 w-3.5" />
          ฐานข้อมูลพืชและการเพาะปลูก
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          สารบบพืชและเกณฑ์ความต้องการธาตุอาหาร
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          รวบรวมเกณฑ์ความต้องการธาตุอาหาร ไนโตรเจน (N), ฟอสฟอรัส (P), โพแทสเซียม (K) และค่าความเป็นกรด-ด่าง (pH) ที่เหมาะสมที่สุดของพืชเศรษฐกิจสำคัญ 12 ชนิด
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อพืช เช่น ข้าว, ข้าวโพด, ทุเรียน..."
            className="pl-9 bg-card border-border focus-visible:ring-emerald-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => {
            const isActive = category === cat
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat === "All" ? "ทุกหมวดหมู่" : cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* Crops Grid */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="text-xs">กำลังโหลดข้อมูลพืช...</p>
          </div>
        </div>
      ) : crops.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-dashed text-muted-foreground">
          <Sprout className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
          <p className="font-semibold text-sm">ไม่พบพืชที่ตรงกับคำค้นหา</p>
          <p className="text-xs mt-1">ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่น</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {crops.map((crop) => {
            const req = crop.requirement
            return (
              <div
                key={crop.id}
                className="group rounded-2xl bg-card border border-border/80 p-5 shadow-xs hover-lift flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                        {crop.nameTh}
                      </h3>
                      <p className="text-xs font-medium text-muted-foreground">
                        {crop.name}
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-200/60">
                      <Tag className="h-3 w-3" />
                      {crop.category}
                    </span>
                  </div>

                  {crop.scientificName && (
                    <p className="text-xs italic text-muted-foreground font-mono">
                      {crop.scientificName}
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {crop.description}
                  </p>

                  {/* Requirements Snapshot */}
                  {req && (
                    <div className="pt-2 border-t border-border/40 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                      <div className="rounded-lg bg-muted/30 p-2">
                        <span className="block text-[10px] uppercase font-bold text-foreground">
                          N ไนโตรเจน
                        </span>
                        <span>{req.nitrogenMin}-{req.nitrogenMax} mg/kg</span>
                      </div>
                      <div className="rounded-lg bg-muted/30 p-2">
                        <span className="block text-[10px] uppercase font-bold text-foreground">
                          P ฟอสฟอรัส
                        </span>
                        <span>{req.phosphorusMin}-{req.phosphorusMax} mg/kg</span>
                      </div>
                      <div className="rounded-lg bg-muted/30 p-2">
                        <span className="block text-[10px] uppercase font-bold text-foreground">
                          K โพแทสเซียม
                        </span>
                        <span>{req.potassiumMin}-{req.potassiumMax} mg/kg</span>
                      </div>
                      <div className="rounded-lg bg-muted/30 p-2">
                        <span className="block text-[10px] uppercase font-bold text-foreground">
                          pH ที่เหมาะสม
                        </span>
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                          {req.phMin} - {req.phMax}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-border/40">
                  <Link href={`/crops/${crop.id}`} className="w-full block">
                    <button className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-muted/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                      ดูคู่มือการปลูกฉบับเต็ม
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
