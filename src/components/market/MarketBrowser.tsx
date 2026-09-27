"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { games } from "@/data/games";
import { platformList } from "@/lib/platforms";
import { GameCard } from "@/components/market/GameCard";
import { PlatformTag } from "@/components/ui/PlatformIcon";
import { Sparkline } from "@/components/ui/Sparkline";
import { Delta } from "@/components/ui/Delta";
import { Input } from "@/components/ui/Field";
import { compact, compactMoney, money } from "@/lib/format";
import type { Platform } from "@/lib/types";
import { cn } from "@/lib/cn";

type Sort = "cap" | "change7d" | "price" | "players" | "newest";

const sorts: { id: Sort; label: string }[] = [
  { id: "cap", label: "Market cap" },
  { id: "change7d", label: "7d change" },
  { id: "players", label: "Players" },
  { id: "price", label: "Price" },
  { id: "newest", label: "Newest" },
];

export function MarketBrowser({ initialPlatform }: { initialPlatform?: Platform }) {
  const [platform, setPlatform] = useState<Platform | "all">(initialPlatform ?? "all");
  const [sort, setSort] = useState<Sort>("cap");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "table">("grid");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return games
      .filter((g) => (platform === "all" ? true : g.platform === platform))
      .filter((g) =>
        !q
          ? true
          : g.title.toLowerCase().includes(q) ||
            g.ticker.toLowerCase().includes(q) ||
            g.genre.toLowerCase().includes(q),
      )
      .sort((a, b) => {
        switch (sort) {
          case "change7d":
            return b.change7d - a.change7d;
          case "price":
            return b.price - a.price;
          case "players":
            return b.stats.mau - a.stats.mau;
          case "newest":
            return b.listedAt.localeCompare(a.listedAt);
          default:
            return b.price * b.sharesTotal - a.price * a.sharesTotal;
        }
      });
  }, [platform, sort, query]);

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-line pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <FilterChip active={platform === "all"} onClick={() => setPlatform("all")}>
            All <span className="num ml-1.5 text-[10px] text-mute">{games.length}</span>
          </FilterChip>
          {platformList.map((p) => {
            const count = games.filter((g) => g.platform === p.id).length;
            return (
              <FilterChip key={p.id} active={platform === p.id} onClick={() => setPlatform(p.id)}>
                <span style={{ color: platform === p.id ? p.tint : undefined }}>{p.label}</span>
                <span className="num ml-1.5 text-[10px] text-mute">{count}</span>
              </FilterChip>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, ticker or genre"
            className="h-9 w-full text-[13px] sm:w-56"
          />
          <div className="flex items-center gap-2">
            <div className="no-scrollbar flex gap-1 overflow-x-auto">
              {sorts.map((s) => (
                <FilterChip key={s.id} active={sort === s.id} onClick={() => setSort(s.id)} small>
                  {s.label}
                </FilterChip>
              ))}
            </div>
            <div className="ml-auto flex shrink-0 rounded-lg border border-line bg-panel p-0.5">
              {(["grid", "table"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  aria-label={`${v} view`}
                  className={cn(
                    "grid size-7 place-items-center rounded-md transition-colors",
                    view === v ? "bg-panel-2 text-paper" : "text-mute hover:text-paper",
                  )}
                >
                  {v === "grid" ? (
                    <svg viewBox="0 0 14 14" width="12" height="12" fill="currentColor" aria-hidden>
                      <rect x="1" y="1" width="5" height="5" rx="1" />
                      <rect x="8" y="1" width="5" height="5" rx="1" />
                      <rect x="1" y="8" width="5" height="5" rx="1" />
                      <rect x="8" y="8" width="5" height="5" rx="1" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 14 14" width="12" height="12" fill="currentColor" aria-hidden>
                      <rect x="1" y="2" width="12" height="1.8" rx="0.9" />
                      <rect x="1" y="6.1" width="12" height="1.8" rx="0.9" />
                      <rect x="1" y="10.2" width="12" height="1.8" rx="0.9" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="py-20 text-center text-sm text-mute">
          No listings match that search.
        </p>
      ) : view === "grid" ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rows.map((g) => (
            <GameCard key={g.id} game={g} />
          ))}
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[820px] border-separate border-spacing-0">
            <thead>
              <tr className="text-left">
                {["Listing", "Platform", "Price", "24h", "7d", "Market cap", "Players", "Trend"].map((h) => (
                  <th key={h} className="eyebrow border-b border-line px-3 py-2.5 font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((g) => (
                <tr key={g.id} className="group">
                  <td className="border-b border-line-soft px-3 py-3">
                    <Link href={`/game/${g.slug}`} className="flex items-center gap-3">
                      <span
                        className="size-8 shrink-0 rounded-md"
                        style={{ background: `linear-gradient(135deg, ${g.art[0]}, ${g.art[1]})` }}
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] text-paper group-hover:text-signal">
                          {g.title}
                        </span>
                        <span className="num block text-[10px] uppercase tracking-[0.14em] text-mute">
                          {g.ticker} · {g.genre}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="border-b border-line-soft px-3 py-3">
                    <PlatformTag platform={g.platform} />
                  </td>
                  <td className="num border-b border-line-soft px-3 py-3 text-[13px] text-paper">
                    {money(g.price)}
                  </td>
                  <td className="border-b border-line-soft px-3 py-3 text-[12px]">
                    <Delta value={g.change24h} arrow={false} />
                  </td>
                  <td className="border-b border-line-soft px-3 py-3 text-[12px]">
                    <Delta value={g.change7d} arrow={false} />
                  </td>
                  <td className="num border-b border-line-soft px-3 py-3 text-[13px] text-mute-2">
                    {compactMoney(g.price * g.sharesTotal)}
                  </td>
                  <td className="num border-b border-line-soft px-3 py-3 text-[13px] text-mute-2">
                    {compact(g.stats.mau)}
                  </td>
                  <td className="border-b border-line-soft px-3 py-3">
                    <Sparkline series={g.history.slice(-30)} className="h-7 w-20" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
  small,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 whitespace-nowrap rounded-lg border transition-colors duration-200",
        small ? "px-2.5 py-1.5 text-[11px]" : "px-3.5 py-2 text-[13px]",
        active
          ? "border-[#2c3446] bg-panel-2 text-paper"
          : "border-transparent text-mute hover:bg-panel hover:text-paper",
      )}
    >
      {children}
    </button>
  );
}
