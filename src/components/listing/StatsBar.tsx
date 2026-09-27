import { Delta } from "@/components/ui/Delta";
import { compact, compactMoney, money, num } from "@/lib/format";
import type { Game } from "@/lib/types";

export function StatsBar({ game }: { game: Game }) {
  const cells: { label: string; value: React.ReactNode }[] = [
    { label: "Price", value: <span className="text-paper">{money(game.price)}</span> },
    { label: "24h", value: <Delta value={game.change24h} arrow={false} /> },
    { label: "7d", value: <Delta value={game.change7d} arrow={false} /> },
    { label: "30d", value: <Delta value={game.change30d} arrow={false} /> },
    { label: "Market cap", value: compactMoney(game.price * game.sharesTotal) },
    { label: "Listed valuation", value: compactMoney(game.valuation) },
    { label: "24h volume", value: `${compact(game.volume24h)} sh` },
    { label: "Shares outstanding", value: num(game.sharesTotal) },
    { label: "Monthly players", value: compact(game.stats.mau) },
  ];

  return (
    <div className="sticky top-14 z-30 border-y border-line bg-void/90 backdrop-blur-xl md:top-16">
      <div className="no-scrollbar mx-auto flex max-w-[1400px] gap-8 overflow-x-auto px-4 py-3.5 sm:px-6 lg:px-10">
        {cells.map((c) => (
          <div key={c.label} className="shrink-0">
            <div className="eyebrow text-[9px]">{c.label}</div>
            <div className="num mt-1 text-[13px] text-mute-2">{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
