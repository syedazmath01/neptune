"use client";

import { ChevronDown } from "lucide-react";

const LINKS = [["How Neptune Works", "#how"], ["Platform Coverage", "#coverage"], ["Roadmap", "#roadmap"], ["FAQ", "#faq"]] as const;

// Opens on hover/focus via CSS; clicking a link blurs it so the menu closes.
export function ResourcesMenu() {
  return (
    <li className="group relative">
      <button className="flex items-center gap-1 py-2" aria-haspopup="true">
        Resources <ChevronDown size={15} className="transition group-hover:rotate-180 group-focus-within:rotate-180" />
      </button>
      <ul className="glass invisible absolute left-1/2 top-full w-52 -translate-x-1/2 rounded-2xl bg-white/92! p-2 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        {LINKS.map(([label, href]) => (
          <li key={label}>
            <a
              href={href}
              onClick={(e) => e.currentTarget.blur()}
              className="block rounded-xl px-3 py-2.5 hover:bg-cream-100"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </li>
  );
}
