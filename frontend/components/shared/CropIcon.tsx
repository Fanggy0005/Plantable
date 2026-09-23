import {
  Apple,
  Bean,
  Candy,
  Carrot,
  Cherry,
  Droplets,
  Flame,
  Grape,
  Nut,
  Popcorn,
  Sprout,
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
}

const CATEGORY_TONE: Record<string, string> = {
  Grain: "bg-warning-soft text-warning ring-warning/15",
  "Cash Crop": "bg-secondary text-primary ring-primary/10",
  Fruit: "bg-danger-soft text-chart-5 ring-chart-5/15",
  Vegetable: "bg-success-soft text-success ring-success/15",
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
