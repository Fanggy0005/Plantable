import {
  Apple,
  Bean,
  Candy,
  Carrot,
  Cherry,
  Citrus,
  Droplets,
  Flame,
  Flower2,
  Grape,
  Leaf,
  LeafyGreen,
  Nut,
  Popcorn,
  Salad,
  Sprout,
  Sun,
  TreePalm,
  Wheat,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

const CROP_ICONS: Record<string, LucideIcon> = {
  rice: Wheat,
  corn: Popcorn,
  cassava: Carrot,
  sugarcane: Candy,
  rubber: Droplets,
  durian: Nut,
  mango: Apple,
  pineapple: TreePalm,
  tomato: Cherry,
  longan: Grape,
  chili: Flame,
  soybean: Bean,
  "mung bean": Bean,
  peanut: Nut,
  sorghum: Wheat,
  sesame: Sprout,
  sunflower: Sun,
  "sweet potato": Carrot,
  watermelon: Citrus,
  cucumber: Salad,
  pumpkin: Apple,
  "yardlong bean": Bean,
  eggplant: Grape,
  "sweet corn": Popcorn,
  "chinese kale": LeafyGreen,
  "water spinach": Leaf,
  "choy sum": LeafyGreen,
  shallot: Flower2,
  ginger: Carrot,
  lemongrass: Sprout,
}

const FIELD = "bg-warning-soft text-warning ring-warning/15"
const TREE = "bg-secondary text-primary ring-primary/10"
const FRUIT = "bg-danger-soft text-chart-5 ring-chart-5/15"
const VEGETABLE = "bg-success-soft text-success ring-success/15"

const CATEGORY_TONE: Record<string, string> = {
  cereal: FIELD,
  legume: FIELD,
  oilseed: FIELD,
  root_tuber: FIELD,
  sugar_crop: FIELD,
  plantation: TREE,
  fruit: FRUIT,
  fruit_vegetable: VEGETABLE,
  leafy_vegetable: VEGETABLE,
  spice_herb: VEGETABLE,
  // Categories saved in guest history before the category enum
  Grain: FIELD,
  "Cash Crop": TREE,
  Fruit: FRUIT,
  Vegetable: VEGETABLE,
}

const SIZES = {
  sm: "size-8 rounded-lg [&_svg]:size-4",
  md: "size-11 rounded-xl [&_svg]:size-5",
  lg: "size-14 rounded-2xl [&_svg]:size-7",
  xl: "size-20 rounded-3xl [&_svg]:size-10",
}

/** Icon tile for a crop, keyed by its English name (e.g. "Rice") and tinted by category. */
export function CropIcon({
  name,
  category,
  size = "md",
  className,
}: {
  name?: string | null
  category?: string | null
  size?: keyof typeof SIZES
  className?: string
}) {
  const Icon = CROP_ICONS[(name ?? "").trim().toLowerCase()] ?? Sprout
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center ring-1 ring-inset",
        CATEGORY_TONE[category ?? ""] ?? "bg-secondary text-primary ring-primary/10",
        SIZES[size],
        className
      )}
    >
      <Icon />
    </span>
  )
}
