"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AccountType,
  Holding,
  InvestingMode,
  Listing,
  RushPosition,
  Transaction,
} from "@/lib/types";

const STARTING_CASH = 24_850;
const STARTING_RUSH_CASH = 4_120;

/**
 * Seeded demo portfolio. A brand-new account in a real product would start
 * empty; this build opens with positions so the portfolio screens have
 * something to say on first load.
 */
const seedHoldings: Holding[] = [
  { gameId: "anime-clash-arena", shares: 120, costBasis: 8.2, openedAt: "2026-06-14" },
  { gameId: "deepshaft-odyssey", shares: 80, costBasis: 7.44, openedAt: "2026-04-02" },
  { gameId: "zero-gravity-zone", shares: 240, costBasis: 4.11, openedAt: "2026-07-19" },
  { gameId: "neon-district-rp", shares: 300, costBasis: 3.55, openedAt: "2026-08-28" },
  { gameId: "sky-harvest-tycoon", shares: 400, costBasis: 2.06, openedAt: "2026-05-11" },
];

const seedRush: RushPosition[] = [
  { gameId: "tower-siege-legends", shares: 150, entryPrice: 6.4, openedAt: "2026-09-22" },
  { gameId: "kingdoms-of-vael", shares: 90, entryPrice: 4.78, openedAt: "2026-09-23" },
];

const seedTransactions: Transaction[] = [
  { id: "tx-8841", ts: "2026-09-23T14:12:00Z", side: "buy", mode: "rush", gameId: "kingdoms-of-vael", shares: 90, price: 4.78, total: 430.2 },
  { id: "tx-8836", ts: "2026-09-22T09:41:00Z", side: "buy", mode: "rush", gameId: "tower-siege-legends", shares: 150, price: 6.4, total: 960 },
  { id: "tx-8790", ts: "2026-08-28T17:03:00Z", side: "buy", mode: "vault", gameId: "neon-district-rp", shares: 300, price: 3.55, total: 1065 },
  { id: "tx-8702", ts: "2026-07-19T11:28:00Z", side: "buy", mode: "vault", gameId: "zero-gravity-zone", shares: 240, price: 4.11, total: 986.4 },
  { id: "tx-8688", ts: "2026-07-02T08:55:00Z", side: "sell", mode: "vault", gameId: "pixel-prop-hunt", shares: 180, price: 1.94, total: 349.2 },
  { id: "tx-8611", ts: "2026-06-14T19:34:00Z", side: "buy", mode: "vault", gameId: "anime-clash-arena", shares: 120, price: 8.2, total: 984 },
  { id: "tx-8540", ts: "2026-05-11T13:07:00Z", side: "buy", mode: "vault", gameId: "sky-harvest-tycoon", shares: 400, price: 2.06, total: 824 },
  { id: "tx-8477", ts: "2026-04-02T10:19:00Z", side: "buy", mode: "vault", gameId: "deepshaft-odyssey", shares: 80, price: 7.44, total: 595.2 },
];

export interface Account {
  type: AccountType;
  handle: string;
  displayName: string;
  createdAt: string;
}

interface AppState {
  account: Account | null;
  mode: InvestingMode;
  cash: number;
  rushCash: number;
  holdings: Holding[];
  rushPositions: RushPosition[];
  transactions: Transaction[];
  listings: Listing[];
  explainerSeen: Record<InvestingMode, boolean>;

  signUp: (type: AccountType, handle: string, displayName: string) => void;
  signOut: () => void;
  setMode: (mode: InvestingMode) => void;
  markExplainerSeen: (mode: InvestingMode) => void;
  buy: (mode: InvestingMode, gameId: string, shares: number, price: number) => boolean;
  sell: (mode: InvestingMode, gameId: string, shares: number, price: number) => boolean;
  addListing: (listing: Listing) => void;
  resetDemo: () => void;
}

function txId() {
  return `tx-${Math.floor(Math.random() * 90000 + 10000)}`;
}

