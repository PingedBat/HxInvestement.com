"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { PriceChart } from "@/components/ui/PriceChart";
import { Sparkline } from "@/components/ui/Sparkline";
import { Delta } from "@/components/ui/Delta";
import { ButtonLink, ArrowRight } from "@/components/ui/Button";
import { ModeSwitch } from "@/components/invest/ModeSwitch";
import { PlatformTag } from "@/components/ui/PlatformIcon";
import { AccountGate } from "@/components/invest/AccountGate";
import { useApp } from "@/lib/store";
import { useHydrated } from "@/lib/hooks";
import { buildHoldingRows, portfolioSeries, summarise } from "@/lib/portfolio";
import { getGame } from "@/data/games";
import { compactMoney, money, num, pct, shortDate, signedMoney } from "@/lib/format";
import { platformMeta } from "@/lib/platforms";
import type { Platform } from "@/lib/types";
import { cn } from "@/lib/cn";

const ranges = [
  { id: 30, label: "30D" },
  { id: 90, label: "90D" },
  { id: 180, label: "180D" },
];

export function VaultDashboard() {
  const hydrated = useHydrated();
  const account = useApp((s) => s.account);
  const cash = useApp((s) => s.cash);
  const holdings = useApp((s) => s.holdings);
  const transactions = useApp((s) => s.transactions);
  const sell = useApp((s) => s.sell);
  const [days, setDays] = useState(90);

  const rows = useMemo(() => buildHoldingRows(holdings), [holdings]);
  const totals = useMemo(() => summarise(rows), [rows]);
  const series = useMemo(() => portfolioSeries(holdings, days, cash), [holdings, days, cash]);

  const dayChange = useMemo(
    () => rows.reduce((s, r) => s + r.value * (r.change24h / 100), 0),
    [rows],
  );

  const byPlatform = useMemo(() => {
    const map = new Map<Platform, number>();
    for (const r of rows) {
      map.set(r.platform as Platform, (map.get(r.platform as Platform) ?? 0) + r.value);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [rows]);

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

  const netWorth = totals.value + cash;
  const vaultTx = transactions.filter((t) => t.mode === "vault").slice(0, 8);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
      <div className="flex flex-col gap-6 border-b border-line pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="eyebrow">Portfolio · {account.handle}</span>
          <h1 className="tight mt-3 text-3xl font-semibold text-paper sm:text-5xl">
            {money(netWorth)}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className={cn("num text-[13px]", dayChange >= 0 ? "text-signal" : "text-loss")}>
              {signedMoney(dayChange)}
            </span>
            <span className="num text-[11px] uppercase tracking-[0.14em] text-mute">today</span>
            <span className="h-3 w-px bg-line" />
            <Delta value={totals.pnlPct} className="text-[13px]" />
            <span className="num text-[11px] uppercase tracking-[0.14em] text-mute">all time</span>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <ModeSwitch active="vault" />
          <Link
            href="/learn/vault"
            className="num text-[11px] uppercase tracking-[0.14em] text-mute transition-colors hover:text-signal"
          >
            How Vault works
          </Link>
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
        <Metric label="Holdings value" value={money(totals.value)} />
        <Metric label="Cost basis" value={money(totals.cost)} />
        <Metric
          label="Unrealised gain"
          value={signedMoney(totals.pnl)}
          tone={totals.pnl >= 0 ? "signal" : "loss"}
        />
        <Metric label="Cash available" value={money(cash)} />
      </dl>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <Panel>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5">
              <h3 className="eyebrow">Portfolio value</h3>
              <div className="flex rounded-lg border border-line bg-panel-2 p-0.5">
                {ranges.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setDays(r.id)}
                    className={cn(
                      "num rounded-md px-2.5 py-1 text-[11px] uppercase tracking-wider transition-colors",
                      days === r.id ? "bg-[#1c2230] text-paper" : "text-mute hover:text-paper",
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="px-4 pb-4 pt-5 sm:px-5">
              {series.length ? (
                <PriceChart key={days} series={series} height={250} label="Portfolio value over time" />
              ) : (
                <p className="py-16 text-center text-sm text-mute">
                  Buy your first position to start a value history.
                </p>
              )}
            </div>
          </Panel>

          <Panel>
            <PanelHeader
              title="Holdings"
              action={<span className="num text-[10px] text-mute">{rows.length} positions</span>}
            />

            {rows.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <p className="text-sm text-mute">You hold no positions.</p>
                <ButtonLink href="/market" className="mt-5">
                  Browse the market <ArrowRight />
                </ButtonLink>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-separate border-spacing-0">
                  <thead>
                    <tr>
                      {["Position", "Shares", "Avg cost", "Price", "Value", "Unrealised", "Weight", ""].map((h) => (
                        <th key={h} className="eyebrow border-b border-line px-3 py-2.5 text-left font-normal">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => {
                      const game = getGame(r.gameId)!;
                      return (
                        <tr key={r.gameId} className="group">
                          <td className="border-b border-line-soft px-3 py-3">
                            <Link href={`/game/${r.gameId}`} className="flex items-center gap-3">
                              <span
                                className="size-8 shrink-0 rounded-md"
                                style={{ background: `linear-gradient(135deg, ${r.art[0]}, ${r.art[1]})` }}
                              />
                              <span className="min-w-0">
                                <span className="block truncate text-[13px] text-paper group-hover:text-signal">
                                  {r.title}
                                </span>
                                <span className="num block text-[10px] uppercase tracking-[0.12em] text-mute">
                                  {r.ticker} · opened {shortDate(r.openedAt)}
                                </span>
                              </span>
                            </Link>
                          </td>
                          <td className="num border-b border-line-soft px-3 py-3 text-[13px] text-mute-2">
                            {num(r.shares)}
                          </td>
                          <td className="num border-b border-line-soft px-3 py-3 text-[13px] text-mute-2">
                            {money(r.costBasis)}
                          </td>
                          <td className="num border-b border-line-soft px-3 py-3 text-[13px] text-paper">
                            {money(r.price)}
                            <Sparkline series={game.history.slice(-20)} className="mt-1 h-4 w-14" />
                          </td>
                          <td className="num border-b border-line-soft px-3 py-3 text-[13px] text-paper">
                            {money(r.value)}
                          </td>
                          <td className="border-b border-line-soft px-3 py-3">
                            <div className={cn("num text-[13px]", r.pnl >= 0 ? "text-signal" : "text-loss")}>
                              {signedMoney(r.pnl)}
                            </div>
                            <Delta value={r.pnlPct} arrow={false} className="text-[10px]" />
                          </td>
                          <td className="border-b border-line-soft px-3 py-3">
                            <div className="num text-[12px] text-mute-2">{pct(r.weight, 1)}</div>
                            <div className="mt-1 h-1 w-14 overflow-hidden rounded-full bg-line">
                              <div className="h-full rounded-full bg-mute" style={{ width: `${r.weight}%` }} />
                            </div>
                          </td>
                          <td className="border-b border-line-soft px-3 py-3 text-right">
                            <button
                              onClick={() => sell("vault", r.gameId, r.shares, r.price)}
                              className="num rounded-md border border-line px-2.5 py-1.5 text-[11px] uppercase tracking-[0.12em] text-mute transition-colors hover:border-loss/40 hover:text-loss"
                            >
                              Sell all
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel>
            <PanelHeader title="Allocation" />
            <div className="px-4 py-5 sm:px-5">
              {byPlatform.length ? (
                <>
                  <div className="flex h-2 overflow-hidden rounded-full bg-line">
                    {byPlatform.map(([p, v]) => (
                      <div
                        key={p}
                        style={{
                          width: `${(v / totals.value) * 100}%`,
                          background: platformMeta(p).tint,
                        }}
                      />
                    ))}
                  </div>
                  <ul className="mt-4 space-y-2.5">
                    {byPlatform.map(([p, v]) => (
                      <li key={p} className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2.5">
                          <span className="size-1.5 rounded-full" style={{ background: platformMeta(p).tint }} />
                          <span className="text-[13px] text-mute-2">{platformMeta(p).label}</span>
                        </span>
                        <span className="num text-[12px] text-paper">
                          {pct((v / totals.value) * 100, 1)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-sm text-mute">No allocation yet.</p>
              )}
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Recent activity" />
            {vaultTx.length ? (
              <ul className="divide-y divide-line-soft">
                {vaultTx.map((t) => {
                  const g = getGame(t.gameId);
                  return (
                    <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "num text-[10px] uppercase tracking-[0.14em]",
                              t.side === "buy" ? "text-signal" : "text-loss",
                            )}
                          >
                            {t.side}
                          </span>
                          <span className="truncate text-[13px] text-paper">{g?.title ?? t.gameId}</span>
                        </div>
                        <div className="num mt-0.5 text-[10px] text-mute">
                          {num(t.shares)} sh @ {money(t.price)} · {shortDate(t.ts)}
                        </div>
                      </div>
                      <span className="num shrink-0 text-[12px] text-mute-2">{money(t.total)}</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="px-4 py-8 text-center text-sm text-mute">No Vault activity yet.</p>
            )}
          </Panel>

          <Panel className="px-4 py-4 sm:px-5">
            <h4 className="eyebrow">Vault rules</h4>
            <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-mute">
              <li>Positions have no expiry. You choose the exit.</li>
              <li>Cost basis is averaged across every buy in the same listing.</li>
              <li>Gains are unrealised until you sell, then they settle to cash.</li>
            </ul>
            <Link
              href="/learn/vault"
              className="mt-4 inline-flex items-center gap-2 text-[13px] text-paper transition-colors hover:text-signal"
            >
              See the walkthrough <ArrowRight />
            </Link>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "signal" | "loss";
}) {
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
