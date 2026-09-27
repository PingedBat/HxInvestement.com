import { dailySeries, intradaySeries, backAt, changeBetween } from "@/data/prices";
import { rngFor } from "@/lib/rng";
import type { Developer, Game, Listing } from "@/lib/types";

/**
 * Turns a freshly submitted listing into the same shape the market uses, so the
 * developer sees their game on the real listing page rather than a preview mock.
 * A new listing has almost no history, so the generated series is short and flat.
 */
export function listingToGame(listing: Listing): Game {
  const rand = rngFor(listing.id);
  const ticker = listing.title
    .replace(/[^a-z\s]/gi, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase()
    .padEnd(3, "X");

  const history = dailySeries(listing.id, 30, listing.pricePerShare, 0.02, 0.006);
  const intraday = intradaySeries(listing.id, 168, listing.pricePerShare, 0.004, 0.003);

  const mau = listing.players;
  const ccu = Math.max(40, Math.round(mau / 160));

  return {
    id: listing.id,
    slug: listing.id,
    ticker,
    title: listing.title,
    platform: listing.platform,
    genre: listing.genre,
    tagline: listing.tagline,
    description: listing.description
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean),
    developerId: "dev-you",
    art: listing.art,
    screenshots: [
      { label: "Cover", art: listing.art },
      { label: "In game", art: [listing.art[1], listing.art[0]] },
      { label: "Progression", art: listing.art },
    ],
    trailerUrl: listing.trailerUrl,
    stats: {
      mau,
      ccu,
      peakCcu: Math.round(ccu * (1.8 + rand())),
      avgSessionMin: 18 + Math.floor(rand() * 26),
      retentionD7: 0.22 + rand() * 0.2,
      rating: Math.round((4 + rand() * 0.8) * 10) / 10,
      ratingCount: Math.round(mau * 0.045),
      revenue30d: Math.round(mau * (0.08 + rand() * 0.14)),
      revenueGrowth: Math.round((rand() * 22 - 3) * 10) / 10,
    },
    valuation: listing.valuation,
    sharesTotal: listing.sharesTotal,
    sharesOffered: listing.sharesOffered,
    sharesSold: 0,
    ipoPrice: listing.pricePerShare,
    price: listing.pricePerShare,
    change24h: changeBetween(backAt(intraday, 24), listing.pricePerShare),
    change7d: changeBetween(backAt(history, 7), listing.pricePerShare),
    change30d: changeBetween(history[0].p, listing.pricePerShare),
    volume24h: 0,
    listedAt: listing.submittedAt.slice(0, 10),
    rushEligible: false,
    history,
    intraday,
  };
}

export function studioDeveloper(name: string, handle: string, createdAt: string): Developer {
  return {
    id: "dev-you",
    name,
    handle,
    location: "Your studio",
    foundedYear: new Date(createdAt).getUTCFullYear(),
    joinedAt: createdAt.slice(0, 10),
    bio: "Your studio profile. In a live product this would be filled in during onboarding and verified against your platform developer account.",
    verified: false,
    teamSize: 1,
    hue: 268,
    totalRaised: 0,
    gamesListed: 0,
    avgReturn: 0,
  };
}
