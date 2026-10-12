"use client";

/**
 * SectionReveal — lightweight scroll-triggered wrapper used exclusively on the
 * home page sections. Keeps page.tsx as a server component while enabling
 * Framer Motion animations.
 *
 * Usage:
 *   <SectionReveal>
 *     <YourContent />
 *   </SectionReveal>
 */

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface SectionRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** "up" slides from below, "fade" is opacity-only, "scale" scales in */
  variant?: "up" | "fade" | "scale";
}

export function SectionReveal({
  children,
  className,
  delay = 0,
  variant = "up",
}: SectionRevealProps) {
  const initial =
    variant === "up"
      ? { opacity: 0, y: 32 }
      : variant === "scale"
      ? { opacity: 0, scale: 0.94 }
      : { opacity: 0 };

  const animate =
    variant === "up"
      ? { opacity: 1, y: 0 }
      : variant === "scale"
      ? { opacity: 1, scale: 1 }
      : { opacity: 1 };

  return (
    <motion.div
      initial={initial}
      whileInView={animate}
      viewport={{ once: true, margin: "-64px" }}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Stagger wrapper — animates children one by one as section scrolls in */
interface StaggerRevealProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerReveal({
  children,
  className,
  staggerDelay = 0.1,
}: StaggerRevealProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-64px" }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: staggerDelay },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Individual stagger child */
interface StaggerChildProps {
  children: ReactNode;
  className?: string;
}

export function StaggerChild({ children, className }: StaggerChildProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Hero content — immediate animate (not scroll triggered) */
interface HeroRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function HeroReveal({ children, className, delay = 0 }: HeroRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
