import { describe, expect, it } from "bun:test"
import { Elysia } from "elysia"
import { prisma } from "../src/config/db"
import { soilImprovementRoutes } from "../src/routes/soil-improvement.routes"
import { uploadRoutes } from "../src/routes/upload.routes"
import { analysisRoutes } from "../src/routes/analysis.routes"
import {
  soilImprovementService,
  classifyNutrientStatus,
  calculatePhCorrection,
  calculateFertilizerPlan,
} from "../src/services/soil-improvement.service"
import { ocrService } from "../src/services/ocr.service"
import { uploadService } from "../src/services/upload.service"
import { cropRepository } from "../src/repositories/crop.repository"
import { analysisRepository } from "../src/repositories/analysis.repository"

const app = new Elysia()
  .use(soilImprovementRoutes)
  .use(uploadRoutes)
  .use(analysisRoutes)

describe("Phase 3 - Smart Features (Soil Improvement & OCR) Test Suite", () => {
  // ==========================================
  // 1. Pure Unit Tests: Soil Improvement Logic
  // ==========================================
  describe("Soil Improvement Service - Pure Calculations", () => {
    it("should classify nutrient status across all 5 tiers accurately", () => {
      // min: 100, max: 200
      expect(classifyNutrientStatus(50, 100, 200).status).toBe("severe_deficiency")
      expect(classifyNutrientStatus(85, 100, 200).status).toBe("mild_deficiency")
      expect(classifyNutrientStatus(150, 100, 200).status).toBe("optimal")
      expect(classifyNutrientStatus(220, 100, 200).status).toBe("mild_excess")
      expect(classifyNutrientStatus(300, 100, 200).status).toBe("severe_excess")
    })

    it("should calculate pH correction doses accurately for acidic and alkaline soils", () => {
      // Strongly acidic (pH 4.2)
      const strongAcid = calculatePhCorrection(4.2)
      expect(strongAcid.category).toBe("strongly_acidic")
      expect(strongAcid.dosageKgPerRai).toBe(400)
      expect(strongAcid.recommendedMaterial).toContain("โดโลไมท์")

      // Moderately acidic (pH 5.0)
      const modAcid = calculatePhCorrection(5.0)
      expect(modAcid.category).toBe("moderately_acidic")
      expect(modAcid.dosageKgPerRai).toBe(200)

      // Optimal (pH 6.5)
      const optimal = calculatePhCorrection(6.5)
      expect(optimal.category).toBe("optimal")
      expect(optimal.dosageKgPerRai).toBe(0)

      // Alkaline (pH 8.2)
      const alkaline = calculatePhCorrection(8.2)
      expect(alkaline.category).toBe("alkaline")
      expect(alkaline.dosageKgPerRai).toBe(150)
      expect(alkaline.recommendedMaterial).toContain("ยิปซัมเกษตร")
    })

    it("should recommend targeted high-P formula when phosphorus is critically deficient", () => {
      const schedule = calculateFertilizerPlan({
        nitrogen: 120,
        phosphorus: 10, // Deficit > 30 from optimal 50
        potassium: 70,
        ph: 6.5,
      })

      const basal = schedule.find((s) => s.stage.includes("รองพื้น"))
      expect(basal).toBeDefined()
      expect(basal?.formula).toContain("18-46-0")
    })

    it("should advise against high nitrogen application when soil nitrogen is excessive", () => {
      const schedule = calculateFertilizerPlan({
        nitrogen: 210, // Highly excessive
        phosphorus: 50,
        potassium: 70,
        ph: 6.5,
      })

      const vegStage = schedule.find((s) => s.stage.includes("เจริญเติบโต"))
      expect(vegStage).toBeDefined()
      expect(vegStage?.formula).toContain("งดใส่ปุ๋ยไนโตรเจน")
    })

    it("should generate comprehensive soil improvement plan with symptoms and eco alternatives", () => {
      const plan = soilImprovementService.generatePlan({
        nitrogen: 45,
        phosphorus: 15,
        potassium: 30,
        ph: 4.5,
      })

      expect(plan.soilHealthScore).toBeLessThan(50)
      expect(plan.diagnostics.length).toBe(4)
      expect(plan.fertilizerRecommendations.length).toBeGreaterThanOrEqual(2)
      expect(plan.organicAlternatives.length).toBeGreaterThanOrEqual(4)
      expect(plan.phCorrection.dosageKgPerRai).toBeGreaterThan(0)
      expect(plan.generalTipsTh.length).toBeGreaterThanOrEqual(1)
    })
  })

  // ==========================================
  // 2. OCR Lab Report Parsing Logic
  // ==========================================
  describe("OCR Extraction Engine - Regex and Stream Parsing", () => {
    it("should accurately parse Thai Land Development Department (LDD) format", () => {
      const thaiReportText = `
        ใบรายงานผลการตรวจวิเคราะห์ตัวอย่างดิน
        กรมพัฒนาที่ดิน กระทรวงเกษตรและสหกรณ์
        ชื่อเกษตรกร: นายมานะ ปลูกสุข
        สถานที่เก็บตัวอย่าง: ต.หนองสาหร่าย อ.ปากช่อง จ.นครราชสีมา
        
        รายการวิเคราะห์ (Parameter)        ผลวิเคราะห์ (Result)   หน่วย (Unit)
        ความเป็นกรด-ด่าง (Soil pH 1:1)       6.2
        ไนโตรเจนทั้งหมด (Total Nitrogen)     135.0                 mg/kg
        ฟอสฟอรัสที่เป็นประโยชน์ (Bray II)     42.5                  mg/kg
        โพแทสเซียมที่แลกเปลี่ยนได้ (Exch. K)   68.0                  mg/kg
        อินทรียวัตถุในดิน (Organic Matter)   2.1                   %
        ความชื้นของตัวอย่าง (Moisture)       12.4                  %
      `

      const extracted = ocrService.parseSoilDataFromText(thaiReportText)

      expect(extracted.ph).toBe(6.2)
      expect(extracted.nitrogen).toBe(135.0)
      expect(extracted.phosphorus).toBe(42.5)
      expect(extracted.potassium).toBe(68.0)
      expect(extracted.organicMatter).toBe(2.1)
      expect(extracted.moisture).toBe(12.4)
      expect(extracted.confidence.overall).toBeGreaterThanOrEqual(0.9)
    })

    it("should accurately parse English agricultural lab format", () => {
      const engReportText = `
        CENTRAL AGRICULTURAL LABORATORY REPORT
        Sample ID: SL-2026-9081
        Client: Green Field Farms
        
        Analytical Chemistry Results:
        pH: 5.75
        Available N: 85.0 ppm
        Available P: 28.0 ppm
        Exchangeable K: 55.0 ppm
        Organic Matter: 1.45%
      `

      const extracted = ocrService.parseSoilDataFromText(engReportText)

      expect(extracted.ph).toBe(5.75)
      expect(extracted.nitrogen).toBe(85.0)
      expect(extracted.phosphorus).toBe(28.0)
      expect(extracted.potassium).toBe(55.0)
      expect(extracted.organicMatter).toBe(1.45)
    })
  })

  // ==========================================
  // 3. API Integration Tests (Elysia Endpoints)
  // ==========================================
  describe("API Integration Endpoints for Phase 3", () => {
    it("POST /api/soil-improvement should return full improvement plan", async () => {
      const res = await app.handle(
        new Request("http://localhost/api/soil-improvement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nitrogen: 110,
            phosphorus: 40,
            potassium: 60,
            ph: 6.2,
          }),
        })
      )

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data.soilHealthScore).toBeGreaterThan(0)
      expect(json.data.diagnostics).toBeDefined()
      expect(json.data.fertilizerRecommendations).toBeDefined()
      expect(json.data.phCorrection).toBeDefined()
    })

    it("POST /api/soil-improvement with cropId should tailor plan to crop requirement", async () => {
      const crops = await cropRepository.findAll()
      expect(crops.length).toBeGreaterThan(0)
      const testCrop = crops[0]

      const res = await app.handle(
        new Request("http://localhost/api/soil-improvement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nitrogen: 70,
            phosphorus: 20,
            potassium: 35,
            ph: 5.2,
            cropId: testCrop.id,
          }),
        })
      )

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data.cropId).toBe(testCrop.id)
      expect(json.data.cropNameTh).toBe(testCrop.nameTh)
    })

    it("GET /api/analyses/:id/soil-improvement should return plan for stored analysis", async () => {
      const crops = await cropRepository.findAll()
      const analysis = await analysisRepository.createWithRecommendations(
        { nitrogen: 100, phosphorus: 50, potassium: 50, ph: 6.5 },
        [
          {
            cropId: crops[0].id,
            cropName: crops[0].name,
            cropNameTh: crops[0].nameTh,
            category: crops[0].category,
            score: 90,
            level: "Excellent",
            breakdown: { nitrogen: 90, phosphorus: 90, potassium: 90, ph: 90 },
            reasons: ["Optimal"],
            improvementSuggestions: [],
          },
        ]
      )

      const res = await app.handle(
        new Request(`http://localhost/api/analyses/${analysis.id}/soil-improvement`)
      )

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data.diagnostics).toBeDefined()

      // Cleanup
      await prisma.soilAnalysis.delete({ where: { id: analysis.id } })
    })

    it("POST /api/ocr with direct text payload should parse successfully", async () => {
      const sampleScanText = `
        ผลวิเคราะห์ดินทางการเกษตร
        pH: 6.4
        Total N: 125 mg/kg
        Available P: 45 mg/kg
        Exchangeable K: 60 mg/kg
      `

      const res = await app.handle(
        new Request("http://localhost/api/ocr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: sampleScanText, title: "Test Scan" }),
        })
      )

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data.ph).toBe(6.4)
      expect(json.data.nitrogen).toBe(125)
      expect(json.data.phosphorus).toBe(45)
      expect(json.data.potassium).toBe(60)
      expect(json.data.fileId).toBeDefined()

      // Cleanup uploaded report
      if (json.data.fileId) {
        await prisma.uploadedReport.delete({ where: { id: json.data.fileId } })
      }
    })

    it("POST /api/uploads and POST /api/ocr by fileId workflow", async () => {
      // Create a test synthetic report via UploadService
      const sampleText = `
        LABORATORY TEST REPORT
        Sample #991
        pH: 6.1
        Available N: 110 mg/kg
        Available P: 38 mg/kg
        Exchangeable K: 52 mg/kg
      `
      const testBlob = new Blob([sampleText], { type: "application/pdf" })
      const uploaded = await uploadService.handleFileUpload(testBlob, "lab-test-sample.pdf")

      expect(uploaded.fileId).toBeDefined()
      expect(uploaded.fileType).toBe("pdf")

      // Now call POST /api/ocr using fileId
      const resOcr = await app.handle(
        new Request("http://localhost/api/ocr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileId: uploaded.fileId }),
        })
      )

      expect(resOcr.status).toBe(200)
      const jsonOcr = await resOcr.json()
      expect(jsonOcr.success).toBe(true)
      expect(jsonOcr.data.ph).toBe(6.1)
      expect(jsonOcr.data.nitrogen).toBe(110)

      // Cleanup
      await prisma.uploadedReport.delete({ where: { id: uploaded.fileId } })
    })
  })
})
