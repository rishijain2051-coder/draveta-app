"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * Full-screen branded intro on first load of a session. Deliberately CSS-only:
 * removal is driven by a timer (not an animation-complete callback), so it can
 * never get stuck covering the site even if animations don't run.
 */
export function Preloader() {
  const [hide, setHide] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("draveta_intro");
    // Let the full entrance play out before revealing the site on first load.
    const showFor = seen ? 0 : 2800;

    const t1 = setTimeout(() => {
      setHide(true);
      sessionStorage.setItem("draveta_intro", "1");
      window.dispatchEvent(new Event("draveta:intro-done"));
    }, showFor);
    const t2 = setTimeout(() => setRemoved(true), showFor + 800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (removed) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-[#faf8f4] transition-opacity duration-[800ms] ease-in-out ${
        hide ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-6">
        <span className="inline-flex animate-[introReveal_1.7s_ease-out_both]">
          <Image src="/logo.png" alt="Draveta" width={84} height={84} priority />
        </span>
        <span className="font-serif text-3xl tracking-tight text-stone-900 animate-[introUp_0.9s_ease-out_0.7s_both]">
          Draveta
        </span>
        <span className="h-px bg-stone-900/25 animate-[introLine_1s_ease-out_1s_both]" />
      </div>
    </div>
  );
}
