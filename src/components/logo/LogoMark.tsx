import { cn } from "@/lib/cn";

/**
 * Flat version of the HX mark: two uprights (H) bridged by a crossing pair (X).
 * Used in the navbar, and as the static fallback for the 3D hero mark.
 */
export function LogoMark({
  className,
  size = 28,
  accent = "#3df2a7",
}: {
  className?: string;
  size?: number;
  accent?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      aria-hidden="true"
      fill="none"
    >
      <g stroke={accent} strokeWidth={4.4}>
        <path d="M9.5 6.5 L22.5 25.5" />
        <path d="M22.5 6.5 L9.5 25.5" />
      </g>
      <g fill="currentColor">
        <rect x="3.4" y="4" width="4.8" height="24" rx="1.1" />
        <rect x="23.8" y="4" width="4.8" height="24" rx="1.1" />
      </g>
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("display text-[15px] font-semibold tracking-[-0.04em]", className)}>
      HX<span className="text-mute-2">investement</span>
    </span>
  );
}
