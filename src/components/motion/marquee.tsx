"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/** Infinite horizontal marquee. Renders children twice for a seamless loop. */
export function Marquee({
  children,
  duration = 26,
  className,
}: {
  children: ReactNode;
  duration?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  // Reduced motion: render a single, static, centered row (no scrolling).
  if (reduce) {
    return (
      <div className={`flex flex-wrap items-center justify-center ${className ?? ""}`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`group overflow-hidden ${className ?? ""}`}>
      <motion.div
        className="flex w-max flex-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        <div className="flex flex-nowrap items-center">{children}</div>
        <div className="flex flex-nowrap items-center" aria-hidden>
          {children}
        </div>
      </motion.div>
    </div>
  );
}
