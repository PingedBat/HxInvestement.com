import { rngFor } from "@/lib/rng";
import { cn } from "@/lib/cn";

/**
 * Generated key art. Real listings would carry uploaded screenshots; here each
 * game gets a deterministic composition derived from its slug so the same title
 * always renders the same image.
 */
export function GameArt({
  seed,
  colors,
  className,
  detail = 7,
}: {
  seed: string;
  colors: [string, string];
  className?: string;
  detail?: number;
}) {
  const rand = rngFor(`art:${seed}`);
  const id = seed.replace(/[^a-z0-9]/gi, "");

  const shapes = Array.from({ length: detail }, () => ({
    x: rand() * 120 - 10,
    y: rand() * 120 - 10,
    w: 12 + rand() * 46,
    h: 12 + rand() * 46,
    rot: rand() * 90 - 45,
    op: 0.05 + rand() * 0.16,
    round: rand() > 0.6,
  }));

  const rays = Array.from({ length: 4 }, () => ({
    x: rand() * 100,
    w: 1 + rand() * 12,
    op: 0.04 + rand() * 0.09,
  }));

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      className={cn("block h-full w-full", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="100%" stopColor={colors[1]} />
        </linearGradient>
        <linearGradient id={`vig-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
        </linearGradient>
      </defs>

      <rect width="100" height="100" fill={`url(#bg-${id})`} />

      {rays.map((r, i) => (
        <rect key={`r${i}`} x={r.x} y="-20" width={r.w} height="140" fill="#fff" opacity={r.op} transform={`rotate(18 50 50)`} />
      ))}

      {shapes.map((s, i) =>
        s.round ? (
          <circle key={i} cx={s.x} cy={s.y} r={s.w / 2} fill="#fff" opacity={s.op} />
        ) : (
          <rect
            key={i}
            x={s.x}
            y={s.y}
            width={s.w}
            height={s.h}
            rx="2"
            fill="#fff"
            opacity={s.op}
            transform={`rotate(${s.rot} ${s.x + s.w / 2} ${s.y + s.h / 2})`}
          />
        ),
      )}

      <rect width="100" height="100" fill={`url(#vig-${id})`} />
    </svg>
  );
}
