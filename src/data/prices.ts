import { gauss, rngFor } from "@/lib/rng";
import type { PricePoint } from "@/lib/types";

/**
 * Fixed clock for all generated history. Hard-coded rather than `Date.now()`
 * so the server and the browser generate byte-identical series.
 */
export const ANCHOR = Date.UTC(2026, 8, 26, 0, 0, 0);
const DAY = 86_400_000;
const HOUR = 3_600_000;

function isoDay(ms: number) {
  return new Date(ms).toISOString().slice(0, 10);
}

/**
 * Walks a geometric series forward, then rescales it so the final value lands
 * exactly on `endPrice`. Keeps the shape organic while pinning the endpoint to
 * the quoted price.
 */
function walk(seed: string, steps: number, endPrice: number, trend: number, vol: number) {
  const rand = rngFor(seed);
  const raw: number[] = [1];
  for (let i = 1; i < steps; i++) {
    const drift = trend / steps;
    const shock = vol * gauss(rand);
    raw.push(Math.max(0.05, raw[i - 1] * (1 + drift + shock)));
  }
  const scale = endPrice / raw[raw.length - 1];
  return raw.map((v) => Math.max(0.01, Math.round(v * scale * 100) / 100));
}

export function dailySeries(
  seed: string,
  days: number,
  endPrice: number,
  trend: number,
  vol: number,
): PricePoint[] {
  const values = walk(`${seed}:daily`, days, endPrice, trend, vol);
  return values.map((p, i) => ({ t: isoDay(ANCHOR - (days - 1 - i) * DAY), p }));
}

export function intradaySeries(
  seed: string,
  hours: number,
  endPrice: number,
  trend: number,
  vol: number,
): PricePoint[] {
  const values = walk(`${seed}:intra`, hours, endPrice, trend, vol);
  return values.map((p, i) => ({
    t: new Date(ANCHOR - (hours - 1 - i) * HOUR).toISOString(),
    p,
  }));
}

export function changeBetween(from: number, to: number): number {
  if (from <= 0) return 0;
  return Math.round(((to - from) / from) * 10000) / 100;
}

/** Index into a series from the end, clamped. */
export function backAt(series: PricePoint[], stepsBack: number): number {
  const i = Math.max(0, series.length - 1 - stepsBack);
  return series[i].p;
}
