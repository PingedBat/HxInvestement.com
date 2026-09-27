"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "@/components/ui/Button";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/cn";

const modes = [
  {
    id: "vault",
    name: "Vault",
    accent: "#3df2a7",
    horizon: "Hold as long as you like",
    headline: "Buy shares. Keep them until you want out.",
    body: "Vault positions have no expiry. You hold through the quiet months, and you sell on the day you decide the price is right.",
    facts: [
      ["Horizon", "Open-ended"],
      ["Exit", "Any time you choose"],
      ["Scored on", "Unrealised gain"],
    ],
    href: "/learn/vault",
  },
  {
    id: "rush",
    name: "Rush",
    accent: "#ff9f4a",
    horizon: "Seven days, then it closes",
    headline: "Trade a weekly cycle. Finish with the largest gain.",
    body: "Rush shares expire when the cycle closes on Sunday. Until then you can trade them as often as you like, and the week ends with a ranked result.",
    facts: [
      ["Horizon", "7 days"],
      ["Exit", "Forced at cycle close"],
      ["Scored on", "Return over the week"],
    ],
    href: "/learn/rush",
  },
] as const;

/** Long, slow-drifting series for Vault; short, jagged series for Rush. */
const vaultPath = buildPath([1, 1.04, 0.98, 1.12, 1.18, 1.1, 1.26, 1.34, 1.3, 1.46, 1.52, 1.68], 520, 150);
const rushPath = buildPath([1, 1.09, 0.96, 1.14, 1.02, 1.22, 1.11, 1.3, 1.18, 1.36, 1.24, 1.42], 520, 150);

function buildPath(values: number[], w: number, h: number) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / span) * (h - 16) - 8;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

export function ModesScroll() {
  const reduced = usePrefersReducedMotion();
  const section = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const el = section.current;
    if (!el) return;

    gsap.registerPlugin(ScrollTrigger);

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        setProgress(self.progress);
        setActive(self.progress > 0.5 ? 1 : 0);
      },
    });

    return () => {
      trigger.kill();
    };
  }, [reduced]);

  if (reduced) {
    return (
      <section className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-10">
        <span className="eyebrow">Two investing modes</span>
        <h2 className="tight mt-4 text-3xl font-semibold text-paper sm:text-4xl">
          Hold it, or trade the week.
        </h2>
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {modes.map((m, i) => (
            <ModeCard key={m.id} mode={m} path={i === 0 ? vaultPath : rushPath} />
          ))}
        </div>
      </section>
    );
  }

  const mode = modes[active];
  // Within the active half, 0 → 1. Drives the drawn line.
  const localProgress = active === 0 ? Math.min(1, progress / 0.5) : Math.min(1, (progress - 0.5) / 0.5);

  return (
    <section ref={section} className="relative h-[280vh]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div aria-hidden className="grid-field pointer-events-none absolute inset-0 opacity-30" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-colors duration-700"
          style={{
            background: `radial-gradient(52% 46% at 62% 46%, ${mode.accent}1f 0%, transparent 70%)`,
          }}
        />

        <div className="relative mx-auto grid w-full max-w-[1400px] items-center gap-10 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-10">
          <div>
            <span className="eyebrow">Two investing modes</span>
            <h2 className="tight mt-4 text-3xl font-semibold leading-[1.02] text-paper sm:text-5xl">
              Hold it, or trade
              <br />
              the week.
            </h2>

            <div className="mt-10 flex gap-3">
              {modes.map((m, i) => (
                <div key={m.id} className="flex-1">
                  <div className="h-[3px] w-full overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full rounded-full transition-[width] duration-200 ease-linear"
                      style={{
                        width: `${(i === 0 ? Math.min(1, progress / 0.5) : Math.max(0, Math.min(1, (progress - 0.5) / 0.5))) * 100}%`,
                        background: m.accent,
                      }}
                    />
                  </div>
                  <div
                    className={cn(
                      "num mt-2.5 text-[10px] uppercase tracking-[0.18em] transition-colors duration-300",
                      i === active ? "text-paper" : "text-mute",
                    )}
                  >
                    {m.name}
                  </div>
                </div>
              ))}
            </div>

            <div key={mode.id} className="mt-8 animate-[hx-fade_0.5s_ease-out]">
              <p className="num text-[11px] uppercase tracking-[0.16em]" style={{ color: mode.accent }}>
                {mode.horizon}
              </p>
              <h3 className="tight mt-3 max-w-md text-xl font-medium leading-snug text-paper sm:text-2xl">
                {mode.headline}
              </h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-mute">{mode.body}</p>

              <Link
                href={mode.href}
                className="mt-6 inline-flex items-center gap-2 text-sm text-paper transition-colors hover:text-signal"
              >
                See how {mode.name} works
                <ArrowRight />
              </Link>
            </div>
          </div>

          <div className="relative rounded-2xl border border-line bg-panel/80 p-5 backdrop-blur sm:p-8">
            <div className="flex items-baseline justify-between">
              <span className="num text-[11px] uppercase tracking-[0.16em] text-mute-2">
                {mode.name} · sample position
              </span>
              <span className="num text-[11px]" style={{ color: mode.accent }}>
                {active === 0 ? "+68.0%" : "+42.0%"}
              </span>
            </div>

            <svg viewBox="0 0 520 150" className="mt-5 w-full" preserveAspectRatio="none" style={{ height: 150 }} aria-hidden>
              <defs>
                <linearGradient id="hx-mode-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={mode.accent} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={mode.accent} stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0.25, 0.5, 0.75].map((f) => (
                <line key={f} x1="0" x2="520" y1={150 * f} y2={150 * f} stroke="#161a24" strokeWidth="1" vectorEffect="non-scaling-stroke" />
              ))}
              <path
                d={`${active === 0 ? vaultPath : rushPath} L 520 150 L 0 150 Z`}
                fill="url(#hx-mode-fill)"
                opacity={localProgress}
              />
              <path
                d={active === 0 ? vaultPath : rushPath}
                fill="none"
                stroke={mode.accent}
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - localProgress}
              />
            </svg>

            <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-line-soft pt-5">
              {mode.facts.map(([k, v]) => (
                <div key={k}>
                  <dt className="eyebrow text-[9px]">{k}</dt>
                  <dd className="mt-1 text-[13px] text-paper">{v}</dd>
                </div>
              ))}
            </dl>

            {active === 1 ? (
              <div className="mt-5 flex items-center gap-2 rounded-lg border border-line bg-panel-2 px-3 py-2">
                <span className="size-1.5 rounded-full" style={{ background: mode.accent }} />
                <span className="num text-[11px] text-mute-2">
                  Cycle closes Sunday 23:59 UTC — open positions settle automatically
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes hx-fade {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}

function ModeCard({
  mode,
  path,
}: {
  mode: (typeof modes)[number];
  path: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-panel p-6">
      <p className="num text-[11px] uppercase tracking-[0.16em]" style={{ color: mode.accent }}>
        {mode.name} · {mode.horizon}
      </p>
      <h3 className="tight mt-3 text-xl font-medium text-paper">{mode.headline}</h3>
      <p className="mt-3 text-sm leading-relaxed text-mute">{mode.body}</p>
      <svg viewBox="0 0 520 150" className="mt-5 h-28 w-full" preserveAspectRatio="none" aria-hidden>
        <path d={path} fill="none" stroke={mode.accent} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
      <Link href={mode.href} className="mt-4 inline-flex items-center gap-2 text-sm text-paper">
        See how {mode.name} works <ArrowRight />
      </Link>
    </div>
  );
}