const initial = {
  account: null as Account | null,
  mode: "vault" as InvestingMode,
  cash: STARTING_CASH,
  rushCash: STARTING_RUSH_CASH,
  holdings: seedHoldings,
  rushPositions: seedRush,
  transactions: seedTransactions,
  listings: [] as Listing[],
  explainerSeen: { vault: false, rush: false } as Record<InvestingMode, boolean>,
};

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      ...initial,

      signUp: (type, handle, displayName) =>
        set({
          account: {
            type,
            handle: handle.startsWith("@") ? handle : `@${handle}`,
            displayName,
            createdAt: new Date().toISOString(),
          },
        }),

      signOut: () => set({ account: null }),

      setMode: (mode) => set({ mode }),

      markExplainerSeen: (mode) =>
        set((s) => ({ explainerSeen: { ...s.explainerSeen, [mode]: true } })),

      buy: (mode, gameId, shares, price) => {
        const cost = shares * price;
        const state = get();
        if (shares <= 0) return false;

        if (mode === "vault") {
          if (cost > state.cash) return false;
          const existing = state.holdings.find((h) => h.gameId === gameId);
          const holdings = existing
            ? state.holdings.map((h) =>
                h.gameId === gameId
                  ? {
                      ...h,
                      costBasis:
                        (h.costBasis * h.shares + cost) / (h.shares + shares),
                      shares: h.shares + shares,
                    }
                  : h,
              )
            : [
                ...state.holdings,
                {
                  gameId,
                  shares,
                  costBasis: price,
                  openedAt: new Date().toISOString().slice(0, 10),
                },
              ];
          set({
            cash: state.cash - cost,
            holdings,
            transactions: [
              { id: txId(), ts: new Date().toISOString(), side: "buy", mode, gameId, shares, price, total: cost },
              ...state.transactions,
            ],
          });
          return true;
        }

        if (cost > state.rushCash) return false;
        const existing = state.rushPositions.find((p) => p.gameId === gameId);
        const rushPositions = existing
          ? state.rushPositions.map((p) =>
              p.gameId === gameId
                ? {
                    ...p,
                    entryPrice:
                      (p.entryPrice * p.shares + cost) / (p.shares + shares),
                    shares: p.shares + shares,
                  }
                : p,
            )
          : [
              ...state.rushPositions,
              { gameId, shares, entryPrice: price, openedAt: new Date().toISOString() },
            ];
        set({
          rushCash: state.rushCash - cost,
          rushPositions,
          transactions: [
            { id: txId(), ts: new Date().toISOString(), side: "buy", mode, gameId, shares, price, total: cost },
            ...state.transactions,
          ],
        });
        return true;
      },

      sell: (mode, gameId, shares, price) => {
        const proceeds = shares * price;
        const state = get();
        if (shares <= 0) return false;

        if (mode === "vault") {
          const existing = state.holdings.find((h) => h.gameId === gameId);
          if (!existing || existing.shares < shares) return false;
          const holdings = state.holdings
            .map((h) => (h.gameId === gameId ? { ...h, shares: h.shares - shares } : h))
            .filter((h) => h.shares > 0);
          set({
            cash: state.cash + proceeds,
            holdings,
            transactions: [
              { id: txId(), ts: new Date().toISOString(), side: "sell", mode, gameId, shares, price, total: proceeds },
              ...state.transactions,
            ],
          });
          return true;
        }

        const existing = state.rushPositions.find((p) => p.gameId === gameId);
        if (!existing || existing.shares < shares) return false;
        const rushPositions = state.rushPositions
          .map((p) => (p.gameId === gameId ? { ...p, shares: p.shares - shares } : p))
          .filter((p) => p.shares > 0);
        set({
          rushCash: state.rushCash + proceeds,
          rushPositions,
          transactions: [
            { id: txId(), ts: new Date().toISOString(), side: "sell", mode, gameId, shares, price, total: proceeds },
            ...state.transactions,
          ],
        });
        return true;
      },

      addListing: (listing) => set((s) => ({ listings: [listing, ...s.listings] })),

      resetDemo: () => set({ ...initial }),
    }),
    {
      name: "hx-demo-state",
      version: 1,
    },
  ),
);
