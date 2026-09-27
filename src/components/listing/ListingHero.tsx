import Link from "next/link";
import { GameArt } from "@/components/ui/GameArt";
import { PlatformTag } from "@/components/ui/PlatformIcon";
import { Delta, Badge } from "@/components/ui/Delta";
import { money, monthYear } from "@/lib/format";
import type { Developer, Game } from "@/lib/types";

export function ListingHero({
  game,
  developer,
  status,
}: {
  game: Game;
  developer: Developer;
  status?: string;
}) {
  return (
    <header className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <GameArt seed={game.slug} colors={game.art} detail={10} />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(to top, #050608 4%, rgba(5,6,8,0.86) 42%, rgba(5,6,8,0.55) 100%)",
        }}
      />

      <div className="mx-auto max-w-[1400px] px-4 pb-10 pt-8 sm:px-6 sm:pb-14 sm:pt-12 lg:px-10 lg:pb-16 lg:pt-16">
        <nav className="num flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-mute">
          <Link href="/market" className="transition-colors hover:text-paper">
            Market
          </Link>
          <span>/</span>
          <span className="text-mute-2">{game.ticker}</span>
        </nav>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <PlatformTag platform={game.platform} />
          <Badge tone="outline">{game.genre}</Badge>
          {developer.verified ? <Badge tone="signal">Verified studio</Badge> : null}
          {game.rushEligible ? <Badge tone="outline">Rush eligible</Badge> : null}
          {status ? <Badge tone="signal">{status}</Badge> : null}
        </div>

        <div className="mt-5 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="tight text-4xl font-semibold leading-[0.98] text-paper sm:text-6xl lg:text-[4.25rem]">
              {game.title}
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-mute-2">{game.tagline}</p>
            <p className="num mt-5 text-[11px] uppercase tracking-[0.14em] text-mute">
              {developer.name} · Listed {monthYear(game.listedAt)}
            </p>
          </div>

          <div className="shrink-0 rounded-xl border border-line bg-panel/80 px-5 py-4 backdrop-blur-xl">
            <div className="eyebrow">{game.ticker} · Share price</div>
            <div className="num mt-1.5 text-3xl text-paper sm:text-4xl">{money(game.price)}</div>
            <div className="mt-2 flex items-center gap-3">
              <Delta value={game.change24h} className="text-[13px]" />
              <span className="num text-[11px] text-mute">24h</span>
              <span className="h-3 w-px bg-line" />
              <Delta value={game.change7d} className="text-[13px]" />
              <span className="num text-[11px] text-mute">7d</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
