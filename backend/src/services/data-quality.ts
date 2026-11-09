// Master data seeded before the real LDD/DOA numbers are collected carries a source
// starting with "SAMPLE". Results built on it must say so.
const SAMPLE_SOURCE_PREFIX = "SAMPLE"

export const SAMPLE_DATA_WARNING =
  "ข้อมูลตัวอย่าง: ตัวเลขยังไม่ได้ตรวจสอบกับแหล่งอ้างอิง ห้ามนำไปใช้ในแปลงจริง"

export function usesSampleData(sources: Iterable<string>): boolean {
  for (const source of sources) {
    if (source.startsWith(SAMPLE_SOURCE_PREFIX)) return true
  }
  return false
}
