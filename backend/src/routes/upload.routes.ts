import { Elysia, t } from "elysia"
import { uploadController } from "../controllers/upload.controller"
import { errorResponse } from "../utils/response"

export const uploadRoutes = new Elysia({ prefix: "/api" })
  // 1. Upload Soil Report File (Multipart Form Data)
  .post(
    "/uploads",
    async ({ body }) => {
      return uploadController.uploadReport(body.file, body.file.name)
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
      // Case A: fileId provided as JSON
      if (body.fileId) {
        return uploadController.extractOcr(body.fileId)
      }

      // Case B: direct text provided as JSON
      if (body.text) {
        return uploadController.extractFromText(body.text, body.title)
      }

      // Case C: direct file upload via multipart
      if (body.file) {
        return uploadController.directExtractOcr(body.file, body.file.name)
      }

      return errorResponse("Invalid OCR request: Please provide 'fileId', 'text', or 'file'")
    },
    {
      body: t.Object({
        fileId: t.Optional(t.String()),
        text: t.Optional(t.String()),
        title: t.Optional(t.String()),
        file: t.Optional(t.File({ maxSize: "10m" })),
      }),
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
