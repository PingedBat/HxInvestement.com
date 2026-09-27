import { signedMoney, signedPct } from "@/lib/format";
import { cn } from "@/lib/cn";

export function deltaColor(n: number) {
  if (n > 0) return "text-signal";
  if (n < 0) return "text-loss";
  return "text-mute";
}

export function Delta({
  value,
  className,
  decimals = 2,
  arrow = true,
}: {
  value: number;
  className?: string;
  decimals?: number;
  arrow?: boolean;
}) {
  return (
    <span className={cn("num inline-flex items-center gap-1", deltaColor(value), className)}>
      {arrow && value !== 0 ? (
        <svg viewBox="0 0 10 10" width="9" height="9" aria-hidden className={value < 0 ? "rotate-180" : ""}>
          <path d="M5 1 9 8H1z" fill="currentColor" />
        </svg>
      ) : null}
      {signedPct(value, decimals)}
    </span>
  );
}

export function DeltaMoney({
  value,
  className,
  decimals = 2,
}: {
  value: number;
  className?: string;
  decimals?: number;
}) {
  return (
    <span className={cn("num", deltaColor(value), className)}>{signedMoney(value, decimals)}</span>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "signal" | "loss" | "outline";
  className?: string;
}) {
  const tones = {
    neutral: "bg-panel-2 text-mute-2 border-line",
    signal: "bg-signal/10 text-signal border-signal/25",
    loss: "bg-loss/10 text-loss border-loss/25",
    outline: "bg-transparent text-mute border-line",
  };
  return (
    <span
      className={cn(
        "num inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
