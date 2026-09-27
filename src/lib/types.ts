export type Platform = "roblox" | "fortnite" | "minecraft";

export type AccountType = "developer" | "investor";

export type InvestingMode = "vault" | "rush";

export interface PricePoint {
  /** ISO date (daily series) or ISO datetime (intraday series) */
  t: string;
  p: number;
}

export interface Developer {
  id: string;
  name: string;
  handle: string;
  location: string;
  foundedYear: number;
  joinedAt: string;
  bio: string;
  verified: boolean;
  teamSize: number;
  hue: number;
  totalRaised: number;
  gamesListed: number;
  avgReturn: number;
}

export interface GameStats {
  /** Monthly active players */
  mau: number;
  /** Concurrent players, current */
  ccu: number;
  /** Peak concurrent players, 30d */
  peakCcu: number;
  /** Average session length, minutes */
  avgSessionMin: number;
  /** Day-7 retention, 0-1 */
  retentionD7: number;
  /** Player rating, 0-5 */
  rating: number;
  ratingCount: number;
  /** Trailing 30-day revenue, USD */
  revenue30d: number;
  revenueGrowth: number;
}

export interface Game {
  id: string;
  slug: string;
  ticker: string;
  title: string;
  platform: Platform;
  genre: string;
  tagline: string;
  description: string[];
  developerId: string;
  /** Two-stop gradient used as the generated hero artwork */
  art: [string, string];
  screenshots: { label: string; art: [string, string] }[];
  trailerUrl: string;
  stats: GameStats;
  valuation: number;
  sharesTotal: number;
  sharesOffered: number;
  sharesSold: number;
  ipoPrice: number;
  price: number;
  change24h: number;
  change7d: number;
  change30d: number;
  volume24h: number;
  listedAt: string;
  rushEligible: boolean;
  history: PricePoint[];
  intraday: PricePoint[];
}

export interface Holding {
  gameId: string;
  shares: number;
  costBasis: number;
  openedAt: string;
}

export interface RushPosition {
  gameId: string;
  shares: number;
  entryPrice: number;
  openedAt: string;
}

export interface Transaction {
  id: string;
  ts: string;
  side: "buy" | "sell";
  mode: InvestingMode;
  gameId: string;
  shares: number;
  price: number;
  total: number;
}

export interface LeaderboardEntry {
  rank: number;
  handle: string;
  hue: number;
  returnPct: number;
  pnl: number;
  trades: number;
  topHolding: string;
  isYou?: boolean;
}

export interface RushCycle {
  id: string;
  label: string;
  startsAt: number;
  endsAt: number;
}

export interface Listing {
  id: string;
  platform: Platform;
  title: string;
  genre: string;
  tagline: string;
  description: string;
  players: number;
  trailerUrl: string;
  art: [string, string];
  valuation: number;
  sharesOffered: number;
  sharesTotal: number;
  pricePerShare: number;
  submittedAt: string;
}
