"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";
import { LogOut, Menu, X } from "lucide-react";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { logout } from "@/app/(auth)/actions";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NAV } from "./nav";

export function Sidebar({ companyName, domain }: { companyName: string; domain: string }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="mt-5 space-y-0.5" aria-label="Dashboard">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            aria-current={active ? "page" : undefined}
            className={`relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-medium transition ${
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
            <Icon size={18} className="relative shrink-0" />
            <span className="relative">{label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const company = (
    <div className="mt-5 rounded-2xl bg-white/50 p-3">
      <p className="truncate text-sm font-semibold text-ink">{companyName}</p>
      <p className="truncate text-xs text-muted">{domain}</p>
    </div>
  );

  const footer = (
    <div className="mt-auto flex items-center gap-2 pt-4">
      <form action={logout} className="flex-1">
        <button className="flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-sm font-medium text-ink hover:bg-white/50">
          <LogOut size={16} /> Sign out
        </button>
      </form>
      <ThemeToggle />
    </div>
  );

  return (
    <>
      <header className="glass sticky top-0 z-30 flex items-center justify-between rounded-none border-x-0 border-t-0 px-4 py-3 print:hidden lg:hidden">
        <BrandLockup size="sm" />
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-line text-ink"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {open && (
        <div className="fixed inset-x-0 top-[69px] z-20 flex max-h-[calc(100dvh-69px)] flex-col overflow-y-auto rounded-b-3xl border-b border-line bg-cream-50 px-4 pb-4 shadow-lg lg:hidden">
          {company}
          {nav}
          {footer}
        </div>
      )}

      <aside className="glass sticky top-4 m-4 hidden h-[calc(100vh-2rem)] w-64 shrink-0 flex-col overflow-y-auto rounded-3xl p-5 print:hidden lg:flex">
        <BrandLockup />
        {company}
        {nav}
        {footer}
      </aside>
    </>
  );
}
