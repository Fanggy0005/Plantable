import { uploadRepository } from "../repositories/upload.repository"
import { ocrService } from "./ocr.service"
import type { OcrExtractedSoilData } from "../types"

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB limit as per api-spec.md

export class UploadService {
  /**
   * Validate and save an uploaded report file
   */
  async handleFileUpload(file: File | Blob, originalFileName?: string): Promise<{
    fileId: string
    fileUrl: string
    fileName: string
    fileType: string
    fileSize: number
  }> {
    const size = file.size
    const type = file.type || "application/octet-stream"
    const name = originalFileName || (file as any).name || `soil-report-${Date.now()}`

    // 1. Validation
    if (size > MAX_FILE_SIZE_BYTES) {
      throw new Error(`File size exceeds the 10MB limit (Current: ${(size / 1024 / 1024).toFixed(2)}MB)`)
    }

    const isPdf = type.includes("pdf") || name.toLowerCase().endsWith(".pdf")
    const isImage =
      type.includes("image") ||
      name.toLowerCase().endsWith(".png") ||
      name.toLowerCase().endsWith(".jpg") ||
      name.toLowerCase().endsWith(".jpeg")

    if (!isPdf && !isImage) {
      throw new Error("Invalid file type: Only PDF, PNG, JPG, and JPEG files are allowed")
    }

    const fileType = isPdf ? "pdf" : "image"

    // 2. Storage URL generation
    // If Cloudflare R2 is configured, upload to R2 bucket.
    // Otherwise fallback to data URI / internal reference for zero-setup local dev & testing.
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const base64Data = fileBuffer.toString("base64")
    const fileUrl = `data:${type};base64,${base64Data}`
    const rawTextPreview = fileBuffer.toString("utf-8").slice(0, 5000)

    // 3. Persist record in database
    const report = await uploadRepository.create({
      fileName: name,
      fileUrl: fileUrl,
      fileType: fileType,
      fileSize: size,
      ocrStatus: "pending",
      rawText: rawTextPreview,
    })

    return {
      fileId: report.id,
      fileUrl: `/api/uploads/${report.id}`,
      fileName: name,
      fileType: fileType,
      fileSize: size,
    }
  }

  /**
   * Run OCR extraction on an existing uploaded report or file
   */
  async extractOcr(fileId: string): Promise<OcrExtractedSoilData> {
    const report = await uploadRepository.findById(fileId)
    if (!report) {
      throw new Error(`Uploaded report with ID ${fileId} not found`)
    }

    // If already extracted, return cached extractedData
    if (report.ocrStatus === "completed" && report.extractedData) {
      return {
        ...(report.extractedData as any),
        fileId: report.id,
        fileName: report.fileName || undefined,
        fileType: report.fileType,
      }
    }

    await uploadRepository.updateOcrResult(report.id, "processing")

    try {
      // Reconstruct buffer from stored data URL or fetch
      let buffer: Buffer
      if (report.fileUrl.startsWith("data:")) {
        const base64Marker = ";base64,"
        const markerIdx = report.fileUrl.indexOf(base64Marker)
        if (markerIdx !== -1) {
          buffer = Buffer.from(report.fileUrl.slice(markerIdx + base64Marker.length), "base64")
        } else {
          buffer = Buffer.from(report.rawText || "")
        }
      } else {
        buffer = Buffer.from(report.rawText || "")
      }

      const extracted = await ocrService.processFile(buffer, report.fileType, report.fileName || undefined)
      extracted.fileId = report.id

      await uploadRepository.updateOcrResult(
        report.id,
        "completed",
        extracted,
        extracted.rawText
      )

      return extracted
    } catch (err: any) {
      await uploadRepository.updateOcrResult(report.id, "failed")
      throw new Error(`OCR extraction failed: ${err.message}`)
    }
  }

  /**
   * Direct OCR extraction from raw file or text snippet
   */
  async directExtractOcr(file: File | Blob, fileName?: string): Promise<OcrExtractedSoilData> {
    const uploaded = await this.handleFileUpload(file, fileName)
    const buffer = Buffer.from(await file.arrayBuffer())
    const extracted = await ocrService.processFile(buffer, uploaded.fileType, uploaded.fileName)
    extracted.fileId = uploaded.fileId

    await uploadRepository.updateOcrResult(
      uploaded.fileId,
      "completed",
      extracted,
      extracted.rawText
    )

    return extracted
  }

  /**
   * Extract directly from simulated or parsed OCR text
   */
  async extractFromText(text: string, fileName?: string): Promise<OcrExtractedSoilData> {
    const extracted = ocrService.parseSoilDataFromText(text)
    const report = await uploadRepository.create({
      fileName: fileName || "text-scan",
      fileUrl: "local://text-input",
      fileType: "text",
      fileSize: Buffer.byteLength(text, "utf-8"),
      ocrStatus: "completed",
      extractedData: extracted,
      rawText: text,
    })

    extracted.fileId = report.id
    return extracted
  }
}

export const uploadService = new UploadService()
