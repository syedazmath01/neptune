"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { logout } from "@/app/(auth)/actions";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV = [
  { href: "/overview", label: "Overview" },
  { href: "/gaps", label: "Gaps" },
  { href: "/recommendations", label: "Recommendations" },
  { href: "/results", label: "Results" },
  { href: "/settings", label: "Settings" },
];

export function Sidebar({ companyName, domain }: { companyName: string; domain: string }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="mt-6 space-y-1">
      {NAV.map((item) => {
        const active = path.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`relative flex min-h-11 items-center rounded-xl px-3 text-[15px] font-medium transition ${
              active ? "text-forest-800" : "text-muted hover:bg-white/50 hover:text-ink"
            }`}
          >
            {active && (
              <motion.span
                layoutId="nav-active"
                className="absolute inset-0 rounded-xl bg-white/70 shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const account = (
    <div className="mt-6 rounded-2xl bg-white/50 p-3">
      <p className="truncate text-sm font-semibold text-ink">{companyName}</p>
      <p className="truncate text-xs text-muted">{domain}</p>
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between print:hidden glass rounded-none border-x-0 border-t-0 px-4 py-3 lg:hidden">
        <BrandLockup href="/overview" size="sm" />
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-line text-xl"
        >
          {open ? "✕" : "☰"}
        </button>
      </header>

      {open && (
        <div className="fixed inset-x-0 top-[69px] z-20 glass rounded-b-3xl px-4 pb-4 lg:hidden">
          {account}
          {nav}
        </div>
      )}

      <aside className="glass sticky top-4 m-4 hidden print:hidden h-[calc(100vh-2rem)] w-64 shrink-0 flex-col rounded-3xl p-5 lg:flex">
        <BrandLockup href="/overview" />
        {account}
        {nav}
        <div className="mt-auto flex items-center gap-2">
          <form action={logout} className="flex-1">
            <button className="min-h-11 w-full rounded-xl px-3 text-left text-sm text-muted hover:bg-white/50">
              Sign out
            </button>
          </form>
          <ThemeToggle />
        </div>
      </aside>
    </>
  );
}
