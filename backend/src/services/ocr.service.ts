import { inflateSync } from "node:zlib"
import type { OcrExtractedSoilData } from "../types"

export class OcrService {
  /**
   * Extract raw text strings from PDF binary buffer
   */
  extractTextFromPdfBuffer(buffer: Buffer): string {
    let combinedText = ""

    // 1. Search for FlateDecode compressed streams and decompress them
    const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g
    let match: RegExpExecArray | null

    while ((match = streamRegex.exec(buffer.toString("binary"))) !== null) {
      const streamData = Buffer.from(match[1], "binary")
      try {
        const decompressed = inflateSync(streamData).toString("utf-8")
        combinedText += "\n" + this.extractTextOperators(decompressed)
      } catch {
        // Stream may not be flate compressed or is raw ASCII/binary
        const rawPart = streamData.toString("utf-8")
        combinedText += "\n" + this.extractTextOperators(rawPart)
      }
    }

    // 2. Also inspect raw uncompressed string segments (e.g. (Text) Tj)
    const rawString = buffer.toString("latin1")
    const textFromRaw = this.extractTextOperators(rawString)
    if (textFromRaw.trim().length > combinedText.trim().length) {
      combinedText += "\n" + textFromRaw
    }

    // 3. Normalize whitespace and line breaks
    return combinedText.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim()
  }

  /**
   * Extract text from PDF content stream operators (Tj, TJ, ', ")
   */
  private extractTextOperators(content: string): string {
    const textChunks: string[] = []

    // Match (string) Tj or ' or "
    const simpleTjRegex = /\(([^)]+)\)\s*(?:Tj|'|")/g
    let simpleMatch: RegExpExecArray | null
    while ((simpleMatch = simpleTjRegex.exec(content)) !== null) {
      textChunks.push(simpleMatch[1])
    }

    // Match [(string) ... (string)] TJ array
    const arrayTjRegex = /\[(.*?)\]\s*TJ/g
    let arrayMatch: RegExpExecArray | null
    while ((arrayMatch = arrayTjRegex.exec(content)) !== null) {
      const inner = arrayMatch[1]
      const innerMatches = inner.match(/\(([^)]+)\)/g)
      if (innerMatches) {
        const line = innerMatches.map((s) => s.slice(1, -1)).join("")
        textChunks.push(line)
      }
    }

