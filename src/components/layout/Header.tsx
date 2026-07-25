"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react";

const navLinks = [
  { name: "Collections", href: "/collections" },
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

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(latest > prev && latest > 220 && !mobileMenuOpen);
    setScrolled(latest > 20);
  });

  return (
    <motion.header
      className="sticky top-0 z-50 w-full"
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {/* Announcement bar */}
      <div className="bg-stone-900 text-stone-300 text-center text-[11px] uppercase tracking-[0.18em] py-2 px-4">
        Handcrafted in India · Solid wood, built to last generations
      </div>

      <div
        className={`w-full border-b transition-colors duration-300 ${
          scrolled
            ? "border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70 shadow-[0_1px_20px_rgba(0,0,0,0.04)]"
            : "border-transparent bg-background"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Left: nav */}
            <nav className="hidden md:flex items-center gap-8 flex-1">
              {navLinks.map((link) => (
                <NavLink key={link.name} {...link} />
              ))}
            </nav>

            {/* Center: logo + wordmark */}
            <Link href="/" className="flex items-center gap-2.5 md:flex-1 md:justify-center group">
              <motion.span
                whileHover={{ rotate: 90 }}
                transition={{ type: "spring", stiffness: 200, damping: 12 }}
                className="inline-flex"
              >
                <Image src="/logo.png" alt="Draveta" width={30} height={30} priority />
              </motion.span>
              <span className="font-serif text-2xl md:text-3xl tracking-tight text-foreground leading-none">
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
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="md:hidden overflow-hidden border-t border-border bg-background"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
                {[...navLinks, { name: "Trade & Wholesale", href: "/b2b/apply" }].map(
                  (link, i) => (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i + 0.1 }}
                    >
                      <Link
                        href={link.href}
                        className="block rounded-md px-3 py-3 text-sm font-medium uppercase tracking-wider text-foreground/70 hover:bg-muted hover:text-foreground active:scale-[0.98] transition-transform"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  )
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
