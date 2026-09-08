import { uploadService } from "../services/upload.service"
import { successResponse, errorResponse } from "../utils/response"

export class UploadController {
  async uploadReport(file: File | Blob, fileName?: string) {
    try {
      if (!file) {
        return errorResponse("Missing file parameter: please upload a PDF or image file")
      }
      const result = await uploadService.handleFileUpload(file, fileName)
      return successResponse(result, "File uploaded successfully")
    } catch (err: any) {
      return errorResponse(err.message || "Failed to upload file", [err])
    }
  }

  async extractOcr(fileId: string) {
    try {
      if (!fileId) {
        return errorResponse("Missing required parameter: fileId")
      }
      const result = await uploadService.extractOcr(fileId)
      return successResponse(result, "Soil test data extracted successfully")
    } catch (err: any) {
      return errorResponse(err.message || "Failed to extract data via OCR", [err])
    }
  }

  async directExtractOcr(file: File | Blob, fileName?: string) {
    try {
      if (!file) {
        return errorResponse("Missing file parameter: please provide a report file")
      }
      const result = await uploadService.directExtractOcr(file, fileName)
      return successResponse(result, "Soil test data extracted successfully")
    } catch (err: any) {
      return errorResponse(err.message || "Failed to process file OCR", [err])
    }
  }

  async extractFromText(text: string, title?: string) {
    try {
      if (!text || text.trim().length === 0) {
        return errorResponse("Text content is empty")
      }
      const result = await uploadService.extractFromText(text, title)
      return successResponse(result, "Soil test data parsed successfully from text")
    } catch (err: any) {
      return errorResponse(err.message || "Failed to parse text", [err])
    }
  }
}

export const uploadController = new UploadController()
