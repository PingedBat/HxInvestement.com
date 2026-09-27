"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Layout } from "@/components/learn/ExplainerScene";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { money, signedPct } from "@/lib/format";
import { cn } from "@/lib/cn";

const ExplainerScene = dynamic(() => import("@/components/learn/ExplainerScene"), {
  ssr: false,
  loading: () => null,
});

export interface ExplainerStep {
  title: string;
  body: string;
  layout: Layout;
  value: number;
  caption: string;
}

const STEP_MS = 4200;

export function ModeExplainer({
  steps,
  accent,
  baseValue,
}: {
  steps: ExplainerStep[];
  accent: string;
  baseValue: number;
}) {
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(!reduced);

  useEffect(() => {
    if (reduced) setPlaying(false);
  }, [reduced]);

  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(
      () => setIndex((i) => (i + 1) % steps.length),
      STEP_MS,
    );
    return () => window.clearTimeout(id);
  }, [index, playing, steps.length]);

  const step = steps[index];
  const maxValue = Math.max(...steps.map((s) => s.value));
  const change = ((step.value - baseValue) / baseValue) * 100;

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-panel">
      <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
        {/* Stage */}
        <div className="relative h-[300px] border-b border-line sm:h-[380px] lg:h-[460px] lg:border-b-0 lg:border-r">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(48% 46% at 50% 48%, ${accent}1c 0%, transparent 72%)`,
            }}
          />

          {reduced ? (
            <StaticStage steps={steps} index={index} accent={accent} />
          ) : (
            <ExplainerScene
              layout={step.layout}
              accent={accent}
              valueRatio={step.value / maxValue}
            />
          )}

          <div className="pointer-events-none absolute left-5 top-5">
            <div className="eyebrow">Position value</div>
            <div className="num mt-1 text-2xl text-paper sm:text-3xl">{money(step.value)}</div>
            <div
              className={cn("num mt-1 text-[12px]", change >= 0 ? "text-signal" : "text-loss")}
            >
              {signedPct(change)} from entry
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-5 left-5 right-5">
            <span className="num rounded-md border border-line bg-void/75 px-2.5 py-1.5 text-[10px] uppercase tracking-[0.14em] text-mute backdrop-blur">
              {step.caption}
            </span>
          </div>
        </div>

        {/* Steps */}
        <div className="flex flex-col p-5 sm:p-7">
          <div className="flex items-center justify-between">
            <span className="eyebrow">
              Step {index + 1} of {steps.length}
            </span>
            <button
              onClick={() => setPlaying((p) => !p)}
              className="num rounded-md border border-line px-2.5 py-1.5 text-[10px] uppercase tracking-[0.12em] text-mute transition-colors hover:text-paper"
            >
              {playing ? "Pause" : "Play"}
            </button>
          </div>

          <div className="mt-6 min-h-[132px] flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={reduced ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <h3 className="tight text-xl font-medium leading-snug text-paper sm:text-2xl">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-mute">{step.body}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <ol className="mt-6 space-y-1.5">
            {steps.map((s, i) => (
              <li key={s.title}>
                <button
                  onClick={() => {
                    setIndex(i);
                    setPlaying(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                    i === index ? "bg-panel-2" : "hover:bg-panel-2/60",
                  )}
                >
                  <span
                    className={cn(
                      "num text-[10px] uppercase tracking-[0.14em]",
                      i === index ? "text-paper" : "text-mute",
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={cn(
                      "flex-1 truncate text-[13px]",
                      i === index ? "text-paper" : "text-mute",
                    )}
                  >
                    {s.title}
                  </span>
                  <span className="h-1 w-10 overflow-hidden rounded-full bg-line">
                    <motion.span
                      className="block h-full rounded-full"
                      style={{ background: accent }}
                      initial={false}
                      animate={{ width: i < index ? "100%" : i === index ? "100%" : "0%" }}
                      transition={{ duration: i === index && playing ? STEP_MS / 1000 : 0.3, ease: "linear" }}
                    />
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

/** Reduced-motion fallback: the same steps as a static diagram. */
function StaticStage({
  steps,
  index,
  accent,
}: {
  steps: ExplainerStep[];
  index: number;
  accent: string;
}) {
  const max = Math.max(...steps.map((s) => s.value));
  return (
    <div className="flex h-full items-end justify-center gap-5 px-8 pb-20 pt-24">
      {steps.map((s, i) => (
        <div key={s.title} className="flex w-16 flex-col items-center gap-3">
          <span className="num text-[10px] text-mute">{money(s.value, 0)}</span>
          <span
            className="w-full rounded-t"
            style={{
              height: `${(s.value / max) * 150}px`,
              background: i === index ? accent : "#1d2230",
            }}
          />
          <span className={cn("num text-[10px]", i === index ? "text-paper" : "text-mute")}>
            {String(i + 1).padStart(2, "0")}
          </span>
        </div>
      ))}
    </div>
  );
}
