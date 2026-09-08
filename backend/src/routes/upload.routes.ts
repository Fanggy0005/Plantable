import { Elysia, t } from "elysia"
import { uploadController } from "../controllers/upload.controller"
import { errorResponse } from "../utils/response"

export const uploadRoutes = new Elysia({ prefix: "/api" })
  // 1. Upload Soil Report File (Multipart Form Data)
  .post(
    "/uploads",
    async ({ body }) => {
      const file = (body as any)?.file
      if (!file) {
        return errorResponse("Please provide a file to upload")
      }
      return uploadController.uploadReport(file, (file as any)?.name)
    },
    {
      body: t.Object({
        file: t.File({
          maxSize: "10m",
        }),
      }),
    }
  )

  // 2. OCR Extraction Endpoint
  // Supports fileId reference, direct text string, or direct file upload
  .post(
    "/ocr",
    async ({ body }) => {
      const payload = body as any

      // Case A: fileId provided as JSON
      if (payload?.fileId) {
        return uploadController.extractOcr(payload.fileId)
      }

      // Case B: direct text provided as JSON
      if (payload?.text) {
        return uploadController.extractFromText(payload.text, payload.title)
      }

      // Case C: direct file upload via multipart
      if (payload?.file) {
        return uploadController.directExtractOcr(payload.file, payload.file?.name)
      }

      return errorResponse("Invalid OCR request: Please provide 'fileId', 'text', or 'file'")
    }
  )

  // 3. Direct text parsing helper for OCR
  .post(
    "/ocr/text",
    async ({ body }) => {
      return uploadController.extractFromText(body.text, body.title)
    },
    {
      body: t.Object({
        text: t.String(),
        title: t.Optional(t.String()),
      }),
    }
  )
