const usd0 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const usd2 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function money(n: number, decimals = 2): string {
  return decimals === 0 ? usd0.format(n) : usd2.format(n);
}

export function compactMoney(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (abs >= 10_000) return `$${(n / 1_000).toFixed(0)}K`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return usd2.format(n);
}

export function compact(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(abs >= 100_000 ? 0 : 1)}K`;
  return `${n}`;
}

export function num(n: number, decimals = 0): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function pct(n: number, decimals = 2): string {
  return `${n.toFixed(decimals)}%`;
}

export function signedPct(n: number, decimals = 2): string {
  return `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(decimals)}%`;
}

export function signedMoney(n: number, decimals = 2): string {
  const body = decimals === 0 ? usd0.format(Math.abs(n)) : usd2.format(Math.abs(n));
  return `${n >= 0 ? "+" : "−"}${body}`;
}

export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function monthYear(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function clock(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
}
