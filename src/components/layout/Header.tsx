"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import { Menu, X, ChevronDown, ArrowUpRight } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react";

type Cat = { id: string; name: string; slug: string; imageUrl: string | null };

const secondaryNav = [
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

function NavLink({ href, name }: { href: string; name: string }) {
  return (
    <Link
      href={href}
      className="group relative text-xs font-medium uppercase tracking-[0.15em] text-foreground/60 transition-colors hover:text-foreground"
    >
      {name}
      <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-foreground transition-transform duration-300 ease-out group-hover:scale-x-100" />
    </Link>
  );
}

export function Header({ categories }: { categories: Cat[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => setScrolled(latest > 20));

  const openMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setMegaOpen(false), 120);
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Announcement — collapses on scroll to shrink the header */}
      <div
        className={`overflow-hidden bg-stone-900 text-stone-300 transition-all duration-300 ${
          scrolled ? "h-0 opacity-0" : "h-9 opacity-100"
        }`}
      >
        <p className="text-center text-[11px] uppercase tracking-[0.18em] py-2.5 px-4">
          Handcrafted in India · Solid wood, built to last generations
        </p>
      </div>

      {/* Nav bar */}
      <div
        onMouseLeave={scheduleClose}
        className={`relative w-full border-b transition-all duration-300 ${
          scrolled
            ? "border-border bg-background/80 backdrop-blur-md shadow-[0_2px_24px_rgba(0,0,0,0.05)]"
            : "border-transparent bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`flex items-center justify-between transition-all duration-300 ${
              scrolled ? "py-2.5" : "py-4"
            }`}
          >
            {/* Left nav */}
            <nav className="hidden md:flex items-center gap-8 flex-1">
              <div onMouseEnter={openMega} className="relative">
                <Link
                  href="/collections"
                  className="group relative inline-flex items-center gap-1 text-xs font-medium uppercase tracking-[0.15em] text-foreground/60 transition-colors hover:text-foreground"
                >
                  Collections
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-300 ${
                      megaOpen ? "rotate-180" : ""
                    }`}
                  />
                  <span className="absolute -bottom-1 left-0 h-px w-[calc(100%-1rem)] origin-left scale-x-0 bg-foreground transition-transform duration-300 ease-out group-hover:scale-x-100" />
                </Link>
              </div>
              {secondaryNav.map((link) => (
                <NavLink key={link.name} {...link} />
              ))}
            </nav>

            {/* Center: logo + wordmark */}
            <Link href="/" className="flex items-center gap-2.5 md:flex-1 md:justify-center">
              <motion.span
                whileHover={{ rotate: 90 }}
                transition={{ type: "spring", stiffness: 200, damping: 12 }}
                className={`inline-flex transition-all duration-300 ${scrolled ? "scale-90" : ""}`}
              >
                <Image src="/logo.png" alt="Draveta" width={30} height={30} priority />
              </motion.span>
              <span
                className={`font-serif tracking-tight text-foreground leading-none transition-all duration-300 ${
                  scrolled ? "text-xl md:text-2xl" : "text-2xl md:text-3xl"
                }`}
              >
                Draveta
              </span>
            </Link>

            {/* Right: trade + mobile toggle */}
            <div className="flex items-center justify-end gap-4 flex-1">
              <Link
                href="/b2b/apply"
                className="hidden md:inline-flex items-center border border-foreground/20 px-4 py-2 text-xs font-medium uppercase tracking-[0.15em] text-foreground/80 transition-all duration-200 hover:border-foreground hover:text-foreground active:scale-95"
              >
                Trade &amp; Wholesale
              </Link>
              <button
                className="md:hidden inline-flex h-9 w-9 items-center justify-center active:scale-90 transition-transform"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mega menu */}
        <AnimatePresence>
          {megaOpen && (
            <motion.div
              onMouseEnter={openMega}
              className="absolute left-0 right-0 top-full hidden md:block border-b border-border bg-background/95 backdrop-blur-md shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.24, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-3 lg:grid-cols-5 gap-5">
                  {categories.map((cat, i) => (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.04 * i + 0.05 }}
                    >
                      <Link
                        href={`/collections/${cat.slug}`}
                        className="group block"
                        onClick={() => setMegaOpen(false)}
                      >
                        <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-stone-100">
                          {cat.imageUrl && (
                            <Image
                              src={cat.imageUrl}
                              alt={cat.name}
                              fill
                              sizes="20vw"
                              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                            />
                          )}
                        </div>
                        <div className="mt-2.5 flex items-center justify-between">
                          <span className="font-serif text-base text-stone-900">{cat.name}</span>
                          <ArrowUpRight className="h-4 w-4 text-stone-400 transition-all group-hover:text-stone-900 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-7 pt-5 border-t border-border">
                  <Link
                    href="/collections"
                    onClick={() => setMegaOpen(false)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.15em] text-stone-700 hover:text-stone-900 transition-colors"
                  >
                    View all collections
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              className="md:hidden overflow-hidden border-t border-border bg-background"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
                {[
                  { name: "Collections", href: "/collections" },
                  ...secondaryNav,
                  { name: "Trade & Wholesale", href: "/b2b/apply" },
                ].map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i + 0.1 }}
                  >
                    <Link
                      href={link.href}
                      className="block rounded-md px-3 py-3 text-sm font-medium uppercase tracking-wider text-foreground/70 hover:bg-muted hover:text-foreground active:scale-[0.98] transition-transform"
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
