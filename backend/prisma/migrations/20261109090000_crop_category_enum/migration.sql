-- Crop.category: free text -> CropCategory enum.
-- Existing rows are mapped by crop name; any other row falls back on its old text value.

CREATE TYPE "CropCategory" AS ENUM ('cereal', 'legume', 'oilseed', 'root_tuber', 'sugar_crop', 'plantation', 'fruit', 'fruit_vegetable', 'leafy_vegetable', 'spice_herb');

ALTER TABLE "Crop" ADD COLUMN "category_new" "CropCategory";

UPDATE "Crop" SET "category_new" = CASE
  WHEN "name" IN ('Rice', 'Corn') THEN 'cereal'
  WHEN "name" = 'Soybean' THEN 'legume'
  WHEN "name" = 'Cassava' THEN 'root_tuber'
  WHEN "name" = 'Sugarcane' THEN 'sugar_crop'
  WHEN "name" = 'Rubber' THEN 'plantation'
  WHEN "name" IN ('Tomato', 'Chili') THEN 'fruit_vegetable'
  WHEN "category" = 'Grain' THEN 'cereal'
  WHEN "category" = 'Cash Crop' THEN 'plantation'
  WHEN "category" = 'Vegetable' THEN 'fruit_vegetable'
  ELSE 'fruit'
END::"CropCategory";

ALTER TABLE "Crop" DROP COLUMN "category";
ALTER TABLE "Crop" RENAME COLUMN "category_new" TO "category";
ALTER TABLE "Crop" ALTER COLUMN "category" SET NOT NULL;

CREATE INDEX "Crop_category_idx" ON "Crop"("category");
