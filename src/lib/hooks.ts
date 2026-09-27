"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Persisted store values differ between the server render and the first client
 * render. Components that read them wait for this before showing real numbers.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/** Ticks every `intervalMs`, starting only after mount. */
export function useNow(intervalMs = 1000): number | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function useCountUp(target: number, durationMs = 900, decimals = 2): number {
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(reduced ? target : 0);
  const fromRef = useRef(0);

  useEffect(() => {
    if (reduced) {
      setValue(target);
      return;
    }
    const from = fromRef.current;
    const delta = target - from;
    if (Math.abs(delta) < 1e-9) return;

    let raf = 0;
    const start = performance.now();
    const step = (t: number) => {
      const progress = Math.min(1, (t - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 4);
      const next = from + delta * eased;
      fromRef.current = next;
      setValue(Number(next.toFixed(decimals + 2)));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, decimals, reduced]);

  return value;
}

export function useInView<T extends Element>(threshold = 0.25) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return { ref, inView };
}

/**
 * A slow random walk around a base price, so order panels feel like they are
 * watching a live book. Client-only and seeded from the base price.
 */
export function useLivePrice(base: number, active = true, intervalMs = 1800): number {
  const [price, setPrice] = useState(base);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    setPrice(base);
    if (!active || reduced) return;
    const id = window.setInterval(() => {
      setPrice((p) => {
        const drift = (base - p) * 0.18;
        const shock = (Math.random() - 0.5) * base * 0.006;
        return Math.max(0.01, Math.round((p + drift + shock) * 100) / 100);
      });
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [base, active, intervalMs, reduced]);

  return price;
}
