"use client";

import { useMemo } from "react";
import { ListingHero } from "@/components/listing/ListingHero";
import { StatsBar } from "@/components/listing/StatsBar";
import { PriceCard } from "@/components/listing/PriceCard";
import { AboutSection } from "@/components/listing/AboutSection";
import { DeveloperCard } from "@/components/listing/DeveloperCard";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { ButtonLink, ArrowRight } from "@/components/ui/Button";
import { useApp } from "@/lib/store";
import { useHydrated } from "@/lib/hooks";
import { listingToGame, studioDeveloper } from "@/lib/listingToGame";
import { compactMoney, money, num, pct } from "@/lib/format";

export function UserListingView({ id }: { id: string }) {
  const hydrated = useHydrated();
  const listings = useApp((s) => s.listings);
  const account = useApp((s) => s.account);

  const listing = listings.find((l) => l.id === id);
  const game = useMemo(() => (listing ? listingToGame(listing) : null), [listing]);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10">
        <div className="h-72 animate-pulse rounded-xl bg-panel" />
      </div>
    );
  }

  if (!listing || !game) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="tight text-2xl font-semibold text-paper sm:text-3xl">Listing not found</h1>
        <p className="mt-4 text-sm leading-relaxed text-mute">
          Listings you publish are stored in this browser only. If you cleared site data, or opened
          this link somewhere else, the listing will not be here.
        </p>
        <ButtonLink href="/developer/submit" size="lg" className="mt-8">
          Create a listing <ArrowRight />
        </ButtonLink>
      </div>
    );
  }

  const developer = studioDeveloper(
    account?.displayName ?? "Your studio",
    account?.handle ?? "@you",
    account?.createdAt ?? listing.submittedAt,
  );

  const raise = listing.sharesOffered * listing.pricePerShare;

  return (
    <article className="-mt-14 md:-mt-16">
      <ListingHero game={game} developer={developer} status="Your listing" />
      <StatsBar game={game} />

      <div className="mx-auto grid max-w-[1400px] gap-4 px-4 py-8 sm:px-6 lg:grid-cols-[1.65fr_1fr] lg:gap-5 lg:px-10 lg:py-12">
        <div className="space-y-4">
          <PriceCard game={game} />
          <AboutSection game={game} />
        </div>

        <div className="space-y-4">
          <div className="lg:sticky lg:top-32 lg:space-y-4">
            <Panel>
              <PanelHeader
                title="Your offering"
                action={<span className="num text-[10px] uppercase tracking-[0.12em] text-signal">Open</span>}
              />
              <div className="space-y-4 px-4 py-5 sm:px-5">
                <dl className="grid grid-cols-2 gap-4">
                  <Cell label="Listed valuation" value={compactMoney(listing.valuation)} />
                  <Cell label="Price per share" value={money(listing.pricePerShare)} />
                  <Cell label="Shares outstanding" value={num(listing.sharesTotal)} />
                  <Cell
                    label="Shares offered"
                    value={num(listing.sharesOffered)}
                    note={pct((listing.sharesOffered / listing.sharesTotal) * 100, 1) + " of company"}
                  />
                </dl>

                <div className="border-t border-line-soft pt-4">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
                    <div className="h-full w-0 rounded-full bg-signal" />
                  </div>
                  <div className="num mt-2 flex justify-between text-[10px] text-mute">
                    <span>0 placed</span>
                    <span>{num(listing.sharesOffered)} remaining</span>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-line bg-panel-2 px-3.5 py-3">
                  <span className="text-[12px] text-mute">Raise at full placement</span>
                  <span className="num text-[13px] text-signal">{money(raise, 0)}</span>
                </div>

                <p className="text-[12px] leading-relaxed text-mute">
                  The order book opens to investors 24 hours after publication. Until then the
                  listing is readable but not tradeable.
                </p>
              </div>
            </Panel>

            <DeveloperCard developer={developer} />

            <ButtonLink href="/developer" variant="outline" className="w-full">
              Back to dashboard
            </ButtonLink>
          </div>
        </div>
      </div>
    </article>
  );
}

function Cell({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div>
      <dt className="eyebrow text-[9px]">{label}</dt>
      <dd className="num mt-1 text-[15px] text-paper">{value}</dd>
      {note ? <dd className="num mt-0.5 text-[11px] text-mute">{note}</dd> : null}
    </div>
  );
}
