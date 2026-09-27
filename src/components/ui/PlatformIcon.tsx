import { platformMeta } from "@/lib/platforms";
import type { Platform } from "@/lib/types";
import { cn } from "@/lib/cn";

/**
 * Abstract geometric glyphs, not platform trademarks: a tilted square for
 * Roblox, a chevron for Fortnite Creative, an isometric block for Minecraft.
 */
export function PlatformIcon({
  platform,
  size = 14,
  className,
}: {
  platform: Platform;
  size?: number;
  className?: string;
}) {
  const common = { width: size, height: size, viewBox: "0 0 16 16", fill: "none", "aria-hidden": true as const };

  if (platform === "roblox") {
    return (
      <svg {...common} className={className}>
        <rect x="2.6" y="2.6" width="10.8" height="10.8" rx="1" transform="rotate(12 8 8)" stroke="currentColor" strokeWidth="1.4" />
        <rect x="6.3" y="6.3" width="3.4" height="3.4" transform="rotate(12 8 8)" fill="currentColor" />
      </svg>
    );
  }

  if (platform === "fortnite") {
    return (
      <svg {...common} className={className}>
        <path d="M8 1.8 13.8 12.4a.7.7 0 0 1-.6 1.05H2.8a.7.7 0 0 1-.6-1.05z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M8 6.4 10.6 11H5.4z" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg {...common} className={className}>
      <path d="M8 1.9 14 5.2v5.6L8 14.1 2 10.8V5.2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M8 8.05 14 5.2M8 8.05 2 5.2M8 8.05v6.05" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function PlatformTag({
  platform,
  className,
  withLabel = true,
}: {
  platform: Platform;
  className?: string;
  withLabel?: boolean;
}) {
  const meta = platformMeta(platform);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border border-line bg-panel-2 px-2 py-1 text-[11px] tracking-wide",
        className,
      )}
      style={{ color: meta.tint }}
    >
      <PlatformIcon platform={platform} />
      {withLabel ? <span className="num text-[10px] uppercase tracking-[0.12em]">{meta.short}</span> : null}
    </span>
  );
}
