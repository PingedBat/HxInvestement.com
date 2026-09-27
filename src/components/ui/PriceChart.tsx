"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { PricePoint } from "@/lib/types";
import { money, shortDate } from "@/lib/format";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/cn";

export function PriceChart({
  series,
  height = 260,
  className,
  showGrid = true,
  showAxis = true,
  interactive = true,
  accent,
  label,
}: {
  series: PricePoint[];
  height?: number;
  className?: string;
  showGrid?: boolean;
  showAxis?: boolean;
  interactive?: boolean;
  accent?: string;
  label?: string;
}) {
  const gid = useId().replace(/:/g, "");
  const wrap = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [width, setWidth] = useState(720);
  const reduced = usePrefersReducedMotion();

  /**
   * The viewBox tracks the real rendered width so one viewBox unit is one CSS
   * pixel. With a fixed width the horizontal axis would compress on narrow
   * screens while the vertical axis did not, turning a gentle series into
   * vertical spikes.
   */
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setWidth(Math.max(160, Math.round(entry.contentRect.width)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const geo = useMemo(() => {
    const values = series.map((p) => p.p);
    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    const pad = (rawMax - rawMin) * 0.14 || rawMax * 0.1 || 1;
    const min = rawMin - pad;
    const max = rawMax + pad;
    const span = max - min || 1;

    const points = values.map((v, i) => ({
      x: (i / Math.max(1, series.length - 1)) * width,
      y: height - ((v - min) / span) * height,
    }));

    const line = points
      .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
      .join(" ");

    return {
      points,
      line,
      area: `${line} L ${width} ${height} L 0 ${height} Z`,
      up: values[values.length - 1] >= values[0],
    };
  }, [series, height, width]);

  const color = accent ?? (geo.up ? "#3df2a7" : "#ff5c5c");
  const active = hover !== null ? series[hover] : null;
  const activePt = hover !== null ? geo.points[hover] : null;

  function onMove(e: React.PointerEvent) {
    if (!interactive || !wrap.current) return;
    const rect = wrap.current.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    setHover(Math.round(frac * (series.length - 1)));
  }

  return (
    <div className={cn("relative select-none", className)}>
      <div
        ref={wrap}
        className="relative"
        style={{ height }}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="absolute inset-0 h-full w-full"
          aria-label={label ?? "Price history"}
          role="img"
        >
          <defs>
            <linearGradient id={`fill-${gid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {showGrid
            ? [0.2, 0.4, 0.6, 0.8].map((f) => (
                <line
                  key={f}
                  x1="0"
                  x2={width}
                  y1={height * f}
                  y2={height * f}
                  stroke="#161a24"
                  strokeWidth="1"
                />
              ))
            : null}

          <motion.path
            d={geo.area}
            fill={`url(#fill-${gid})`}
            initial={reduced ? false : { opacity: 0 }}
            whileInView={reduced ? undefined : { opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.35 }}
          />

          <motion.path
            d={geo.line}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            initial={reduced ? false : { pathLength: 0 }}
            whileInView={reduced ? undefined : { pathLength: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.25, ease: [0.16, 1, 0.3, 1] }}
          />

          {activePt ? (
            <line x1={activePt.x} x2={activePt.x} y1="0" y2={height} stroke="#2a3142" strokeWidth="1" />
          ) : null}
        </svg>

        {activePt && active ? (
          <>
            <div
              className="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-void"
              style={{
                left: `${(activePt.x / width) * 100}%`,
                top: `${(activePt.y / height) * 100}%`,
                background: color,
              }}
            />
            <div
              className="pointer-events-none absolute z-10 -translate-y-full rounded-md border border-line bg-panel-2/95 px-2.5 py-1.5 backdrop-blur"
              style={{
                left: `clamp(0px, calc(${(activePt.x / width) * 100}% - 48px), calc(100% - 104px))`,
                top: `${Math.max(12, (activePt.y / height) * 100 - 6)}%`,
              }}
            >
              <div className="num text-[13px] text-paper">{money(active.p)}</div>
              <div className="num text-[10px] text-mute">{shortDate(active.t)}</div>
            </div>
          </>
        ) : null}
      </div>

      {showAxis ? (
        <div className="mt-2 flex items-center justify-between">
          <span className="num text-[10px] text-mute">{shortDate(series[0].t)}</span>
          <span className="num text-[10px] text-mute">{shortDate(series[series.length - 1].t)}</span>
        </div>
      ) : null}
    </div>
  );
}
