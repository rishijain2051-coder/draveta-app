"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Magnetic } from "@/components/motion/magnetic";
import { ParallaxImage } from "@/components/motion/parallax-image";

export function Hero({
  headline,
  subline,
  ctaText,
  ctaUrl,
  mediaUrl,
}: {
  headline: string;
  subline: string;
  ctaText: string;
  ctaUrl: string;
  mediaUrl: string;
}) {
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(false);

  // Start the staggered reveal as the intro preloader lifts (or immediately on
  // repeat visits / if the signal is missed).
  useEffect(() => {
    if (sessionStorage.getItem("draveta_intro")) {
      setReady(true);
      return;
    }
    const onDone = () => setReady(true);
    window.addEventListener("draveta:intro-done", onDone);
    const fallback = setTimeout(() => setReady(true), 2600);
    return () => {
      window.removeEventListener("draveta:intro-done", onDone);
      clearTimeout(fallback);
    };
  }, []);

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.13, delayChildren: 0.1 } },
  };
  const item = {
    hidden: { opacity: 0, y: reduce ? 0 : 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <section className="relative w-full h-[calc(100vh-104px)] min-h-[560px] flex items-end overflow-hidden">
      {mediaUrl ? (
        <ParallaxImage src={mediaUrl} alt={headline} priority />
      ) : (
        <div className="absolute inset-0 bg-stone-200" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />

      <motion.div
        className="relative z-10 w-full container mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-24"
        variants={container}
        initial="hidden"
        animate={ready ? "show" : "hidden"}
      >
        <div className="max-w-3xl">
          <motion.p
            variants={item}
            className="mb-5 text-xs font-medium uppercase tracking-[0.3em] text-[#e6cba8]"
          >
            The solid wood collection
          </motion.p>
          <motion.h1
            variants={item}
            className="font-serif text-white text-5xl md:text-7xl lg:text-8xl leading-[1.02] tracking-tight mb-6"
          >
            {headline}
          </motion.h1>
          <motion.p
            variants={item}
            className="text-lg md:text-xl text-white/85 max-w-xl mb-10 leading-relaxed"
          >
            {subline}
          </motion.p>
          <motion.div variants={item} className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <Magnetic>
              <Link
                href={ctaUrl}
                className="inline-flex items-center gap-2 bg-white text-stone-900 px-8 py-4 text-xs font-semibold uppercase tracking-[0.18em] transition-colors hover:bg-stone-100 active:scale-[0.97]"
              >
                {ctaText}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Magnetic>
            <Link
              href="/b2b/apply"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-white/90 border-b border-white/40 pb-1 transition-colors hover:text-white hover:border-white"
            >
              Trade &amp; wholesale enquiries
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
