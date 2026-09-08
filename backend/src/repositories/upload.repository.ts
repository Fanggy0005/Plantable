import { prisma } from "../config/db"

export interface CreateUploadDto {
  id?: string
  soilAnalysisId?: string | null
  fileName?: string | null
  fileUrl: string
  fileType: string
  fileSize?: number | null
  ocrStatus?: string
  extractedData?: any
  rawText?: string | null
}

export class UploadRepository {
  async create(data: CreateUploadDto) {
    return prisma.uploadedReport.create({
      data: {
        id: data.id,
        soilAnalysisId: data.soilAnalysisId || null,
        fileName: data.fileName || null,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
        fileSize: data.fileSize || null,
        ocrStatus: data.ocrStatus || "pending",
        extractedData: data.extractedData || null,
        rawText: data.rawText || null,
      },
    })
  }

  async findById(id: string) {
    return prisma.uploadedReport.findUnique({
      where: { id },
      include: {
        soilAnalysis: true,
      },
    })
  }

  async updateOcrResult(
    id: string,
    status: "completed" | "failed" | "processing",
    extractedData?: any,
    rawText?: string
  ) {
    return prisma.uploadedReport.update({
      where: { id },
      data: {
        ocrStatus: status,
        extractedData: extractedData ?? undefined,
        rawText: rawText ?? undefined,
      },
    })
  }

  async linkToSoilAnalysis(uploadId: string, soilAnalysisId: string) {
    return prisma.uploadedReport.update({
      where: { id: uploadId },
      data: { soilAnalysisId },
    })
  }
}

export const uploadRepository = new UploadRepository()
