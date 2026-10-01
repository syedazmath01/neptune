"use client";

import { Moon, Sun } from "lucide-react";

// Icons swap via the dark: variant, so there's no React state to hydrate.
export function ThemeToggle({ className = "" }: { className?: string }) {
  function toggle() {
    const dark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
    } catch {}
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle light or dark mode"
      className={`glass flex h-11 w-11 items-center justify-center rounded-full text-forest-800 ${className}`}
    >
      <Sun size={18} className="dark:hidden" />
      <Moon size={18} className="hidden dark:block" />
    </button>
  );
}
