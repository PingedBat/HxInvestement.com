"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { LogoMark } from "@/components/logo/LogoMark";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/cn";

const HXLogoCanvas = dynamic(() => import("@/components/logo/HXLogoCanvas"), {
  ssr: false,
  loading: () => null,
});

export function HXLogo({ className, scale = 1 }: { className?: string; scale?: number }) {
  const reduced = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className={cn("relative", className)}>
      {/* Glow bed behind the mark */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(48% 48% at 50% 52%, rgba(61,242,167,0.20) 0%, rgba(61,242,167,0.05) 40%, transparent 72%)",
        }}
      />
      {mounted ? (
        <HXLogoCanvas reducedMotion={reduced} scale={scale} />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <LogoMark size={160} className="text-paper/90 opacity-60" />
        </div>
      )}
    </div>
  );
}
