"use client";

import { motion } from "motion/react";
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
