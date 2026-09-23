"use client"

import { motion } from "motion/react"
import { EASE_OUT } from "@/components/motion"

/** Re-mounts on every navigation, giving each page a soft enter transition. */
export default function WebTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  )
}
