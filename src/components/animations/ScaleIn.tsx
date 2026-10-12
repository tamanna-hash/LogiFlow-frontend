"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface ScaleInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  initialScale?: number;
  className?: string;
  /** If true, animates once on page load instead of on scroll */
  immediate?: boolean;
}

export function ScaleIn({
  children,
  delay = 0,
  duration = 0.4,
  initialScale = 0.93,
  className,
  immediate = false,
}: ScaleInProps) {
  if (immediate) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: initialScale }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration, delay, ease: "easeOut" }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: initialScale }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
