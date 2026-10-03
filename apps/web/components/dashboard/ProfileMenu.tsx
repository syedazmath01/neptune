"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { LogOut, Settings } from "lucide-react";
import { logout } from "@/app/(auth)/actions";

/** Avatar with initials → name, email, account settings, sign out. Native <details>, closed on outside click. */
export function ProfileMenu({ name, email }: { name: string | null; email: string }) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current?.open && !ref.current.contains(e.target as Node)) ref.current.open = false;
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const initials = name
    ? name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("")
    : (email[0] ?? "?").toUpperCase();

  return (
    <details ref={ref} className="relative">
      <summary
        aria-label="Account menu"
        className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full bg-gradient-to-br from-terracotta-400 to-forest-600 font-semibold text-white shadow-sm [&::-webkit-details-marker]:hidden"
      >
        {initials}
      </summary>
      <div className="absolute right-0 z-40 mt-2 w-64 rounded-2xl border border-line bg-cream-50 p-2 shadow-lg">
        <div className="px-3 py-2">
          {name && <p className="truncate font-semibold text-ink">{name}</p>}
          <p className="truncate text-sm text-muted">{email}</p>
        </div>
        <Link
          href="/settings"
          onClick={() => ref.current && (ref.current.open = false)}
          className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm text-ink hover:bg-cream-100"
        >
          <Settings size={16} /> Account & plan
        </Link>
        <form action={logout}>
          <button className="flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-sm font-medium text-danger hover:bg-cream-100">
            <LogOut size={16} /> Sign out
          </button>
        </form>
      </div>
    </details>
  );
}
