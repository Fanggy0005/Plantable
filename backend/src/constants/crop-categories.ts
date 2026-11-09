import type { CropCategory, CropGroup } from "../services/engine/types"

// Crop classification. The category is stored on each crop; the group is derived
// from it here so the two can never disagree.

export const CROP_GROUPS = ["field_crop", "tree_crop", "horticulture"] as const satisfies readonly CropGroup[]

export const CATEGORY_GROUP = {
  cereal: "field_crop", //          ธัญพืช
  legume: "field_crop", //          พืชตระกูลถั่ว
  oilseed: "field_crop", //         พืชน้ำมัน
  root_tuber: "field_crop", //      พืชหัว
  sugar_crop: "field_crop", //      พืชให้น้ำตาล
  plantation: "tree_crop", //       ไม้ยืนต้นเศรษฐกิจ
  fruit: "horticulture", //         ไม้ผล
  fruit_vegetable: "horticulture", // ผักกินผล/ฝัก
  leafy_vegetable: "horticulture", // ผักกินใบ
  spice_herb: "horticulture", //    เครื่องเทศและสมุนไพร
} as const satisfies Record<CropCategory, CropGroup>

export const CROP_CATEGORIES = Object.keys(CATEGORY_GROUP) as CropCategory[]

export function categoriesInGroup(group: CropGroup): CropCategory[] {
  return CROP_CATEGORIES.filter((c) => CATEGORY_GROUP[c] === group)
}
