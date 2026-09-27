import { games } from "@/data/games";
import { rngFor } from "@/lib/rng";
import type { LeaderboardEntry, RushCycle } from "@/lib/types";

const WEEK = 7 * 86_400_000;
/** Monday 2026-01-05 00:00 UTC — every cycle boundary is an offset from here. */
const CYCLE_EPOCH = Date.UTC(2026, 0, 5);

/**
 * Cycle boundaries are derived from the real clock, so this must only be called
 * from the client after mount. Server-rendered markup uses a neutral placeholder.
 */
export function currentCycle(now: number): RushCycle {
  const index = Math.floor((now - CYCLE_EPOCH) / WEEK);
  const startsAt = CYCLE_EPOCH + index * WEEK;
  const endsAt = startsAt + WEEK;
  const week = (index % 52) + 1;
  return {
    id: `cycle-${index}`,
    label: `Week ${String(week).padStart(2, "0")}`,
    startsAt,
    endsAt,
  };
}

export function cycleProgress(cycle: RushCycle, now: number): number {
  return Math.min(1, Math.max(0, (now - cycle.startsAt) / (cycle.endsAt - cycle.startsAt)));
}

export const rushGames = games.filter((g) => g.rushEligible);

const handles = [
  "atlasrun",
  "mikoyen",
  "deltafade",
  "roan_k",
  "peachwire",
  "sixstring",
  "nullcast",
  "vireo",
  "halcyonx",
  "bruneldev",
  "koto_m",
  "wren88",
];

export const leaderboard: LeaderboardEntry[] = handles
  .map((handle, i) => {
    const rand = rngFor(`lb:${handle}`);
    const base = 46 - i * 3.4;
    const returnPct = Math.round((base + (rand() - 0.5) * 6) * 100) / 100;
    const stake = 3_000 + Math.floor(rand() * 9_000);
    return {
      handle: `@${handle}`,
      hue: Math.floor(rand() * 360),
      returnPct,
      pnl: Math.round(stake * (returnPct / 100)),
      trades: 8 + Math.floor(rand() * 34),
      topHolding: rushGames[Math.floor(rand() * rushGames.length)].ticker,
    };
  })
  .sort((a, b) => b.returnPct - a.returnPct)
  .map((entry, i) => ({ ...entry, rank: i + 1 }));

/** Prior cycle, used by the results screen. */
export const lastCycleResults = {
  label: "Week 38",
  participants: 4_182,
  medianReturn: 2.8,
  topReturn: 61.4,
  totalVolume: 1_940_000,
  yourRank: 214,
  yourReturn: 11.6,
  yourPnl: 232.0,
  yourTrades: 9,
  bestTrade: { ticker: "ACA", gain: 148.2, pct: 18.4 },
  worstTrade: { ticker: "SHT", gain: -46.5, pct: -6.1 },
};
