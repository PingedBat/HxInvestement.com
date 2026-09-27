"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { Button, ButtonLink, ArrowRight } from "@/components/ui/Button";
import { Delta } from "@/components/ui/Delta";
import { useApp } from "@/lib/store";
import { useHydrated, useLivePrice } from "@/lib/hooks";
import { compactMoney, money, num, pct, signedMoney } from "@/lib/format";
import type { Game, InvestingMode } from "@/lib/types";
import { cn } from "@/lib/cn";

export function OfferingPanel({ game }: { game: Game }) {
  const hydrated = useHydrated();
  const account = useApp((s) => s.account);
  const cash = useApp((s) => s.cash);
  const rushCash = useApp((s) => s.rushCash);
  const holdings = useApp((s) => s.holdings);
  const rushPositions = useApp((s) => s.rushPositions);
  const buy = useApp((s) => s.buy);
  const sell = useApp((s) => s.sell);

  const [mode, setMode] = useState<InvestingMode>("vault");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [qty, setQty] = useState(25);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const live = useLivePrice(game.price, hydrated);
  const soldPct = (game.sharesSold / game.sharesOffered) * 100;
  const remaining = game.sharesOffered - game.sharesSold;

  const holding = holdings.find((h) => h.gameId === game.id);
  const rushPos = rushPositions.find((p) => p.gameId === game.id);
  const position = mode === "vault" ? holding : rushPos;
  const positionShares = position?.shares ?? 0;
  const positionCost = mode === "vault" ? holding?.costBasis ?? 0 : rushPos?.entryPrice ?? 0;

  const power = mode === "vault" ? cash : rushCash;
  const total = qty * live;
  const maxAffordable = Math.floor(power / live);

  const canRush = game.rushEligible;
  const isInvestor = hydrated && account?.type === "investor";

  const pnl = useMemo(
    () => (positionShares ? positionShares * (game.price - positionCost) : 0),
    [positionShares, positionCost, game.price],
  );

  function submit() {
    setError(null);
    if (qty <= 0) return setError("Enter a share quantity.");

    if (side === "buy") {
      if (total > power) return setError(`Insufficient ${mode === "vault" ? "cash" : "Rush"} balance.`);
      if (qty > remaining) return setError(`Only ${num(remaining)} shares remain in this offering.`);
      const ok = buy(mode, game.id, qty, live);
      if (!ok) return setError("Order rejected.");
      setReceipt(`Bought ${num(qty)} ${game.ticker} at ${money(live)}`);
    } else {
      if (qty > positionShares) return setError(`You hold ${num(positionShares)} shares.`);
      const ok = sell(mode, game.id, qty, live);
      if (!ok) return setError("Order rejected.");
      setReceipt(`Sold ${num(qty)} ${game.ticker} at ${money(live)}`);
    }
    window.setTimeout(() => setReceipt(null), 4200);
  }

  return (
    <Panel className="overflow-hidden">
      <PanelHeader
        title="Share offering"
        action={
          <span className="num text-[10px] uppercase tracking-[0.12em] text-mute">
            {pct(soldPct, 0)} placed
          </span>
        }
      />

      <div className="space-y-4 px-4 py-5 sm:px-5">
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="eyebrow text-[9px]">Listed valuation</dt>
            <dd className="num mt-1 text-[15px] text-paper">{compactMoney(game.valuation)}</dd>
          </div>
          <div>
            <dt className="eyebrow text-[9px]">Price at listing</dt>
            <dd className="num mt-1 text-[15px] text-paper">{money(game.ipoPrice)}</dd>
          </div>
          <div>
            <dt className="eyebrow text-[9px]">Shares offered</dt>
            <dd className="num mt-1 text-[15px] text-paper">{num(game.sharesOffered)}</dd>
            <dd className="num mt-0.5 text-[11px] text-mute">
              {pct((game.sharesOffered / game.sharesTotal) * 100, 1)} of company
            </dd>
          </div>
          <div>
            <dt className="eyebrow text-[9px]">Since listing</dt>
            <dd className="mt-1 text-[15px]">
              <Delta value={((game.price - game.ipoPrice) / game.ipoPrice) * 100} arrow={false} />
            </dd>
          </div>
        </dl>

        <div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-signal transition-[width] duration-700"
              style={{ width: `${Math.min(100, soldPct)}%` }}
            />
          </div>
          <div className="num mt-2 flex justify-between text-[10px] text-mute">
            <span>{num(game.sharesSold)} placed</span>
            <span>{num(remaining)} remaining</span>
          </div>
        </div>
      </div>

      <div className="border-t border-line bg-panel-2/40 px-4 py-5 sm:px-5">
        {!hydrated ? (
          <div className="h-44 animate-pulse rounded-lg bg-panel-2" />
        ) : !account ? (
          <div className="text-center">
            <p className="text-[13px] leading-relaxed text-mute">
              Open an investor account to take a position in {game.ticker}. The demo balance is
              funded for you.
            </p>
            <ButtonLink href="/signup?type=investor" className="mt-4 w-full">
              Open an investor account <ArrowRight />
            </ButtonLink>
          </div>
        ) : account.type === "developer" ? (
          <div className="text-center">
            <p className="text-[13px] leading-relaxed text-mute">
              You are signed in as a developer account. Developers cannot hold shares in listings.
            </p>
            <ButtonLink href="/developer" variant="outline" className="mt-4 w-full">
              Go to studio dashboard
            </ButtonLink>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3">
              <div className="flex rounded-lg border border-line bg-panel p-0.5">
                {(["vault", "rush"] as const).map((m) => {
                  const disabled = m === "rush" && !canRush;
                  return (
                    <button
                      key={m}
                      disabled={disabled}
                      onClick={() => setMode(m)}
                      title={disabled ? "This listing is not Rush eligible" : undefined}
                      className={cn(
                        "num rounded-md px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] transition-colors",
                        mode === m ? "bg-[#1c2230] text-paper" : "text-mute hover:text-paper",
                        disabled && "cursor-not-allowed opacity-35 hover:text-mute",
                      )}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>

              <div className="flex rounded-lg border border-line bg-panel p-0.5">
                {(["buy", "sell"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSide(s)}
                    className={cn(
                      "num rounded-md px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] transition-colors",
                      side === s
                        ? s === "buy"
                          ? "bg-signal/15 text-signal"
                          : "bg-loss/15 text-loss"
                        : "text-mute hover:text-paper",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {positionShares > 0 ? (
              <div className="mt-4 flex items-center justify-between rounded-lg border border-line bg-panel px-3.5 py-2.5">
                <div>
                  <div className="eyebrow text-[9px]">Your {mode} position</div>
                  <div className="num mt-1 text-[13px] text-paper">
                    {num(positionShares)} sh @ {money(positionCost)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="eyebrow text-[9px]">Unrealised</div>
                  <div className={cn("num mt-1 text-[13px]", pnl >= 0 ? "text-signal" : "text-loss")}>
                    {signedMoney(pnl)}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-4">
              <div className="mb-2 flex items-baseline justify-between">
                <span className="eyebrow">Shares</span>
                <span className="num text-[10px] text-mute">
                  {side === "buy" ? `Max ${num(Math.min(maxAffordable, remaining))}` : `Holding ${num(positionShares)}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 5))}
                  className="grid size-10 shrink-0 place-items-center rounded-lg border border-line bg-panel text-mute-2 transition-colors hover:text-paper"
                  aria-label="Decrease by five"
                >
                  −
                </button>
                <input
                  type="number"
                  value={qty}
                  min={1}
                  onChange={(e) => setQty(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
                  className="num h-10 w-full rounded-lg border border-line bg-panel px-3 text-center text-[15px] text-paper outline-none focus:border-signal/60"
                />
                <button
                  onClick={() => setQty((q) => q + 5)}
                  className="grid size-10 shrink-0 place-items-center rounded-lg border border-line bg-panel text-mute-2 transition-colors hover:text-paper"
                  aria-label="Increase by five"
                >
                  +
                </button>
              </div>

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
                  onClick={() =>
                    setQty(side === "buy" ? Math.min(maxAffordable, remaining) : positionShares)
                  }
                  className="num flex-1 rounded-md border border-line bg-panel py-1.5 text-[11px] text-mute transition-colors hover:text-paper"
                >
                  Max
                </button>
              </div>
            </div>

            <dl className="mt-4 space-y-2 border-t border-line-soft pt-4">
              <Row label="Live quote" value={money(live)} live />
              <Row label={side === "buy" ? "Estimated cost" : "Estimated proceeds"} value={money(total)} strong />
              <Row label="Commission" value={money(0)} />
              <Row
                label={mode === "vault" ? "Cash balance" : "Rush balance"}
                value={money(power)}
              />
            </dl>

            <Button
              onClick={submit}
              variant={side === "buy" ? "primary" : "danger"}
              size="lg"
              className="mt-4 w-full"
              disabled={qty <= 0}
            >
              {side === "buy" ? "Buy" : "Sell"} {num(qty)} {game.ticker}
            </Button>

            {mode === "rush" ? (
              <p className="num mt-3 text-center text-[10px] uppercase tracking-[0.12em] text-mute">
                Rush shares settle at cycle close
              </p>
            ) : null}

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
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-signal/30 bg-signal/10 px-3 py-2"
                >
                  <span className="num text-[12px] text-signal">{receipt}</span>
                  <Link href="/invest" className="num shrink-0 text-[11px] text-signal underline">
                    Portfolio
                  </Link>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </>
        )}
      </div>
    </Panel>
  );
}

function Row({
  label,
  value,
  strong,
  live,
}: {
  label: string;
  value: string;
  strong?: boolean;
  live?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="flex items-center gap-1.5 text-[12px] text-mute">
        {live ? <span className="size-1 animate-pulse rounded-full bg-signal" /> : null}
        {label}
      </dt>
      <dd className={cn("num text-[13px]", strong ? "text-paper" : "text-mute-2")}>{value}</dd>
    </div>
  );
}