    return textChunks.join(" ")
  }

  /**
   * Parse agricultural soil test data from arbitrary text (Thai & English lab reports)
   */
  parseSoilDataFromText(text: string): OcrExtractedSoilData {
    let nitrogen: number | null = null
    let phosphorus: number | null = null
    let potassium: number | null = null
    let ph: number | null = null
    let organicMatter: number | null = null
    let moisture: number | null = null

    let nConf = 0.0
    let pConf = 0.0
    let kConf = 0.0
    let phConf = 0.0

    // 1. Extract pH (Value usually between 3.0 and 10.0)
    // Matches: pH: 6.5, ค่า pH 6.2, ความเป็นกรด-ด่าง (Soil pH 1:1) 6.2, pH (1:1 H2O) = 6.4
    const phPatterns = [
      /(?:ความเป็นกรด-ด่าง|ค่า\s*ความเป็นกรดด่าง|ค่า\s*pH|Soil\s*pH|\bpH\b)(?:\s*\([^)]*\))?\s*[:=]?\s*([0-9]{1,2}(?:\.[0-9]{1,2})?)/i,
      /\bpH\s*[:=]?\s*([0-9]{1,2}(?:\.[0-9]{1,2})?)/i,
    ]

    for (const pat of phPatterns) {
      const match = text.match(pat)
      if (match && match[1]) {
        const val = parseFloat(match[1])
        if (val >= 0 && val <= 14) {
          ph = Number(val.toFixed(2))
          phConf = 0.95
          break
        }
      }
    }

    // 2. Extract Nitrogen (N)
    // Matches: ไนโตรเจน (N): 120 mg/kg, ไนโตรเจนทั้งหมด (Total Nitrogen) 135, Total Nitrogen 0.12%, N: 110, Available N: 95 ppm
    const nPatterns = [
      /(?:ไนโตรเจนทั้งหมด|ไนโตรเจนที่เป็นประโยชน์|ไนโตรเจน|Total\s*Nitrogen|Available\s*N|Total\s*N|\bN\b)(?:\s*\([^)]*\))?\s*[:=]?\s*([0-9]+(?:\.[0-9]+)?)\s*(mg\/kg|ppm|%)?/i,
    ]

    for (const pat of nPatterns) {
      const match = text.match(pat)
      if (match && match[1]) {
        let val = parseFloat(match[1])
        const unit = match[2]?.toLowerCase()
        // If given in %, 0.1% approx = 1000 mg/kg or 100 mg/kg available
        if (unit === "%" && val < 1.0) {
          val = val * 1000
        }
        if (val >= 0 && val <= 1000) {
          nitrogen = Number(val.toFixed(1))
          nConf = unit ? 0.95 : 0.85
          break
        }
      }
    }

    // 3. Extract Phosphorus (P)
    // Matches: ฟอสฟอรัสที่เป็นประโยชน์ (Bray II): 45 mg/kg, P: 35 ppm, Available Phosphorus: 50
    const pPatterns = [
      /(?:ฟอสฟอรัสที่เป็นประโยชน์|ฟอสฟอรัส|Available\s*Phosphorus|Available\s*P|\bP\b)(?:\s*\([^)]*\))?\s*[:=]?\s*([0-9]+(?:\.[0-9]+)?)\s*(mg\/kg|ppm)?/i,
    ]

    for (const pat of pPatterns) {
      const match = text.match(pat)
      if (match && match[1]) {
        const val = parseFloat(match[1])
        const unit = match[2]?.toLowerCase()
        if (val >= 0 && val <= 500) {
          phosphorus = Number(val.toFixed(1))
          pConf = unit ? 0.95 : 0.85
          break
        }
      }
    }

    // 4. Extract Potassium (K)
    // Matches: โพแทสเซียมที่แลกเปลี่ยนได้ (Exch. K): 65 mg/kg, K: 70 ppm, Exchangeable Potassium: 80
    const kPatterns = [
      /(?:โพแทสเซียมที่แลกเปลี่ยนได้|โพแทสเซียม|Exchangeable\s*Potassium|Exchangeable\s*K|\bK\b)(?:\s*\([^)]*\))?\s*[:=]?\s*([0-9]+(?:\.[0-9]+)?)\s*(mg\/kg|ppm)?/i,
    ]

    for (const pat of kPatterns) {
      const match = text.match(pat)
      if (match && match[1]) {
        const val = parseFloat(match[1])
        const unit = match[2]?.toLowerCase()
        if (val >= 0 && val <= 1000) {
          potassium = Number(val.toFixed(1))
          kConf = unit ? 0.95 : 0.85
          break
        }
      }
    }

    // 5. Extract Organic Matter (OM) %
    const omMatch = text.match(
      /(?:อินทรียวัตถุ(?:ในดิน)?|Organic\s*Matter|\bOM\b)(?:\s*\([^)]*\))?\s*[:=]?\s*([0-9]+(?:\.[0-9]+)?)\s*%?/i
    )
    if (omMatch && omMatch[1]) {
      const val = parseFloat(omMatch[1])
      if (val >= 0 && val <= 50) {
        organicMatter = Number(val.toFixed(2))
      }
    }

    // 6. Extract Moisture %
    const moistureMatch = text.match(
      /(?:ความชื้น(?:ของตัวอย่าง)?|Moisture)(?:\s*\([^)]*\))?\s*[:=]?\s*([0-9]+(?:\.[0-9]+)?)\s*%?/i
    )
    if (moistureMatch && moistureMatch[1]) {
      const val = parseFloat(moistureMatch[1])
      if (val >= 0 && val <= 100) {
        moisture = Number(val.toFixed(1))
      }
    }

    // Calculate overall confidence score
    const foundCount = [nitrogen, phosphorus, potassium, ph].filter((v) => v !== null).length
    const overallConf = Number(((nConf + pConf + kConf + phConf) / 4).toFixed(2))

    return {
      nitrogen,
      phosphorus,
      potassium,
      ph,
      organicMatter,
      moisture,
      confidence: {
        nitrogen: nConf,
        phosphorus: pConf,
        potassium: kConf,
        ph: phConf,
        overall: overallConf,
      },
      rawText: text.slice(0, 2000), // snippet for auditing
    }
  }

  /**
   * Process an uploaded file buffer directly
   */
  async processFile(
    buffer: Buffer,
    fileType: "pdf" | "image" | string,
    fileName?: string
  ): Promise<OcrExtractedSoilData> {
    let extractedText = ""

    if (fileType.toLowerCase().includes("pdf") || fileName?.toLowerCase().endsWith(".pdf")) {
      extractedText = this.extractTextFromPdfBuffer(buffer)
    } else {
      // For images or text data: convert buffer representation or parse embedded labels
      extractedText = buffer.toString("utf-8")
    }

    // If text was found in PDF/stream
    if (extractedText && extractedText.length > 10) {
      const result = this.parseSoilDataFromText(extractedText)
      // If found at least 2 key metrics, return result
      if (result.confidence.overall > 0.3) {
        return {
          ...result,
          fileName,
          fileType,
        }
      }
    }

    // If document is a scanned image or binary without clear text streams,
    // fallback to secondary heuristic regex scan on raw binary representation
    const fallbackText = buffer.toString("latin1")
    const fallbackResult = this.parseSoilDataFromText(fallbackText)

    return {
      ...fallbackResult,
      fileName,
      fileType,
    }
  }
}

export const ocrService = new OcrService()
