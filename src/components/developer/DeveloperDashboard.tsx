"use client";

import Link from "next/link";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { ButtonLink, ArrowRight } from "@/components/ui/Button";
import { GameArt } from "@/components/ui/GameArt";
import { PlatformTag } from "@/components/ui/PlatformIcon";
import { Badge, Delta } from "@/components/ui/Delta";
import { Sparkline } from "@/components/ui/Sparkline";
import { platformList } from "@/lib/platforms";
import { games } from "@/data/games";
import { useApp } from "@/lib/store";
import { useHydrated } from "@/lib/hooks";
import { compact, compactMoney, money, num, pct, shortDate } from "@/lib/format";

export function DeveloperDashboard() {
  const hydrated = useHydrated();
  const account = useApp((s) => s.account);
  const listings = useApp((s) => s.listings);

  if (!hydrated) {
    return <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10"><div className="h-64 animate-pulse rounded-xl bg-panel" /></div>;
  }

  if (!account || account.type !== "developer") {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="tight text-2xl font-semibold text-paper sm:text-3xl">
          {account ? "This is the developer dashboard" : "Open a developer account"}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-mute">
          {account
            ? "You are signed in as an investor. The studio dashboard is only available on a developer account."
            : "The studio dashboard shows your listings, the offering status and how the shares are trading."}
        </p>
        <ButtonLink href={account ? "/invest" : "/signup?type=developer"} size="lg" className="mt-8">
          {account ? "Go to your portfolio" : "Open a developer account"} <ArrowRight />
        </ButtonLink>
      </div>
    );
  }

  const totalValuation = listings.reduce((s, l) => s + l.valuation, 0);
  const totalRaise = listings.reduce((s, l) => s + l.sharesOffered * l.pricePerShare, 0);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
      <div className="flex flex-col gap-6 border-b border-line pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-4">
          <span
            className="grid size-12 shrink-0 place-items-center rounded-xl text-lg font-semibold text-void"
            style={{ background: "linear-gradient(140deg, #b79bff, #7b4dff)" }}
          >
            {account.displayName.slice(0, 1).toUpperCase()}
          </span>
          <div>
            <span className="eyebrow">Studio dashboard</span>
            <h1 className="tight mt-1.5 text-2xl font-semibold text-paper sm:text-4xl">
              {account.displayName}
            </h1>
            <p className="num mt-1.5 text-[11px] uppercase tracking-[0.14em] text-mute">
              {account.handle} · Unverified studio
            </p>
          </div>
        </div>

        <ButtonLink href="/developer/submit">
          List a game <ArrowRight />
        </ButtonLink>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
        <Metric label="Listings" value={String(listings.length)} />
        <Metric label="Combined valuation" value={compactMoney(totalValuation)} />
        <Metric label="Offered at full placement" value={compactMoney(totalRaise)} />
        <Metric label="Studio status" value={listings.length ? "Active" : "No listings"} />
      </dl>

      <div className="mt-10 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <Panel>
            <PanelHeader
              title="Your listings"
              action={<span className="num text-[10px] text-mute">{listings.length} total</span>}
            />

            {listings.length === 0 ? (
              <div className="px-4 py-12 text-center sm:px-8">
                <p className="mx-auto max-w-sm text-sm leading-relaxed text-mute">
                  You have not listed a game yet. The submission takes four steps: platform, game
                  details, valuation, and a review of the figures before anything is published.
                </p>
                <ButtonLink href="/developer/submit" className="mt-6">
                  Start a listing <ArrowRight />
                </ButtonLink>
              </div>
            ) : (
              <ul className="divide-y divide-line-soft">
                {listings.map((l) => (
                  <li key={l.id}>
                    <Link
                      href={`/listing/${l.id}`}
                      className="group flex flex-wrap items-center gap-4 px-4 py-4 transition-colors hover:bg-panel-2/60 sm:px-5"
                    >
                      <span className="h-12 w-16 shrink-0 overflow-hidden rounded-md">
                        <GameArt seed={l.id} colors={l.art} detail={5} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-[14px] text-paper group-hover:text-signal">{l.title}</span>
                          <Badge tone="signal">Live</Badge>
                        </span>
                        <span className="num mt-1 block text-[11px] text-mute">
                          {l.genre} · Published {shortDate(l.submittedAt)}
                        </span>
                      </span>

                      <PlatformTag platform={l.platform} />

                      <span className="text-right">
                        <span className="eyebrow block text-[9px]">Share price</span>
                        <span className="num mt-1 block text-[13px] text-paper">
                          {money(l.pricePerShare)}
                        </span>
                      </span>

                      <span className="text-right">
                        <span className="eyebrow block text-[9px]">Offered</span>
                        <span className="num mt-1 block text-[13px] text-mute-2">
                          {num(l.sharesOffered)}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel>
            <PanelHeader title="What listing gives you" />
            <ul className="divide-y divide-line-soft">
              {[
                ["A public filing page", "Price history, stats bar, offering panel and studio profile on one page."],
                ["A share register", "Every placed order is tracked against the shares you offered."],
                ["Rush eligibility review", "Listings with sustained volume become tradeable inside the weekly cycle."],
                ["Shareholder reporting", "Retention, revenue and concurrents published alongside the price."],
              ].map(([title, body]) => (
                <li key={title} className="flex gap-3.5 px-4 py-3.5 sm:px-5">
                  <span className="mt-[7px] size-1 shrink-0 rounded-full bg-signal" />
                  <div>
                    <p className="text-[13px] text-paper">{title}</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-mute">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel>
            <PanelHeader title="Platform context" />
            <ul className="divide-y divide-line-soft">
              {platformList.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-5">
                  <div className="flex items-center gap-2.5">
                    <PlatformTag platform={p.id} withLabel={false} />
                    <span className="text-[13px] text-paper">{p.label}</span>
                  </div>
                  <div className="text-right">
                    <div className="num text-[13px] text-mute-2">{compactMoney(p.avgValuation)}</div>
                    <div className="num text-[10px] text-mute">{p.listedGames} listed</div>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel>
            <PanelHeader title="Comparable listings" action={<Link href="/market" className="num text-[10px] uppercase tracking-[0.12em] text-mute hover:text-signal">Market</Link>} />
            <ul className="divide-y divide-line-soft">
              {[...games]
                .sort((a, b) => b.change30d - a.change30d)
                .slice(0, 5)
                .map((g) => (
                  <li key={g.id}>
                    <Link
                      href={`/game/${g.slug}`}
                      className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-panel-2/60 sm:px-5"
                    >
                      <span
                        className="size-7 shrink-0 rounded"
                        style={{ background: `linear-gradient(135deg, ${g.art[0]}, ${g.art[1]})` }}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] text-paper group-hover:text-signal">
                          {g.title}
                        </span>
                        <span className="num block text-[10px] text-mute">
                          {compactMoney(g.valuation)} at listing · {compact(g.stats.mau)} players
                        </span>
                      </span>
                      <Sparkline series={g.history.slice(-30)} className="h-6 w-12" />
                      <Delta value={g.change30d} arrow={false} className="shrink-0 text-[11px]" />
                    </Link>
                  </li>
                ))}
            </ul>
          </Panel>

          <Panel className="px-4 py-4 sm:px-5">
            <h4 className="eyebrow">How valuations are reviewed</h4>
            <p className="mt-3 text-[12px] leading-relaxed text-mute">
              In a live product a listing would be checked against platform-reported engagement and
              payout history before the offering opened. Here, publishing is immediate and the
              figures are whatever you enter — the review step exists so the flow is honest about
              what would happen.
            </p>
            <p className="num mt-4 text-[10px] uppercase tracking-[0.14em] text-mute">
              Median review time, live product: 6 business days
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd className="num mt-1.5 text-xl text-paper sm:text-2xl">{value}</dd>
    </div>
  );
}
