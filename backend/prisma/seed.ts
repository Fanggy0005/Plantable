import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"
import { CROPS } from "./seed-data/crops"
import {
  SAMPLE_CROP_AGRONOMY,
  SAMPLE_FERTILIZER_STAGES,
  SAMPLE_LIME_RATES,
  SAMPLE_SOURCE,
  SAMPLE_THRESHOLDS,
} from "./seed-data/sample-agronomy"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const LEVELS = ["low", "medium", "high"] as const
const FERTILIZER_NUTRIENTS = ["nitrogen", "phosphorus", "potassium"] as const

async function seedThresholds() {
  for (const t of SAMPLE_THRESHOLDS) {
    const data = { ...t, source: SAMPLE_SOURCE }
    await prisma.nutrientLevelThreshold.upsert({
      where: { nutrient_level: { nutrient: t.nutrient, level: t.level } },
      update: data,
      create: data,
    })
  }
  console.log(`✓ ${SAMPLE_THRESHOLDS.length} nutrient thresholds`)
}

async function seedLimeRates() {
  for (const rate of SAMPLE_LIME_RATES) {
    const data = { ...rate, source: SAMPLE_SOURCE }
    await prisma.limeRate.upsert({
      where: { soilTexture_phFrom: { soilTexture: rate.soilTexture, phFrom: rate.phFrom } },
      update: data,
      create: data,
    })
  }
  console.log(`✓ ${SAMPLE_LIME_RATES.length} lime rates`)
}

async function seedCrops() {
  for (const info of CROPS) {
    const agronomy = SAMPLE_CROP_AGRONOMY[info.name]
    if (!agronomy) throw new Error(`No agronomy data for crop ${info.name}`)
    const { fertilizer, ...requirementFields } = agronomy
    const requirement = { ...requirementFields, source: SAMPLE_SOURCE }

    await prisma.$transaction(async (tx) => {
      const crop = await tx.crop.upsert({
        where: { name: info.name },
        update: info,
        create: info,
      })

      await tx.cropRequirement.upsert({
        where: { cropId: crop.id },
        update: requirement,
        create: { ...requirement, cropId: crop.id },
      })

      await tx.fertilizerRate.deleteMany({ where: { cropId: crop.id } })
      await tx.fertilizerRate.createMany({
        data: FERTILIZER_NUTRIENTS.flatMap((nutrient) =>
          LEVELS.map((soilLevel, i) => ({
            cropId: crop.id,
            nutrient,
            soilLevel,
            kgPerRai: fertilizer[nutrient][i] ?? 0,
            source: SAMPLE_SOURCE,
          }))
        ),
      })

      await tx.fertilizerStage.deleteMany({ where: { cropId: crop.id } })
      await tx.fertilizerStage.createMany({
        data: SAMPLE_FERTILIZER_STAGES.map((stage) => ({ ...stage, cropId: crop.id, source: SAMPLE_SOURCE })),
      })
    })

    console.log(`✓ crop ${info.name} (${info.nameTh})`)
  }
}

async function main() {
  console.log("Seeding master data (SAMPLE values, not verified)...")
  await seedThresholds()
  await seedLimeRates()
  await seedCrops()
  console.log("Seeding completed.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
