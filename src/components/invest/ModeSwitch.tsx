"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useApp } from "@/lib/store";
import type { InvestingMode } from "@/lib/types";
import { cn } from "@/lib/cn";

const copy: Record<InvestingMode, { label: string; note: string }> = {
  vault: { label: "Vault", note: "Hold as long as you like" },
  rush: { label: "Rush", note: "Seven-day cycle" },
};

export function ModeSwitch({ active }: { active: InvestingMode }) {
  const router = useRouter();
  const setMode = useApp((s) => s.setMode);

  function go(mode: InvestingMode) {
    setMode(mode);
    router.push(mode === "vault" ? "/invest" : "/invest/rush");
  }

  return (
    <div className="inline-flex rounded-xl border border-line bg-panel p-1">
      {(["vault", "rush"] as const).map((m) => {
        const on = active === m;
        return (
          <button
            key={m}
            onClick={() => go(m)}
            className={cn(
              "relative rounded-lg px-4 py-2.5 text-left transition-colors sm:px-5",
              on ? "text-paper" : "text-mute hover:text-paper",
            )}
          >
            {on ? (
              <motion.span
                layoutId="mode-pill"
                className="absolute inset-0 rounded-lg border border-line bg-panel-2"
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              />
            ) : null}
            <span className="relative block">
              <span className="num text-[12px] uppercase tracking-[0.14em]">{copy[m].label}</span>
              <span className="mt-0.5 hidden text-[11px] text-mute sm:block">{copy[m].note}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
