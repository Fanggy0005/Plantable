"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { recommendPlants } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AnalyzePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    ph: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await recommendPlants({
        nitrogen: parseFloat(form.nitrogen),
        phosphorus: parseFloat(form.phosphorus),
        potassium: parseFloat(form.potassium),
        ph: parseFloat(form.ph),
      })

      // เก็บผลไว้ใน sessionStorage แล้ว redirect
      sessionStorage.setItem("plantResult", JSON.stringify(result))
      router.push("/results")
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">วิเคราะห์ดิน</h1>
        <p className="text-sm text-muted-foreground">กรอกค่าผลวิเคราะห์ดินของคุณ</p>

        <div className="space-y-2">
          <Label htmlFor="nitrogen">ไนโตรเจน N (mg/kg)</Label>
          <Input id="nitrogen" name="nitrogen" type="number" value={form.nitrogen} onChange={handleChange} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phosphorus">ฟอสฟอรัส P (mg/kg)</Label>
          <Input id="phosphorus" name="phosphorus" type="number" value={form.phosphorus} onChange={handleChange} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="potassium">โพแทสเซียม K (mg/kg)</Label>
          <Input id="potassium" name="potassium" type="number" value={form.potassium} onChange={handleChange} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ph">ค่า pH</Label>
          <Input id="ph" name="ph" type="number" step="0.1" value={form.ph} onChange={handleChange} required />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "กำลังวิเคราะห์..." : "วิเคราะห์"}
        </Button>
      </form>
    </div>
  )
}
