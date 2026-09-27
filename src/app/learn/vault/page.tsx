import type { Metadata } from "next";
import { ModeExplainer, type ExplainerStep } from "@/components/learn/ModeExplainer";
import { ButtonLink, ArrowRight } from "@/components/ui/Button";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "How Vault works",
  description: "Buy shares and hold them as long as you like. Sell whenever you choose.",
};

const steps: ExplainerStep[] = [
  {
    title: "Buy shares at the live price",
    body: "You place an order against an open offering. The shares are yours from that moment, and the cost you paid becomes your cost basis.",
    layout: "bought",
    value: 1000,
    caption: "500 shares at $2.00",
  },
  {
    title: "Hold for as long as you want",
    body: "Vault positions have no expiry date. Nothing forces you out, and nothing settles automatically.",
    layout: "held",
    value: 1180,
    caption: "Month 3 · position open",
  },
  {
    title: "The price follows the game",
    body: "Player growth, revenue and retention move the share price. Your gain is unrealised while you still hold it.",
    layout: "held",
    value: 1640,
    caption: "Month 9 · unrealised +64%",
  },
  {
    title: "Sell on the day you choose",
    body: "You close the position whenever the price suits you. The gain is realised and settles back into your cash balance.",
    layout: "settled",
    value: 1820,
    caption: "Sold · realised to cash",
  },
];

const rules = [
  ["Horizon", "Open-ended. There is no expiry on a Vault position."],
  ["Exit", "Any time. You choose the day and the size."],
  ["Cost basis", "Averaged across every buy in the same listing."],
  ["Scored on", "Unrealised gain until you sell, realised after."],
  ["Balance", "Vault uses your main cash balance."],
];

export default function VaultLearnPage() {
  return (
    <div className="relative">
      <div aria-hidden className="grid-field pointer-events-none absolute inset-0 opacity-25" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[46vh]"
        style={{ background: "radial-gradient(44% 58% at 50% 0%, rgba(61,242,167,0.12) 0%, transparent 72%)" }}
      />

      <div className="relative mx-auto max-w-[1180px] px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
        <Reveal>
          <span className="num text-[11px] uppercase tracking-[0.16em] text-signal">
            Vault · long-term
          </span>
          <h1 className="tight mt-4 max-w-2xl text-4xl font-semibold leading-[1.0] text-paper sm:text-6xl">
            Buy it. Keep it. Sell when you decide.
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-mute-2">
            Vault is the straightforward half of the platform. There is no clock, no cycle and no
            forced exit — just a position that moves with the game behind it.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-10">
          <ModeExplainer steps={steps} accent="#3df2a7" baseValue={1000} />
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
                  If you have never used a brokerage
                </h3>
                <p className="mt-3 text-[13px] leading-relaxed text-mute">
                  A share is a fraction of a company. If the studio behind a game grows, the whole
                  company is worth more, so each share is worth more. You have not made or lost
                  anything until you sell — the number you see in between is what the position would
                  be worth if you sold today.
                </p>
                <p className="mt-3 text-[13px] leading-relaxed text-mute">
                  Prices can fall. A listing with falling players usually has a falling price, and
                  holding through it is a choice, not a guarantee.
                </p>
              </div>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/market" className="flex-1">
                  Browse listings <ArrowRight />
                </ButtonLink>
                <ButtonLink href="/learn/rush" variant="outline" className="flex-1">
                  Compare with Rush
                </ButtonLink>
              </div>
            </Panel>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
