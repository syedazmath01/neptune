import Image from "next/image";
import Link from "next/link";

type Props = {
  href?: string;
  size?: "sm" | "md" | "lg";
  tone?: "light" | "dark";
};

const sizes = {
  sm: { icon: 28, word: "text-base", by: "text-[10px]" },
  md: { icon: 36, word: "text-xl", by: "text-[11px]" },
  lg: { icon: 48, word: "text-3xl", by: "text-sm" },
};

// Branding Convention (prd.md): 99sols.ai icon + NEPTUNE wordmark + "by 99sols.ai" — always together.
export function BrandLockup({ href = "/", size = "md", tone = "light" }: Props) {
  const s = sizes[size];
  const wordColor = tone === "light" ? "text-forest-800" : "text-cream-50";
  const byColor = tone === "light" ? "text-muted" : "text-cream-200";

  return (
    <Link href={href} className="inline-flex items-center gap-2.5" aria-label="Neptune by 99sols.ai">
      <Image
        src="/brand/icon-192.png"
        alt="99sols.ai"
        width={s.icon}
        height={s.icon}
        className="rounded-lg shadow-sm"
        priority
      />
      <span className="flex flex-col leading-none">
        <span className={`${s.word} ${wordColor} font-bold tracking-[0.12em]`}>NEPTUNE</span>
        <span className={`${s.by} ${byColor} mt-1 font-medium tracking-wide`}>by 99sols.ai</span>
      </span>
    </Link>
  );
}
