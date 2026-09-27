import Link from "next/link";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Delta";
import { Sparkline } from "@/components/ui/Sparkline";
import { compactMoney, money, monthYear, signedPct } from "@/lib/format";
import type { Developer, Game } from "@/lib/types";

export function DeveloperCard({
  developer,
  others = [],
}: {
  developer: Developer;
  others?: Game[];
}) {
  return (
    <Panel>
      <PanelHeader title="Developer" />
      <div className="px-4 py-5 sm:px-5">
        <div className="flex items-start gap-3.5">
          <span
            className="grid size-11 shrink-0 place-items-center rounded-lg text-[15px] font-semibold text-void"
            style={{
              background: `linear-gradient(140deg, hsl(${developer.hue} 72% 62%), hsl(${(developer.hue + 40) % 360} 68% 46%))`,
            }}
          >
            {developer.name.slice(0, 1)}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-[15px] text-paper">{developer.name}</h4>
              {developer.verified ? <Badge tone="signal">Verified</Badge> : null}
            </div>
            <p className="num mt-1 text-[11px] text-mute">
              {developer.handle} · {developer.location} · Founded {developer.foundedYear}
            </p>
          </div>
        </div>

        <p className="mt-4 text-[13px] leading-relaxed text-mute-2">{developer.bio}</p>

        <dl className="mt-5 grid grid-cols-3 gap-4 border-t border-line-soft pt-4">
          <div>
            <dt className="eyebrow text-[9px]">Raised</dt>
            <dd className="num mt-1 text-[13px] text-paper">{compactMoney(developer.totalRaised)}</dd>
          </div>
          <div>
            <dt className="eyebrow text-[9px]">Listings</dt>
            <dd className="num mt-1 text-[13px] text-paper">{developer.gamesListed}</dd>
          </div>
          <div>
            <dt className="eyebrow text-[9px]">Avg return</dt>
            <dd className="num mt-1 text-[13px] text-signal">{signedPct(developer.avgReturn, 1)}</dd>
          </div>
        </dl>

        <p className="num mt-4 text-[10px] uppercase tracking-[0.14em] text-mute">
          On HXinvestement since {monthYear(developer.joinedAt)} · Team of {developer.teamSize}
        </p>

        {others.length ? (
          <div className="mt-5 border-t border-line-soft pt-4">
            <h5 className="eyebrow">Also listed by {developer.name}</h5>
            <ul className="mt-3 space-y-2">
              {others.map((g) => (
                <li key={g.id}>
                  <Link
                    href={`/game/${g.slug}`}
                    className="group flex items-center gap-3 rounded-lg border border-line-soft bg-panel-2 px-3 py-2.5 transition-colors hover:border-[#2c3446]"
                  >
                    <span
                      className="size-7 shrink-0 rounded"
                      style={{ background: `linear-gradient(135deg, ${g.art[0]}, ${g.art[1]})` }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] text-paper group-hover:text-signal">
                        {g.title}
                      </span>
                      <span className="num block text-[10px] uppercase tracking-[0.12em] text-mute">
                        {g.ticker}
                      </span>
                    </span>
                    <Sparkline series={g.history.slice(-30)} className="h-6 w-14" />
                    <span className="num shrink-0 text-[12px] text-mute-2">{money(g.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </Panel>
  );
}
