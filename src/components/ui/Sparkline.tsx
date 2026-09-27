import type { PricePoint } from "@/lib/types";
import { cn } from "@/lib/cn";

export function Sparkline({
  series,
  className,
  width = 120,
  height = 32,
  color,
}: {
  series: PricePoint[];
  className?: string;
  width?: number;
  height?: number;
  color?: string;
}) {
  if (series.length < 2) return null;

  const values = series.map((p) => p.p);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const stroke = color ?? (values[values.length - 1] >= values[0] ? "#3df2a7" : "#ff5c5c");

  const d = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / span) * (height - 3) - 1.5;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn("block", className)}
      aria-hidden
    >
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
