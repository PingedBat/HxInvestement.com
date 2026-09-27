import { getGame } from "@/data/games";
import type { Holding, RushPosition } from "@/lib/types";

export interface HoldingRow {
  gameId: string;
  title: string;
  ticker: string;
  platform: string;
  art: [string, string];
  shares: number;
  costBasis: number;
  price: number;
  cost: number;
  value: number;
  pnl: number;
  pnlPct: number;
  change24h: number;
  openedAt: string;
  weight: number;
}

export function buildHoldingRows(holdings: Holding[]): HoldingRow[] {
  const rows = holdings.flatMap((h) => {
    const game = getGame(h.gameId);
    if (!game) return [];
    const cost = h.shares * h.costBasis;
    const value = h.shares * game.price;
    return [
      {
        gameId: h.gameId,
        title: game.title,
        ticker: game.ticker,
        platform: game.platform,
        art: game.art,
        shares: h.shares,
        costBasis: h.costBasis,
        price: game.price,
        cost,
        value,
        pnl: value - cost,
        pnlPct: cost > 0 ? ((value - cost) / cost) * 100 : 0,
        change24h: game.change24h,
        openedAt: h.openedAt,
        weight: 0,
      },
    ];
  });

  const total = rows.reduce((s, r) => s + r.value, 0);
  return rows
    .map((r) => ({ ...r, weight: total > 0 ? (r.value / total) * 100 : 0 }))
    .sort((a, b) => b.value - a.value);
}

export interface RushRow {
  gameId: string;
  title: string;
  ticker: string;
  art: [string, string];
  shares: number;
  entryPrice: number;
  price: number;
  cost: number;
  value: number;
  pnl: number;
  pnlPct: number;
  openedAt: string;
}

export function buildRushRows(positions: RushPosition[]): RushRow[] {
  return positions
    .flatMap((p) => {
      const game = getGame(p.gameId);
      if (!game) return [];
      const cost = p.shares * p.entryPrice;
      const value = p.shares * game.price;
      return [
        {
          gameId: p.gameId,
          title: game.title,
          ticker: game.ticker,
          art: game.art,
          shares: p.shares,
          entryPrice: p.entryPrice,
          price: game.price,
          cost,
          value,
          pnl: value - cost,
          pnlPct: cost > 0 ? ((value - cost) / cost) * 100 : 0,
          openedAt: p.openedAt,
        },
      ];
    })
    .sort((a, b) => b.value - a.value);
}

export function summarise(rows: { cost: number; value: number }[]) {
  const cost = rows.reduce((s, r) => s + r.cost, 0);
  const value = rows.reduce((s, r) => s + r.value, 0);
  const pnl = value - cost;
  return { cost, value, pnl, pnlPct: cost > 0 ? (pnl / cost) * 100 : 0 };
}

/**
 * Weighted portfolio value over the last `days`, reconstructed from each
 * holding's own price history at today's share counts.
 */
export function portfolioSeries(holdings: Holding[], days: number, cash: number) {
  const series: { t: string; p: number }[] = [];
  const contributors = holdings
    .map((h) => ({ h, game: getGame(h.gameId) }))
    .filter((c) => c.game);

  if (!contributors.length) return series;

  const length = contributors[0].game!.history.length;
  const start = Math.max(0, length - days);

  for (let i = start; i < length; i++) {
    let total = cash;
    for (const { h, game } of contributors) {
      total += h.shares * game!.history[i].p;
    }
    series.push({ t: contributors[0].game!.history[i].t, p: Math.round(total * 100) / 100 });
  }
  return series;
}
