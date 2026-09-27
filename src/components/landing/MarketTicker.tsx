"use client";

import Link from "next/link";
import { games } from "@/data/games";
import { money, signedPct } from "@/lib/format";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/cn";

export function MarketTicker() {
  const reduced = usePrefersReducedMotion();
  const row = [...games].sort((a, b) => b.change24h - a.change24h);
  const stream = reduced ? row : [...row, ...row];

  return (
    <div className="relative overflow-hidden border-y border-line bg-ink/60">
      <div
        className={cn(
          "flex w-max items-center",
          reduced ? "overflow-x-auto" : "animate-[hx-marquee_64s_linear_infinite] hover:[animation-play-state:paused]",
        )}
      >
        {stream.map((g, i) => (
          <Link
            key={`${g.id}-${i}`}
            href={`/game/${g.slug}`}
            className="flex shrink-0 items-baseline gap-2.5 border-r border-line-soft px-5 py-3 transition-colors hover:bg-panel"
          >
            <span className="num text-[11px] uppercase tracking-[0.14em] text-mute-2">{g.ticker}</span>
            <span className="num text-[13px] text-paper">{money(g.price)}</span>
            <span className={cn("num text-[11px]", g.change24h >= 0 ? "text-signal" : "text-loss")}>
              {signedPct(g.change24h)}
            </span>
          </Link>
        ))}
      </div>

      <style jsx global>{`
        @keyframes hx-marquee {
          from {
            transform: translate3d(0, 0, 0);
          }
          to {
            transform: translate3d(-50%, 0, 0);
          }
        }
      `}</style>
    </div>
  );
}
