"use client"

import { useEffect, useRef, useState } from "react"
import {
  animate,
  motion,
  MotionConfig,
  useInView,
  useReducedMotion,
  type HTMLMotionProps,
  type Variants,
} from "motion/react"

/** Shared easing: fast out, gentle settle */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ ease: EASE_OUT, duration: 0.5 }}>
      {children}
    </MotionConfig>
  )
}

/** Fade + rise when scrolled into view (or on mount with `immediate`). */
export function FadeIn({
  delay = 0,
  y = 16,
  immediate = false,
  className,
  children,
  ...props
}: HTMLMotionProps<"div"> & { delay?: number; y?: number; immediate?: boolean }) {
  const inViewProps = immediate
    ? { animate: { opacity: 1, y: 0 } }
    : { whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-60px" } }

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      {...inViewProps}
      transition={{ duration: 0.55, ease: EASE_OUT, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

const staggerContainer: Variants = {
  hidden: {},
  show: (stagger: number = 0.06) => ({ transition: { staggerChildren: stagger } }),
}

const staggerChild: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
}

/** Parent that reveals its <StaggerItem> children one after another. */
export function Stagger({
  stagger = 0.06,
  immediate = false,
  className,
  children,
  ...props
}: HTMLMotionProps<"div"> & { stagger?: number; immediate?: boolean }) {
  const trigger = immediate
    ? { animate: "show" }
    : { whileInView: "show", viewport: { once: true, margin: "-40px" } }
  return (
    <motion.div
      variants={staggerContainer}
      custom={stagger}
      initial="hidden"
      {...trigger}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ className, children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div variants={staggerChild} className={className} {...props}>
      {children}
    </motion.div>
  )
}

/** Animated number that counts up when it enters the viewport and tweens on change. */
export function CountUp({
  value,
  decimals = 0,
  duration = 1.1,
  format,
  className,
}: {
  value: number
  decimals?: number
  duration?: number
  format?: (n: number) => string
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-20px" })
  const reduce = useReducedMotion()
  const [animated, setAnimated] = useState(0)
  const fromRef = useRef(0)
  const display = reduce ? value : animated

  useEffect(() => {
    if (!inView || reduce) return
    const controls = animate(fromRef.current, value, {
      duration,
      ease: EASE_OUT,
      onUpdate: (v) => setAnimated(v),
    })
    fromRef.current = value
    return () => controls.stop()
  }, [inView, value, duration, reduce])

  const rounded = Number(display.toFixed(decimals))
  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {format ? format(rounded) : rounded.toFixed(decimals)}
    </span>
  )
}

export { motion, AnimatePresence, LayoutGroup } from "motion/react"
