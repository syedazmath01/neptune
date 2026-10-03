"use client";

import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const axis = { stroke: "var(--color-muted)", fontSize: 12, tickLine: false, axisLine: false };
const tooltip = {
  contentStyle: { background: "var(--color-cream-50)", border: "1px solid var(--color-line)", borderRadius: 12, color: "var(--color-ink)" },
  cursor: { fill: "var(--color-cream-200)", opacity: 0.4 },
};

export function CompetitorChart({ data }: { data: { name: string; mentions: number; recommendations: number }[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--color-line)" />
          <XAxis dataKey="name" {...axis} />
          <YAxis allowDecimals={false} {...axis} />
          <Tooltip {...tooltip} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="mentions" name="Prompts mentioned in" fill="var(--color-forest-500)" radius={[6, 6, 0, 0]} />
          <Bar dataKey="recommendations" name="Prompts recommended in" fill="var(--color-terracotta-500)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TrendChart({
  data,
  names = ["Citation share", "Recommendation share"],
}: {
  data: { round: string; citation: number; recommendation: number }[];
  names?: [string, string];
}) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--color-line)" />
          <XAxis dataKey="round" {...axis} />
          <YAxis unit="%" {...axis} />
          <Tooltip {...tooltip} formatter={(v) => `${v}%`} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="citation" name={names[0]} stroke="var(--color-forest-500)" strokeWidth={2.5} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="recommendation" name={names[1]} stroke="var(--color-terracotta-500)" strokeWidth={2.5} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
