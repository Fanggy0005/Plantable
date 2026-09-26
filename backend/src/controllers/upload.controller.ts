import { uploadService } from "../services/upload.service"
import { successResponse, errorResponse, errorFromCaught } from "../utils/response"

export class UploadController {
  async uploadReport(file: File | Blob, fileName?: string) {
    try {
      if (!file) {
        return errorResponse("Missing file parameter: please upload a PDF or image file")
      }
      const result = await uploadService.handleFileUpload(file, fileName)
      return successResponse(result, "File uploaded successfully")
    } catch (err) {
      return errorFromCaught(err, "Failed to upload file")
    }
  }

  async extractOcr(fileId: string) {
    try {
      if (!fileId) {
        return errorResponse("Missing required parameter: fileId")
      }
      const result = await uploadService.extractOcr(fileId)
      return successResponse(result, "Soil test data extracted successfully")
    } catch (err) {
      return errorFromCaught(err, "Failed to extract data via OCR")
    }
  }

  async directExtractOcr(file: File | Blob, fileName?: string) {
    try {
      if (!file) {
        return errorResponse("Missing file parameter: please provide a report file")
      }
      const result = await uploadService.directExtractOcr(file, fileName)
      return successResponse(result, "Soil test data extracted successfully")
    } catch (err) {
      return errorFromCaught(err, "Failed to process file OCR")
    }
  }

  async extractFromText(text: string, title?: string) {
    try {
      if (!text || text.trim().length === 0) {
        return errorResponse("Text content is empty")
      }
      const result = await uploadService.extractFromText(text, title)
      return successResponse(result, "Soil test data parsed successfully from text")
    } catch (err) {
      return errorFromCaught(err, "Failed to parse text")
    }
  }
}

export const uploadController = new UploadController()
