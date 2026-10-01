"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Menu, X } from "lucide-react";

const LINKS = [
  ["Home", "#"],
  ["Product", "#product"],
  ["How It Works", "#how"],
  ["Pricing", "#pricing"],
  ["Roadmap", "#roadmap"],
  ["Platform Coverage", "#coverage"],
  ["FAQ", "#faq"],
] as const;

// Below lg the desktop links don't fit; this replaces them. Panel anchors to the sticky <header>.
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div ref={ref} className="lg:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="glass flex h-11 w-11 items-center justify-center rounded-full text-forest-800"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-3 top-full mt-2 origin-top rounded-2xl border border-line bg-cream-50 p-3 shadow-2xl shadow-black/20 sm:left-auto sm:w-80"
          >
            <ul>
              {LINKS.map(([label, href]) => (
                <li key={label}>
                  <a href={href} onClick={close} className="flex min-h-11 items-center rounded-xl px-4 font-medium text-ink hover:bg-cream-100">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-2 grid gap-2 border-t border-line pt-3">
              <Link href="/login" onClick={close} className="flex min-h-11 items-center justify-center rounded-full border border-line font-semibold text-ink">
                Log in
              </Link>
              <Link href="/signup" onClick={close} className="flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-forest-800 font-semibold text-cream-50">
                Start Free <ArrowRight size={16} />
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
