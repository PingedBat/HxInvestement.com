"use client";

import { useCountUp, useInView } from "@/lib/hooks";
import { cn } from "@/lib/cn";

export function CountUp({
  value,
  format,
  className,
  durationMs = 1100,
  decimals = 2,
}: {
  value: number;
  format: (n: number) => string;
  className?: string;
  durationMs?: number;
  decimals?: number;
}) {
  const { ref, inView } = useInView<HTMLSpanElement>(0.4);
  const animated = useCountUp(inView ? value : 0, durationMs, decimals);
  return (
    <span ref={ref} className={cn("num", className)}>
      {format(inView ? animated : 0)}
    </span>
  );
}
