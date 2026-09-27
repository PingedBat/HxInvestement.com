import type { Platform } from "@/lib/types";

export interface PlatformMeta {
  id: Platform;
  label: string;
  short: string;
  /** Marketplace-wide context copy shown in the submission flow. */
  blurb: string;
  listedGames: number;
  avgValuation: number;
  hue: number;
  tint: string;
}

export const platforms: Record<Platform, PlatformMeta> = {
  roblox: {
    id: "roblox",
    label: "Roblox",
    short: "RBX",
    blurb: "Experiences with a published place ID and at least 30 days of engagement history.",
    listedGames: 5,
    avgValuation: 3_640_000,
    hue: 8,
    tint: "#FF6B5A",
  },
  fortnite: {
    id: "fortnite",
    label: "Fortnite Creative",
    short: "FNC",
    blurb: "Islands with a live map code and verified Creator Economy payout history.",
    listedGames: 5,
    avgValuation: 2_180_000,
    hue: 268,
    tint: "#9B7BFF",
  },
  minecraft: {
    id: "minecraft",
    label: "Minecraft",
    short: "MCR",
    blurb: "Public servers and realms with resolvable DNS and 90 days of uptime records.",
    listedGames: 4,
    avgValuation: 2_910_000,
    hue: 148,
    tint: "#4ADE80",
  },
};

export const platformList = Object.values(platforms);

export function platformMeta(id: Platform): PlatformMeta {
  return platforms[id];
}
