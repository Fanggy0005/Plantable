-- CreateEnum
CREATE TYPE "LandType" AS ENUM ('lowland', 'upland');

-- CreateEnum
CREATE TYPE "WaterSupply" AS ENUM ('rainfed', 'seasonal_irrigation', 'year_round');

-- CreateEnum
CREATE TYPE "SoilTexture" AS ENUM ('clay', 'loam', 'sandy');

-- CreateEnum
CREATE TYPE "InputMode" AS ENUM ('lab', 'test_kit');

-- CreateEnum
CREATE TYPE "NutrientLevel" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "Nutrient" AS ENUM ('organic_matter', 'nitrogen', 'phosphorus', 'potassium');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "areaRai" DOUBLE PRECISION NOT NULL,
    "province" TEXT NOT NULL,
    "landType" "LandType" NOT NULL,
    "waterSupply" "WaterSupply" NOT NULL,
    "soilTexture" "SoilTexture" NOT NULL,
    "targetCropId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoilAnalysis" (
    "id" TEXT NOT NULL,
    "plotId" TEXT NOT NULL,
    "inputMode" "InputMode" NOT NULL,
    "sampledAt" TIMESTAMP(3) NOT NULL,
    "ph" DOUBLE PRECISION NOT NULL,
    "organicMatterPct" DOUBLE PRECISION,
    "phosphorusMgKg" DOUBLE PRECISION,
    "potassiumMgKg" DOUBLE PRECISION,
    "nitrogenLevel" "NutrientLevel",
    "phosphorusLevel" "NutrientLevel",
    "potassiumLevel" "NutrientLevel",
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SoilAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Crop" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameTh" TEXT NOT NULL,
    "scientificName" TEXT,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Crop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropRequirement" (
    "id" TEXT NOT NULL,
    "cropId" TEXT NOT NULL,
    "allowedLandTypes" "LandType"[],
    "minWaterSupply" "WaterSupply" NOT NULL,
    "preferredTextures" "SoilTexture"[],
    "phMin" DOUBLE PRECISION NOT NULL,
    "phMax" DOUBLE PRECISION NOT NULL,
    "phOptimal" DOUBLE PRECISION NOT NULL,
    "minOrganicMatterLevel" "NutrientLevel" NOT NULL,
    "minNitrogenLevel" "NutrientLevel" NOT NULL,
    "minPhosphorusLevel" "NutrientLevel" NOT NULL,
    "minPotassiumLevel" "NutrientLevel" NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CropRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutrientLevelThreshold" (
    "id" TEXT NOT NULL,
    "nutrient" "Nutrient" NOT NULL,
    "level" "NutrientLevel" NOT NULL,
    "min" DOUBLE PRECISION,
    "max" DOUBLE PRECISION,
    "unit" TEXT NOT NULL,
    "source" TEXT NOT NULL,

    CONSTRAINT "NutrientLevelThreshold_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FertilizerRate" (
    "id" TEXT NOT NULL,
    "cropId" TEXT NOT NULL,
    "nutrient" "Nutrient" NOT NULL,
    "soilLevel" "NutrientLevel" NOT NULL,
    "kgPerRai" DOUBLE PRECISION NOT NULL,
    "source" TEXT NOT NULL,

    CONSTRAINT "FertilizerRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FertilizerStage" (
    "id" TEXT NOT NULL,
    "cropId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "nameTh" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "daysAfterPlanting" INTEGER NOT NULL,
    "nitrogenShare" DOUBLE PRECISION NOT NULL,
    "phosphorusShare" DOUBLE PRECISION NOT NULL,
    "potassiumShare" DOUBLE PRECISION NOT NULL,
    "source" TEXT NOT NULL,

    CONSTRAINT "FertilizerStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LimeRate" (
    "id" TEXT NOT NULL,
    "soilTexture" "SoilTexture" NOT NULL,
    "phFrom" DOUBLE PRECISION NOT NULL,
    "phTo" DOUBLE PRECISION NOT NULL,
    "kgCaco3PerRaiPerPhUnit" DOUBLE PRECISION NOT NULL,
    "source" TEXT NOT NULL,

    CONSTRAINT "LimeRate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Plot_userId_idx" ON "Plot"("userId");

-- CreateIndex
CREATE INDEX "SoilAnalysis_plotId_idx" ON "SoilAnalysis"("plotId");

-- CreateIndex
CREATE INDEX "SoilAnalysis_sampledAt_idx" ON "SoilAnalysis"("sampledAt");

-- CreateIndex
CREATE UNIQUE INDEX "Crop_name_key" ON "Crop"("name");

-- CreateIndex
CREATE INDEX "Crop_name_idx" ON "Crop"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CropRequirement_cropId_key" ON "CropRequirement"("cropId");

-- CreateIndex
CREATE UNIQUE INDEX "NutrientLevelThreshold_nutrient_level_key" ON "NutrientLevelThreshold"("nutrient", "level");

-- CreateIndex
CREATE UNIQUE INDEX "FertilizerRate_cropId_nutrient_soilLevel_key" ON "FertilizerRate"("cropId", "nutrient", "soilLevel");

-- CreateIndex
CREATE UNIQUE INDEX "FertilizerStage_cropId_order_key" ON "FertilizerStage"("cropId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "LimeRate_soilTexture_phFrom_key" ON "LimeRate"("soilTexture", "phFrom");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plot" ADD CONSTRAINT "Plot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plot" ADD CONSTRAINT "Plot_targetCropId_fkey" FOREIGN KEY ("targetCropId") REFERENCES "Crop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoilAnalysis" ADD CONSTRAINT "SoilAnalysis_plotId_fkey" FOREIGN KEY ("plotId") REFERENCES "Plot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropRequirement" ADD CONSTRAINT "CropRequirement_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FertilizerRate" ADD CONSTRAINT "FertilizerRate_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FertilizerStage" ADD CONSTRAINT "FertilizerStage_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
