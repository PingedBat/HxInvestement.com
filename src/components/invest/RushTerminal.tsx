"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { Button, ButtonLink, ArrowRight } from "@/components/ui/Button";
import { Delta, Badge } from "@/components/ui/Delta";
import { Sparkline } from "@/components/ui/Sparkline";
import { ModeSwitch } from "@/components/invest/ModeSwitch";
import { AccountGate } from "@/components/invest/AccountGate";
import { useApp } from "@/lib/store";
import { useHydrated, useNow, usePrefersReducedMotion } from "@/lib/hooks";
import { buildRushRows, summarise } from "@/lib/portfolio";
import { currentCycle, cycleProgress, leaderboard, rushGames } from "@/data/rush";
import { money, num, pct, signedMoney, signedPct } from "@/lib/format";
import { cn } from "@/lib/cn";

function countdown(ms: number) {
  const clamped = Math.max(0, ms);
  const d = Math.floor(clamped / 86_400_000);
  const h = Math.floor((clamped % 86_400_000) / 3_600_000);
  const m = Math.floor((clamped % 3_600_000) / 60_000);
  const s = Math.floor((clamped % 60_000) / 1000);
  return { d, h, m, s };
}

export function RushTerminal() {
  const hydrated = useHydrated();
  const reduced = usePrefersReducedMotion();
  const account = useApp((s) => s.account);
  const rushCash = useApp((s) => s.rushCash);
  const positions = useApp((s) => s.rushPositions);
  const buy = useApp((s) => s.buy);
  const sell = useApp((s) => s.sell);

  const now = useNow(1000);
  const [selected, setSelected] = useState(rushGames[0].id);
  const [qty, setQty] = useState(50);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // One shared ticker for every quote on screen, rather than a timer per row.
  const [live, setLive] = useState<Record<string, number>>(() =>
    Object.fromEntries(rushGames.map((g) => [g.id, g.price])),
  );

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => {
      setLive((prev) => {
        const next: Record<string, number> = {};
        for (const g of rushGames) {
          const p = prev[g.id] ?? g.price;
          const pull = (g.price - p) * 0.14;
          const shock = (Math.random() - 0.5) * g.price * 0.008;
          next[g.id] = Math.max(0.01, Math.round((p + pull + shock) * 100) / 100);
        }
        return next;
      });
    }, 2000);
    return () => window.clearInterval(id);
  }, [reduced]);

  const rows = useMemo(() => buildRushRows(positions), [positions]);
  const totals = useMemo(() => summarise(rows), [rows]);

  const cycle = now ? currentCycle(now) : null;
  const left = cycle && now ? countdown(cycle.endsAt - now) : null;
  const progress = cycle && now ? cycleProgress(cycle, now) : 0;

  const board = useMemo(() => {
    const yourReturn = totals.cost > 0 ? (totals.pnl / totals.cost) * 100 : 0;
    const entries = [
      ...leaderboard,
      {
        rank: 0,
        handle: account?.handle ?? "@you",
        hue: 152,
        returnPct: Math.round(yourReturn * 100) / 100,
        pnl: Math.round(totals.pnl),
        trades: positions.length,
        topHolding: rows[0]?.ticker ?? "—",
        isYou: true,
      },
    ]
      .sort((a, b) => b.returnPct - a.returnPct)
      .map((e, i) => ({ ...e, rank: i + 1 }));
    return entries;
  }, [totals, account, positions.length, rows]);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10">
        <div className="h-72 animate-pulse rounded-xl bg-panel" />
      </div>
    );
  }

  if (!account || account.type !== "investor") {
    return <AccountGate isDeveloper={account?.type === "developer"} />;
  }

  const game = rushGames.find((g) => g.id === selected)!;
  const quote = live[game.id] ?? game.price;
  const held = positions.find((p) => p.gameId === game.id);
  const cost = qty * quote;

  function order(side: "buy" | "sell") {
    setError(null);
    if (qty <= 0) return setError("Enter a share quantity.");
    if (side === "buy") {
      if (cost > rushCash) return setError("Insufficient Rush balance for this order.");
      buy("rush", game.id, qty, quote);
      setReceipt(`Bought ${num(qty)} ${game.ticker} at ${money(quote)}`);
    } else {
      if (!held || held.shares < qty) return setError(`You hold ${num(held?.shares ?? 0)} shares.`);
      sell("rush", game.id, qty, quote);
      setReceipt(`Sold ${num(qty)} ${game.ticker} at ${money(quote)}`);
    }
    window.setTimeout(() => setReceipt(null), 4000);
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
      <div className="flex flex-col gap-6 border-b border-line pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#ff9f4a] opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-[#ff9f4a]" />
            </span>
            <span className="eyebrow">
              Rush · {cycle ? `${cycle.label} in progress` : "Loading cycle"}
            </span>
          </div>
          <h1 className="tight mt-3 text-3xl font-semibold text-paper sm:text-5xl">
            {left ? (
              <span className="num">
                {left.d}d {String(left.h).padStart(2, "0")}h {String(left.m).padStart(2, "0")}m{" "}
                <span className="text-mute-2">{String(left.s).padStart(2, "0")}s</span>
              </span>
            ) : (
              <span className="num text-mute">--d --h --m --s</span>
            )}
          </h1>
          <p className="mt-3 text-[13px] text-mute">
            until the cycle closes and open positions settle automatically
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <ModeSwitch active="rush" />
          <Link
            href="/learn/rush"
            className="num text-[11px] uppercase tracking-[0.14em] text-mute transition-colors hover:text-signal"
          >
            How Rush works
          </Link>
        </div>
      </div>

      <div className="mt-6">
        <div className="h-1 w-full overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-[#ff9f4a] transition-[width] duration-1000 ease-linear"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <div className="num mt-2 flex justify-between text-[10px] uppercase tracking-[0.14em] text-mute">
          <span>Monday open</span>
          <span>{pct(progress * 100, 0)} elapsed</span>
          <span>Sunday 23:59 UTC</span>
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
        <Metric label="Rush balance" value={money(rushCash)} />
        <Metric label="Open positions" value={money(totals.value)} />
        <Metric
          label="Cycle P/L"
          value={signedMoney(totals.pnl)}
          tone={totals.pnl >= 0 ? "signal" : "loss"}
        />
        <Metric
          label="Cycle return"
          value={signedPct(totals.cost > 0 ? (totals.pnl / totals.cost) * 100 : 0)}
          tone={totals.pnl >= 0 ? "signal" : "loss"}
        />
      </dl>

      <div className="mt-8 grid gap-5 xl:grid-cols-[1fr_1.25fr_0.9fr]">
        {/* Order panel */}
        <Panel className="h-fit">
          <PanelHeader
            title="Order"
            action={
              <span className="num flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-mute">
                <span className={cn("size-1 rounded-full bg-signal", !reduced && "animate-pulse")} />
                Live
              </span>
            }
          />
          <div className="px-4 py-5 sm:px-5">
            <label className="block">
              <span className="eyebrow">Listing</span>
              <div className="mt-2 max-h-52 space-y-1 overflow-y-auto pr-1">
                {rushGames.map((g) => {
                  const q = live[g.id] ?? g.price;
                  const drift = ((q - g.price) / g.price) * 100;
                  return (
                    <button
                      key={g.id}
                      onClick={() => setSelected(g.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                        selected === g.id
                          ? "border-signal/45 bg-panel-2"
                          : "border-line-soft hover:border-line hover:bg-panel-2/60",
                      )}
                    >
                      <span
                        className="size-6 shrink-0 rounded"
                        style={{ background: `linear-gradient(135deg, ${g.art[0]}, ${g.art[1]})` }}
                      />
                      <span className="num min-w-0 flex-1 text-[11px] uppercase tracking-[0.12em] text-mute-2">
                        {g.ticker}
                      </span>
                      <span className="num text-[12px] text-paper">{money(q)}</span>
                      <span
                        className={cn(
                          "num w-12 text-right text-[10px]",
                          drift >= 0 ? "text-signal" : "text-loss",
                        )}
                      >
                        {signedPct(drift)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </label>

            <div className="mt-4">
              <div className="mb-2 flex items-baseline justify-between">
                <span className="eyebrow">Shares</span>
                <span className="num text-[10px] text-mute">
                  Max {num(Math.floor(rushCash / quote))}
                </span>
              </div>
              <input
                type="number"
                value={qty}
                min={1}
                onChange={(e) => setQty(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
                className="num h-11 w-full rounded-lg border border-line bg-panel-2 px-3 text-center text-[15px] text-paper outline-none focus:border-signal/60"
              />
              <div className="mt-2 flex gap-1.5">
                {[25, 50, 100].map((n) => (
                  <button
                    key={n}
                    onClick={() => setQty(n)}
                    className="num flex-1 rounded-md border border-line bg-panel py-1.5 text-[11px] text-mute transition-colors hover:text-paper"
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setQty(Math.floor(rushCash / quote))}
                  className="num flex-1 rounded-md border border-line bg-panel py-1.5 text-[11px] text-mute transition-colors hover:text-paper"
                >
                  Max
                </button>
              </div>
            </div>

            <dl className="mt-4 space-y-2 border-t border-line-soft pt-4">
              <Row label="Quote" value={money(quote)} />
              <Row label="Order value" value={money(cost)} strong />
              <Row label="Rush balance" value={money(rushCash)} />
              {held ? <Row label="You hold" value={`${num(held.shares)} sh`} /> : null}
            </dl>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button onClick={() => order("buy")}>Buy</Button>
              <Button variant="danger" onClick={() => order("sell")} disabled={!held}>
                Sell
              </Button>
            </div>

            <AnimatePresence>
              {error ? (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 rounded-lg border border-loss/30 bg-loss/10 px-3 py-2 text-[12px] text-loss"
                >
                  {error}
                </motion.p>
              ) : null}
              {receipt ? (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="num mt-3 rounded-lg border border-signal/30 bg-signal/10 px-3 py-2 text-[12px] text-signal"
                >
                  {receipt}
                </motion.p>
              ) : null}
            </AnimatePresence>

            <p className="num mt-4 text-center text-[10px] uppercase tracking-[0.12em] text-mute">
              Rush shares expire at cycle close
            </p>
          </div>
        </Panel>

        {/* Positions */}
        <Panel className="h-fit">
          <PanelHeader
            title="Open positions"
            action={<span className="num text-[10px] text-mute">{rows.length} open</span>}
          />
          {rows.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-sm text-mute">No positions open in this cycle.</p>
              <p className="mt-2 text-[12px] text-mute">
                Place an order to start scoring. The cycle ends whether you trade or not.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-line-soft">
              {rows.map((r) => {
                const q = live[r.gameId] ?? r.price;
                const pnl = r.shares * (q - r.entryPrice);
                const pnlPct = (pnl / (r.shares * r.entryPrice)) * 100;
                const g = rushGames.find((x) => x.id === r.gameId);
                return (
                  <li key={r.gameId} className="px-4 py-3.5 sm:px-5">
                    <div className="flex items-center gap-3">
                      <span
                        className="size-8 shrink-0 rounded-md"
                        style={{ background: `linear-gradient(135deg, ${r.art[0]}, ${r.art[1]})` }}
                      />
                      <div className="min-w-0 flex-1">
                        <Link href={`/game/${r.gameId}`} className="block truncate text-[13px] text-paper hover:text-signal">
                          {r.title}
                        </Link>
                        <div className="num mt-0.5 text-[10px] uppercase tracking-[0.12em] text-mute">
                          {num(r.shares)} sh @ {money(r.entryPrice)}
                        </div>
                      </div>
                      {g ? <Sparkline series={g.intraday.slice(-40)} className="h-7 w-16" /> : null}
                      <div className="w-24 text-right">
                        <div className="num text-[13px] text-paper">{money(q)}</div>
                        <div className={cn("num text-[11px]", pnl >= 0 ? "text-signal" : "text-loss")}>
                          {signedMoney(pnl)} · {signedPct(pnlPct)}
                        </div>
                      </div>
                      <button
                        onClick={() => sell("rush", r.gameId, r.shares, q)}
                        className="num shrink-0 rounded-md border border-line px-2.5 py-1.5 text-[11px] uppercase tracking-[0.12em] text-mute transition-colors hover:border-loss/40 hover:text-loss"
                      >
                        Close
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="border-t border-line px-4 py-3.5 sm:px-5">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-mute">Settles at cycle close</span>
              <ButtonLink href="/invest/rush/results" variant="ghost" size="sm">
                Last cycle result <ArrowRight />
              </ButtonLink>
            </div>
          </div>
        </Panel>

        {/* Leaderboard */}
        <Panel className="h-fit">
          <PanelHeader
            title="Weekly leaderboard"
            action={<Badge tone="outline">{cycle?.label ?? "—"}</Badge>}
          />
          <ol className="divide-y divide-line-soft">
            {board.slice(0, 11).map((e) => (
              <li
                key={e.handle}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 sm:px-5",
                  e.isYou && "bg-signal/[0.06]",
                )}
              >
                <span className="num w-6 shrink-0 text-[11px] text-mute">
                  {String(e.rank).padStart(2, "0")}
                </span>
                <span
                  className="size-6 shrink-0 rounded-full"
                  style={{
                    background: `linear-gradient(140deg, hsl(${e.hue} 70% 62%), hsl(${(e.hue + 50) % 360} 65% 42%))`,
                  }}
                />
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "num block truncate text-[12px]",
                      e.isYou ? "text-signal" : "text-mute-2",
                    )}
                  >
                    {e.handle}
                    {e.isYou ? " · you" : ""}
                  </span>
                  <span className="num block text-[10px] text-mute">
                    {e.trades} trades · {e.topHolding}
                  </span>
                </span>
                <span className="text-right">
                  <Delta value={e.returnPct} arrow={false} className="text-[12px]" />
                  <span className="num block text-[10px] text-mute">{signedMoney(e.pnl, 0)}</span>
                </span>
              </li>
            ))}
          </ol>
          <div className="border-t border-line px-4 py-3 sm:px-5">
            <p className="text-[11px] leading-relaxed text-mute">
              Ranked on return over the cycle, not absolute profit, so a small balance can still
              finish first.
            </p>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: "signal" | "loss" }) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd
        className={cn(
          "num mt-1.5 text-xl sm:text-2xl",
          tone === "signal" ? "text-signal" : tone === "loss" ? "text-loss" : "text-paper",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-[12px] text-mute">{label}</dt>
      <dd className={cn("num text-[13px]", strong ? "text-paper" : "text-mute-2")}>{value}</dd>
    </div>
  );
}
