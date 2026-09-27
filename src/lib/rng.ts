/**
 * Deterministic generators. Every series in this app is derived from a string
 * seed so the server render and the client render produce identical numbers —
 * without this, hydration would mismatch on every chart.
 */

export function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function next(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function rngFor(seed: string) {
  return mulberry32(hashSeed(seed));
}

/** Box–Muller, clamped, for price-walk noise. */
export function gauss(rand: () => number): number {
  const u = Math.max(rand(), 1e-9);
  const v = rand();
  const n = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return Math.max(-3, Math.min(3, n));
}
