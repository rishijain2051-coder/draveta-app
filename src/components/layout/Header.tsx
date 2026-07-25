"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { name: "Collections", href: "/collections" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Announcement bar */}
      <div className="bg-stone-900 text-stone-300 text-center text-[11px] uppercase tracking-[0.18em] py-2 px-4">
        Handcrafted in India · Solid wood, built to last generations
      </div>

      <div className="w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Left: nav (desktop) */}
            <nav className="hidden md:flex items-center gap-8 flex-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-xs font-medium uppercase tracking-[0.15em] text-foreground/60 transition-colors hover:text-foreground"
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Center: wordmark */}
            <Link
              href="/"
              className="flex flex-col items-center leading-none md:flex-1 md:items-center"
            >
              <span className="font-serif text-2xl md:text-3xl tracking-tight text-foreground">
                Draveta
              </span>
              <span className="hidden md:block text-[10px] uppercase tracking-[0.35em] text-muted-foreground mt-1">
                Furniture
              </span>
            </Link>

            {/* Right: trade + mobile toggle */}
            <div className="flex items-center justify-end gap-4 flex-1">
              <Link
                href="/b2b/apply"
                className="hidden md:inline-flex items-center border border-foreground/20 px-4 py-2 text-xs font-medium uppercase tracking-[0.15em] text-foreground/80 transition-colors hover:border-foreground hover:text-foreground"
              >
                Trade &amp; Wholesale
              </Link>
              <button
                className="md:hidden inline-flex h-9 w-9 items-center justify-center"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="rounded-md px-3 py-3 text-sm font-medium uppercase tracking-wider text-foreground/70 hover:bg-muted hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="/b2b/apply"
                className="mt-2 rounded-md border border-foreground/20 px-3 py-3 text-sm font-medium uppercase tracking-wider text-foreground/80 text-center hover:bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                Trade &amp; Wholesale
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
