"use client";

import { animate, motion, useInView, useMotionValue, useTransform } from "motion/react";
import { useEffect, useRef } from "react";

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
