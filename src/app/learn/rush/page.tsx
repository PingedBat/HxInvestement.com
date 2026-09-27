import type { Metadata } from "next";
import { ModeExplainer, type ExplainerStep } from "@/components/learn/ModeExplainer";
import { ButtonLink, ArrowRight } from "@/components/ui/Button";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "How Rush works",
  description: "A seven-day cycle. Trade short-hold shares and finish with the largest gain.",
};

const steps: ExplainerStep[] = [
  {
    title: "A cycle opens on Monday",
    body: "Every Rush cycle runs seven days. Everyone is on the same clock, and the balance you start with is the balance you are scored against.",
    layout: "market",
    value: 1000,
    caption: "Week open · 7d 00h 00m",
  },
  {
    title: "Buy short-hold shares",
    body: "Rush shares are the same listings on a weekly lease. You buy them the same way, but they will not outlive the cycle.",
    layout: "bought",
    value: 1000,
    caption: "500 shares at $2.00",
  },
  {
    title: "Trade freely all week",
    body: "Sell into a rise, buy back on a dip, rotate between listings. There is no limit on how often you trade inside the cycle.",
    layout: "traded",
    value: 1310,
    caption: "Day 4 · 9 trades placed",
  },
  {
    title: "Sunday, the cycle closes",
    body: "Anything still open settles at the closing price, whether you are watching or not. Your week is scored on return, then the board resets.",
    layout: "settled",
    value: 1420,
    caption: "Settled · +42.0% for the week",
  },
];

const rules = [
  ["Horizon", "Seven days, Monday open to Sunday 23:59 UTC."],
  ["Exit", "Forced. Open positions settle at the closing price."],
  ["Trades", "Unlimited inside the cycle."],
  ["Scored on", "Return over the cycle, not absolute profit."],
  ["Balance", "Rush uses a separate balance from Vault."],
  ["Eligibility", "Only listings with sustained volume are Rush tradeable."],
];

export default function RushLearnPage() {
  return (
    <div className="relative">
      <div aria-hidden className="grid-field pointer-events-none absolute inset-0 opacity-25" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[46vh]"
        style={{ background: "radial-gradient(44% 58% at 50% 0%, rgba(255,159,74,0.13) 0%, transparent 72%)" }}
      />

      <div className="relative mx-auto max-w-[1180px] px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
        <Reveal>
          <span className="num text-[11px] uppercase tracking-[0.16em] text-[#ff9f4a]">
            Rush · weekly cycle
          </span>
          <h1 className="tight mt-4 max-w-2xl text-4xl font-semibold leading-[1.0] text-paper sm:text-6xl">
            Seven days. Then the week is scored.
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-mute-2">
            Rush is the fast half. You hold short-lease shares, trade them as often as you like, and
            the cycle closes on Sunday whether you are there or not.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-10">
          <ModeExplainer steps={steps} accent="#ff9f4a" baseValue={1000} />
        </Reveal>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <Panel className="h-full">
              <PanelHeader title="The rules, in full" />
              <dl className="divide-y divide-line-soft">
                {rules.map(([k, v]) => (
                  <div key={k} className="flex flex-col gap-1 px-4 py-3.5 sm:flex-row sm:items-baseline sm:gap-6 sm:px-5">
                    <dt className="eyebrow w-32 shrink-0">{k}</dt>
                    <dd className="text-[13px] leading-relaxed text-mute-2">{v}</dd>
                  </div>
                ))}
              </dl>
            </Panel>
          </Reveal>

          <Reveal delay={0.06}>
            <Panel className="flex h-full flex-col justify-between p-5 sm:p-7">
              <div>
                <h3 className="tight text-xl font-medium text-paper">
                  Why the cycle has an ending
                </h3>
                <p className="mt-3 text-[13px] leading-relaxed text-mute">
                  A fixed close means everyone is measured over the same window, so the leaderboard
                  compares like with like. It also means a position you forget about still resolves —
                  you cannot be trapped in a trade by not logging in.
                </p>
                <p className="mt-3 text-[13px] leading-relaxed text-mute">
                  Ranking on return rather than profit keeps a small balance competitive with a large
                  one. Trading more often does not improve your score by itself.
                </p>
              </div>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/invest/rush" className="flex-1">
                  Open the terminal <ArrowRight />
                </ButtonLink>
                <ButtonLink href="/learn/vault" variant="outline" className="flex-1">
                  Compare with Vault
                </ButtonLink>
              </div>
            </Panel>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
