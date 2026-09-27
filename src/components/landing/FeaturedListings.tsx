import Link from "next/link";
import { games } from "@/data/games";
import { GameCard } from "@/components/market/GameCard";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { ArrowRight } from "@/components/ui/Button";

export function FeaturedListings() {
  const featured = [...games].sort((a, b) => b.change7d - a.change7d).slice(0, 4);

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-10 lg:py-24">
      <Reveal className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <span className="eyebrow">Moving this week</span>
          <h2 className="tight mt-4 text-3xl font-semibold text-paper sm:text-4xl">
            Four listings worth a look.
          </h2>
        </div>
        <Link href="/market" className="inline-flex items-center gap-2 text-sm text-mute-2 transition-colors hover:text-paper">
          All {games.length} listings <ArrowRight />
        </Link>
      </Reveal>

      <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {featured.map((g) => (
          <StaggerItem key={g.id}>
            <GameCard game={g} className="h-full" />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
