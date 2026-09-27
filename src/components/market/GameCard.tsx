import Link from "next/link";
import { GameArt } from "@/components/ui/GameArt";
import { PlatformTag } from "@/components/ui/PlatformIcon";
import { Sparkline } from "@/components/ui/Sparkline";
import { Delta } from "@/components/ui/Delta";
import { compactMoney, money } from "@/lib/format";
import type { Game } from "@/lib/types";
import { cn } from "@/lib/cn";

export function GameCard({ game, className }: { game: Game; className?: string }) {
  const last30 = game.history.slice(-30);

  return (
    <Link
      href={`/game/${game.slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-line bg-panel transition-all duration-300 hover:border-[#2c3446] hover:shadow-[0_18px_50px_-24px_rgba(0,0,0,0.9)]",
        className,
      )}
    >
      <div className="relative h-36 overflow-hidden sm:h-40">
        <div className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]">
          <GameArt seed={game.slug} colors={game.art} />
        </div>
        <div className="absolute left-3 top-3">
          <PlatformTag platform={game.platform} />
        </div>
        <div className="absolute bottom-3 right-3">
          <span className="num rounded border border-white/15 bg-black/45 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em] text-white/90 backdrop-blur">
            {game.ticker}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="display text-[15px] font-medium leading-snug tracking-[-0.02em] text-paper">
          {game.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-mute">{game.tagline}</p>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <div className="num text-lg text-paper">{money(game.price)}</div>
            <Delta value={game.change7d} className="text-[11px]" />
          </div>
          <Sparkline series={last30} className="h-8 w-24" />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line-soft pt-3">
          <div>
            <div className="eyebrow text-[9px]">Market cap</div>
            <div className="num mt-0.5 text-[12px] text-mute-2">
              {compactMoney(game.price * game.sharesTotal)}
            </div>
          </div>
          <div>
            <div className="eyebrow text-[9px]">Genre</div>
            <div className="mt-0.5 truncate text-[12px] text-mute-2">{game.genre}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
