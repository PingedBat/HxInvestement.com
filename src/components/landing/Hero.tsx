"use client";

import { motion, useReducedMotion } from "framer-motion";
import { HXLogo } from "@/components/logo/HXLogo";
import { ButtonLink, ArrowRight } from "@/components/ui/Button";
import { CountUp } from "@/components/ui/CountUp";
import { marketTotals } from "@/data/games";
import { compact, compactMoney } from "@/lib/format";

const stats = [
  { label: "Listings", value: marketTotals.listings, format: (n: number) => String(Math.round(n)), decimals: 0 },
  { label: "Market cap", value: marketTotals.marketCap, format: compactMoney, decimals: 0 },
  { label: "Monthly players", value: marketTotals.players, format: (n: number) => compact(Math.round(n)), decimals: 0 },
  { label: "Studios listed", value: marketTotals.developers, format: (n: number) => String(Math.round(n)), decimals: 0 },
];

export function Hero() {
  const reduced = useReducedMotion();

  const rise = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 22 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] as const },
        };

  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="grid-field pointer-events-none absolute inset-0 opacity-[0.45]" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[70vh]"
        style={{
          background:
            "radial-gradient(60% 55% at 72% 34%, rgba(61,242,167,0.12) 0%, transparent 70%), radial-gradient(45% 40% at 18% 12%, rgba(127,157,255,0.10) 0%, transparent 72%)",
        }}
      />

      <div className="relative mx-auto max-w-[1400px] px-4 pb-16 pt-10 sm:px-6 sm:pt-16 lg:px-10 lg:pb-24 lg:pt-20">
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          {/* Mark leads on mobile, sits right on desktop */}
          <div className="order-1 h-[240px] sm:h-[320px] lg:order-2 lg:h-[540px]">
            <HXLogo className="h-full w-full" scale={1} />
          </div>

          <div className="order-2 lg:order-1">
            <motion.div {...rise(0)} className="inline-flex items-center gap-2.5 rounded-full border border-line bg-panel/70 px-3 py-1.5 backdrop-blur">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-signal opacity-60" />
                <span className="relative inline-flex size-1.5 rounded-full bg-signal" />
              </span>
              <span className="num text-[10px] uppercase tracking-[0.16em] text-mute-2">
                Equity marketplace · Simulated
              </span>
            </motion.div>

            <motion.h1
              {...rise(0.08)}
              className="tight mt-6 text-[2.6rem] font-semibold leading-[0.95] text-paper sm:text-6xl lg:text-[4.6rem]"
            >
              Equity in the games
              <br />
              people actually play.
            </motion.h1>

            <motion.p {...rise(0.16)} className="mt-6 max-w-xl text-[15px] leading-relaxed text-mute-2 sm:text-base">
              Studios on Roblox, Fortnite Creative and Minecraft list their game at a valuation and
              offer a slice of it. Investors buy shares, hold them in Vault or trade them inside a
              seven-day Rush cycle, and take the upside as the game grows.
            </motion.p>

            <motion.div {...rise(0.24)} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/signup?type=investor" size="lg">
                Start investing <ArrowRight />
              </ButtonLink>
              <ButtonLink href="/signup?type=developer" size="lg" variant="outline">
                List your game
              </ButtonLink>
            </motion.div>

            <motion.dl {...rise(0.32)} className="mt-12 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="eyebrow">{s.label}</dt>
                  <dd className="mt-1.5 text-xl text-paper sm:text-2xl">
                    <CountUp value={s.value} format={s.format} decimals={s.decimals} />
                  </dd>
                </div>
              ))}
            </motion.dl>
          </div>
        </div>
      </div>
    </section>
  );
}
