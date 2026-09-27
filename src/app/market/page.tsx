import type { Metadata } from "next";
import { MarketBrowser } from "@/components/market/MarketBrowser";
import { marketTotals } from "@/data/games";
import { compact, compactMoney } from "@/lib/format";
import type { Platform } from "@/lib/types";

export const metadata: Metadata = {
  title: "Market",
  description: "Every listed game across Roblox, Fortnite Creative and Minecraft.",
};

const isPlatform = (v: string | undefined): v is Platform =>
  v === "roblox" || v === "fortnite" || v === "minecraft";

export default async function MarketPage({
  searchParams,
}: {
  searchParams: Promise<{ platform?: string }>;
}) {
  const { platform } = await searchParams;

  const totals = [
    { label: "Listings", value: String(marketTotals.listings) },
    { label: "Combined market cap", value: compactMoney(marketTotals.marketCap) },
    { label: "24h volume", value: compactMoney(marketTotals.volume24h) },
    { label: "Monthly players", value: compact(marketTotals.players) },
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
      <div className="flex flex-col gap-8 border-b border-line pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="eyebrow">Market</span>
          <h1 className="tight mt-3 text-3xl font-semibold text-paper sm:text-5xl">
            Every listed game.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-mute">
            Prices move on player growth, revenue and retention. Each listing publishes the figures
            the valuation rests on.
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4 lg:gap-x-10">
          {totals.map((t) => (
            <div key={t.label}>
              <dt className="eyebrow">{t.label}</dt>
              <dd className="num mt-1.5 text-lg text-paper">{t.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-8">
        <MarketBrowser initialPlatform={isPlatform(platform) ? platform : undefined} />
      </div>
    </div>
  );
}
