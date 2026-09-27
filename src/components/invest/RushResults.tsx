"use client";

import { motion } from "framer-motion";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { ButtonLink, ArrowRight } from "@/components/ui/Button";
import { Delta, Badge } from "@/components/ui/Delta";
import { CountUp } from "@/components/ui/CountUp";
import { AccountGate } from "@/components/invest/AccountGate";
import { useApp } from "@/lib/store";
import { useHydrated } from "@/lib/hooks";
import { lastCycleResults, leaderboard } from "@/data/rush";
import { compactMoney, money, num, signedMoney, signedPct } from "@/lib/format";
import { cn } from "@/lib/cn";

export function RushResults() {
  const hydrated = useHydrated();
  const account = useApp((s) => s.account);
  const r = lastCycleResults;

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

  return (
    <div className="relative">
      <div aria-hidden className="grid-field pointer-events-none absolute inset-0 opacity-25" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[40vh]"
        style={{ background: "radial-gradient(46% 60% at 50% 0%, rgba(255,159,74,0.13) 0%, transparent 72%)" }}
      />

      <div className="relative mx-auto max-w-[1400px] px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-2.5">
            <Badge tone="outline">{r.label} · closed</Badge>
            <span className="num text-[10px] uppercase tracking-[0.14em] text-mute">
              Settled Sunday 23:59 UTC
            </span>
          </div>

          <h1 className="tight mt-5 max-w-3xl text-3xl font-semibold leading-[1.02] text-paper sm:text-5xl">
            You finished {signedPct(r.yourReturn)} for the week, ranked{" "}
            <span className="text-signal">{num(r.yourRank)}</span> of {num(r.participants)}.
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-mute">
            All open positions settled at the closing price. Your Rush balance carries into the new
            cycle; the leaderboard resets.
          </p>
        </motion.div>

        <dl className="mt-10 grid grid-cols-2 gap-6 border-y border-line py-7 sm:grid-cols-4">
          <div>
            <dt className="eyebrow">Your return</dt>
            <dd className="mt-1.5 text-2xl text-signal sm:text-3xl">
              <CountUp value={r.yourReturn} format={(n) => signedPct(n)} />
            </dd>
          </div>
          <div>
            <dt className="eyebrow">Realised P/L</dt>
            <dd className="mt-1.5 text-2xl text-paper sm:text-3xl">
              <CountUp value={r.yourPnl} format={(n) => signedMoney(n)} />
            </dd>
          </div>
          <div>
            <dt className="eyebrow">Trades placed</dt>
            <dd className="num mt-1.5 text-2xl text-paper sm:text-3xl">{r.yourTrades}</dd>
          </div>
          <div>
            <dt className="eyebrow">Final rank</dt>
            <dd className="num mt-1.5 text-2xl text-paper sm:text-3xl">
              {num(r.yourRank)}
              <span className="text-base text-mute"> / {num(r.participants)}</span>
            </dd>
          </div>
        </dl>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-4">
            <Panel>
              <PanelHeader title="Your cycle" />
              <div className="divide-y divide-line-soft">
                <TradeRow
                  label="Best trade"
                  ticker={r.bestTrade.ticker}
                  gain={r.bestTrade.gain}
                  pct={r.bestTrade.pct}
                />
                <TradeRow
                  label="Worst trade"
                  ticker={r.worstTrade.ticker}
                  gain={r.worstTrade.gain}
                  pct={r.worstTrade.pct}
                />
              </div>
              <div className="border-t border-line px-4 py-3.5 sm:px-5">
                <p className="text-[12px] leading-relaxed text-mute">
                  You beat the median participant by{" "}
                  <span className="num text-paper">
                    {(r.yourReturn - r.medianReturn).toFixed(1)} points
                  </span>
                  . The top result for the week was {signedPct(r.topReturn)}.
                </p>
              </div>
            </Panel>

            <Panel>
              <PanelHeader title="Cycle totals" />
              <dl className="grid grid-cols-2 gap-px bg-line-soft">
                <Cell label="Participants" value={num(r.participants)} />
                <Cell label="Median return" value={signedPct(r.medianReturn)} />
                <Cell label="Top return" value={signedPct(r.topReturn)} accent />
                <Cell label="Cycle volume" value={compactMoney(r.totalVolume)} />
              </dl>
            </Panel>

            <Panel className="px-4 py-5 sm:px-5">
              <h4 className="eyebrow">Next cycle</h4>
              <p className="mt-3 text-[13px] leading-relaxed text-mute">
                A new seven-day cycle is already open. Your Rush balance carried over; positions did
                not.
              </p>
              <ButtonLink href="/invest/rush" className="mt-5 w-full">
                Enter the current cycle <ArrowRight />
              </ButtonLink>
            </Panel>
          </div>

          <Panel className="h-fit">
            <PanelHeader title={`${r.label} final standings`} action={<span className="num text-[10px] text-mute">Top 12</span>} />
            <ol className="divide-y divide-line-soft">
              {leaderboard.map((e) => (
                <li key={e.handle} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                  <span
                    className={cn(
                      "num w-7 shrink-0 text-[12px]",
                      e.rank <= 3 ? "text-signal" : "text-mute",
                    )}
                  >
                    {String(e.rank).padStart(2, "0")}
                  </span>
                  <span
                    className="size-7 shrink-0 rounded-full"
                    style={{
                      background: `linear-gradient(140deg, hsl(${e.hue} 70% 62%), hsl(${(e.hue + 50) % 360} 65% 42%))`,
                    }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="num block truncate text-[12px] text-mute-2">{e.handle}</span>
                    <span className="num block text-[10px] text-mute">
                      {e.trades} trades · top holding {e.topHolding}
                    </span>
                  </span>
                  <span className="text-right">
                    <Delta value={e.returnPct} arrow={false} className="text-[12px]" />
                    <span className="num block text-[10px] text-mute">{money(e.pnl, 0)}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function TradeRow({
  label,
  ticker,
  gain,
  pct,
}: {
  label: string;
  ticker: string;
  gain: number;
  pct: number;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5">
      <div>
        <div className="eyebrow text-[9px]">{label}</div>
        <div className="num mt-1.5 text-[15px] text-paper">{ticker}</div>
      </div>
      <div className="text-right">
        <div className={cn("num text-[15px]", gain >= 0 ? "text-signal" : "text-loss")}>
          {signedMoney(gain)}
        </div>
        <Delta value={pct} arrow={false} className="text-[11px]" />
      </div>
    </div>
  );
}

function Cell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-panel px-4 py-4">
      <div className="eyebrow text-[9px]">{label}</div>
      <div className={cn("num mt-1.5 text-[15px]", accent ? "text-signal" : "text-paper")}>{value}</div>
    </div>
  );
}
