"use client";

import { useState } from "react";
import { PriceChart } from "@/components/ui/PriceChart";
import { Panel } from "@/components/ui/Panel";
import { Delta } from "@/components/ui/Delta";
import { money } from "@/lib/format";
import { changeBetween } from "@/data/prices";
import type { Game } from "@/lib/types";
import { cn } from "@/lib/cn";

const ranges = [
  { id: "7d", label: "7D" },
  { id: "30d", label: "30D" },
  { id: "90d", label: "90D" },
  { id: "180d", label: "180D" },
] as const;

type RangeId = (typeof ranges)[number]["id"];

export function PriceCard({ game }: { game: Game }) {
  const [range, setRange] = useState<RangeId>("30d");

  const series =
    range === "7d"
      ? game.intraday
      : game.history.slice(range === "30d" ? -30 : range === "90d" ? -90 : -180);

  const change = changeBetween(series[0].p, series[series.length - 1].p);
  const high = Math.max(...series.map((p) => p.p));
  const low = Math.min(...series.map((p) => p.p));

  return (
    <Panel>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-4 py-3.5 sm:px-5">
        <div className="flex items-baseline gap-3">
          <h3 className="eyebrow">Price history</h3>
          <Delta value={change} className="text-[12px]" />
        </div>
        <div className="flex rounded-lg border border-line bg-panel-2 p-0.5">
          {ranges.map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={cn(
                "num rounded-md px-2.5 py-1 text-[11px] uppercase tracking-wider transition-colors",
                range === r.id ? "bg-[#1c2230] text-paper" : "text-mute hover:text-paper",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-4 pt-5 sm:px-5">
        <PriceChart
          key={range}
          series={series}
          height={280}
          label={`${game.ticker} price over ${range}`}
        />

        <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-line-soft pt-4 sm:grid-cols-4">
          <Cell label="Open" value={money(series[0].p)} />
          <Cell label="High" value={money(high)} />
          <Cell label="Low" value={money(low)} />
          <Cell label="Last" value={money(game.price)} accent />
        </dl>
      </div>
    </Panel>
  );
}

function Cell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <dt className="eyebrow text-[9px]">{label}</dt>
      <dd className={cn("num mt-1 text-[13px]", accent ? "text-paper" : "text-mute-2")}>{value}</dd>
    </div>
  );
}
