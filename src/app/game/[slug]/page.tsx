import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { games, gamesByDeveloper, getGame } from "@/data/games";
import { getDeveloper } from "@/data/developers";
import { ListingHero } from "@/components/listing/ListingHero";
import { StatsBar } from "@/components/listing/StatsBar";
import { PriceCard } from "@/components/listing/PriceCard";
import { OfferingPanel } from "@/components/listing/OfferingPanel";
import { AboutSection } from "@/components/listing/AboutSection";
import { DeveloperCard } from "@/components/listing/DeveloperCard";

export function generateStaticParams() {
  return games.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) return { title: "Listing not found" };
  return { title: `${game.title} (${game.ticker})`, description: game.tagline };
}

export default async function ListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();

  const developer = getDeveloper(game.developerId);
  const others = gamesByDeveloper(developer.id).filter((g) => g.id !== game.id);

  return (
    <article className="-mt-14 md:-mt-16">
      <ListingHero game={game} developer={developer} />
      <StatsBar game={game} />

      <div className="mx-auto grid max-w-[1400px] gap-4 px-4 py-8 sm:px-6 lg:grid-cols-[1.65fr_1fr] lg:gap-5 lg:px-10 lg:py-12">
        <div className="space-y-4 lg:order-1">
          <PriceCard game={game} />
          <AboutSection game={game} />
        </div>

        <div className="space-y-4 lg:order-2">
          <div className="lg:sticky lg:top-32 lg:space-y-4">
            <OfferingPanel game={game} />
            <DeveloperCard developer={developer} others={others} />
          </div>
        </div>
      </div>
    </article>
  );
}
