import { Panel, PanelHeader } from "@/components/ui/Panel";
import { GameArt } from "@/components/ui/GameArt";
import { Delta } from "@/components/ui/Delta";
import { compact, money, num, pct } from "@/lib/format";
import type { Game } from "@/lib/types";

export function AboutSection({ game }: { game: Game }) {
  const metrics: { label: string; value: React.ReactNode; note?: string }[] = [
    { label: "Monthly active players", value: compact(game.stats.mau) },
    { label: "Concurrent now", value: num(game.stats.ccu) },
    { label: "30-day peak concurrent", value: num(game.stats.peakCcu) },
    { label: "Average session", value: `${game.stats.avgSessionMin} min` },
    { label: "Day-7 retention", value: pct(game.stats.retentionD7 * 100, 1) },
    { label: "Player rating", value: `${game.stats.rating.toFixed(1)} / 5`, note: `${compact(game.stats.ratingCount)} ratings` },
    { label: "Revenue, trailing 30d", value: money(game.stats.revenue30d, 0) },
    { label: "Revenue growth", value: <Delta value={game.stats.revenueGrowth} arrow={false} />, note: "month over month" },
  ];

  return (
    <div className="space-y-4">
      <Panel>
        <PanelHeader title="About this listing" />
        <div className="space-y-4 px-4 py-5 sm:px-5">
          {game.description.map((p, i) => (
            <p key={i} className="max-w-3xl text-sm leading-relaxed text-mute-2">
              {p}
            </p>
          ))}

          <a
            href={game.trailerUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-2 inline-flex items-center gap-2.5 rounded-lg border border-line bg-panel-2 px-3.5 py-2.5 text-[13px] text-mute-2 transition-colors hover:border-[#2c3446] hover:text-paper"
          >
            <svg viewBox="0 0 14 14" width="12" height="12" fill="currentColor" aria-hidden>
              <path d="M3 1.8 12 7l-9 5.2z" />
            </svg>
            Watch the trailer
            <span className="num text-[10px] text-mute">↗</span>
          </a>
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Media" />
        <div className="grid gap-3 px-4 py-5 sm:grid-cols-3 sm:px-5">
          {game.screenshots.map((s) => (
            <figure key={s.label} className="overflow-hidden rounded-lg border border-line-soft">
              <div className="h-28 sm:h-24 lg:h-32">
                <GameArt seed={`${game.slug}-${s.label}`} colors={s.art} detail={6} />
              </div>
              <figcaption className="num bg-panel-2 px-2.5 py-2 text-[10px] uppercase tracking-[0.12em] text-mute">
                {s.label}
              </figcaption>
            </figure>
          ))}
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Key metrics" action={<span className="num text-[10px] text-mute">Self-reported, platform-verified</span>} />
        <dl className="grid grid-cols-2 gap-px bg-line-soft sm:grid-cols-4">
          {metrics.map((m) => (
            <div key={m.label} className="bg-panel px-4 py-4">
              <dt className="eyebrow text-[9px]">{m.label}</dt>
              <dd className="num mt-1.5 text-[15px] text-paper">{m.value}</dd>
              {m.note ? <dd className="mt-0.5 text-[11px] text-mute">{m.note}</dd> : null}
            </div>
          ))}
        </dl>
      </Panel>
    </div>
  );
}
