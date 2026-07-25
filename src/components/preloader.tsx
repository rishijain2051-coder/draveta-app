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
    const showFor = seen ? 0 : 1700;

    const t1 = setTimeout(() => {
      setHide(true);
      sessionStorage.setItem("draveta_intro", "1");
      window.dispatchEvent(new Event("draveta:intro-done"));
    }, showFor);
    const t2 = setTimeout(() => setRemoved(true), showFor + 750);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (removed) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-[#faf8f4] transition-opacity duration-700 ease-in-out ${
        hide ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-700">
        <Image
          src="/logo.png"
          alt="Draveta"
          width={80}
          height={80}
          priority
          className="animate-spin [animation-duration:6s]"
        />
        <span className="font-serif text-3xl tracking-tight text-stone-900">
          Draveta
        </span>
        <span className="h-px w-24 bg-stone-900/25" />
      </div>
    </div>
  );
}
