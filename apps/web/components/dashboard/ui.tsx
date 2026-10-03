"use client";

import { animate, motion, useInView, useMotionValue, useTransform } from "motion/react";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
      <h1 className="font-display text-3xl text-forest-800 md:text-4xl">{title}</h1>
      {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
    </motion.div>
  );
}

export function CountUp({ value, suffix = "", decimals = 0 }: { value: number; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => v.toFixed(decimals) + suffix);

  useEffect(() => {
    if (inView) {
      const controls = animate(mv, value, { duration: 1.1, ease: "easeOut" });
      return controls.stop;
    }
  }, [inView, mv, value]);

  return <motion.span ref={ref}>{text}</motion.span>;
}

export function MetricCard({
  label,
  value,
  suffix,
  hint,
  index = 0,
}: {
  label: string;
  value: number | null;
  suffix?: string;
  hint?: string;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="glass rounded-2xl p-5"
    >
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-ink">
        {value === null ? "—" : <CountUp value={value} suffix={suffix} decimals={suffix === "%" ? 1 : 0} />}
      </p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </motion.div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass rounded-3xl p-10 text-center"
    >
      <h2 className="font-display text-2xl text-forest-800">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-muted">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}

const SEVERITY = {
  high: "bg-severity-high/10 text-severity-high",
  medium: "bg-severity-medium/10 text-severity-medium",
  low: "bg-severity-low/10 text-severity-low",
} as const;

export function SeverityBadge({ level }: { level: keyof typeof SEVERITY }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${SEVERITY[level]}`}>
      {level}
    </span>
  );
}

const STATUS: Record<string, string> = {
  pending: "bg-cream-200 text-ink",
  approved: "bg-forest-500/10 text-forest-700",
  rejected: "bg-danger/10 text-danger",
  in_progress: "bg-severity-medium/10 text-severity-medium",
  implemented: "bg-success/15 text-success",
  skipped: "bg-line text-muted",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS[status] ?? STATUS.pending}`}>
      {status.replace("_", " ")}
    </span>
  );
}

export function PrintButton() {
  return (
    <button onClick={() => window.print()} className="glass flex min-h-11 items-center rounded-full px-5 font-semibold text-ink">
      Print / Save PDF
    </button>
  );
}

/** Recommended / Mentioned / Missing for one AI answer. */
export function PresenceBadge({ recommended, mentioned }: { recommended: boolean; mentioned: boolean }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
        recommended ? "bg-success/15 text-success" : mentioned ? "bg-severity-medium/15 text-severity-medium" : "bg-danger/10 text-danger"
      }`}
    >
      {recommended ? "Recommended" : mentioned ? "Mentioned" : "Missing"}
    </span>
  );
}

/** Horizontal bar: value out of max. */
export function Meter({ value, max, tone = "forest" }: { value: number; max: number; tone?: "forest" | "terracotta" }) {
  const width = max ? Math.max(value ? 3 : 0, Math.round((value / max) * 100)) : 0;
  return (
    <span className="block h-2 w-full overflow-hidden rounded-full bg-cream-200" role="presentation">
      <motion.span
        className={`block h-full rounded-full ${tone === "forest" ? "bg-forest-600" : "bg-terracotta-500"}`}
        initial={{ width: 0 }}
        animate={{ width: `${width}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </span>
  );
}

/** Card title with a "see all" link on the right. */
export function CardHeader({ title, href, link }: { title: string; href?: string; link?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="font-semibold text-ink">{title}</h2>
      {href && link && (
        <Link href={href} className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-forest-700">
          {link} <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}
