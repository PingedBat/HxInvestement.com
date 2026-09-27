import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRight } from "@/components/ui/Button";

const paths = [
  {
    kind: "Developer",
    href: "/signup?type=developer",
    accent: "#9b7bff",
    headline: "Raise against the game you already shipped.",
    body: "Set a valuation, choose how much of the company to offer, and publish a listing that reads like a filing rather than a store page.",
    points: [
      "Four-step submission with validation at every stage",
      "Live share maths as you set the raise",
      "A public listing page with price history and studio profile",
      "Shareholder-facing stats: retention, revenue, concurrents",
    ],
    cta: "List a game",
  },
  {
    kind: "Investor",
    href: "/signup?type=investor",
    accent: "#3df2a7",
    headline: "Back the games before everyone else finds them.",
    body: "Browse listings across three platforms, read the numbers, and take a position either for the long run or for the week.",
    points: [
      "Vault: buy and hold, sell whenever you choose",
      "Rush: a seven-day cycle scored on the gain you finish with",
      "Cost basis, unrealised gain and value over time",
      "A weekly leaderboard and an end-of-cycle result",
    ],
    cta: "Start investing",
  },
];

export function AccountSplit() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
      <Reveal>
        <span className="eyebrow">Two account types</span>
        <h2 className="tight mt-4 max-w-2xl text-3xl font-semibold leading-[1.05] text-paper sm:text-4xl lg:text-5xl">
          You pick a side at signup. The product changes shape around it.
        </h2>
      </Reveal>

      <div className="mt-12 grid gap-4 lg:grid-cols-2 lg:gap-5">
        {paths.map((p, i) => (
          <Reveal key={p.kind} delay={i * 0.08}>
            <Link
              href={p.href}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-panel p-6 transition-colors duration-300 hover:border-[#2c3446] sm:p-8"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full opacity-[0.16] blur-3xl transition-opacity duration-500 group-hover:opacity-30"
                style={{ background: p.accent }}
              />

              <div className="flex items-center gap-2.5">
                <span className="size-1.5 rounded-full" style={{ background: p.accent }} />
                <span className="num text-[10px] uppercase tracking-[0.18em]" style={{ color: p.accent }}>
                  {p.kind}
                </span>
              </div>

              <h3 className="tight mt-5 max-w-sm text-2xl font-medium leading-[1.12] text-paper sm:text-[1.75rem]">
                {p.headline}
              </h3>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-mute">{p.body}</p>

              <ul className="mt-7 space-y-2.5 border-t border-line-soft pt-6">
                {p.points.map((pt) => (
                  <li key={pt} className="flex gap-3 text-[13px] leading-relaxed text-mute-2">
                    <span className="mt-[7px] size-1 shrink-0 rounded-full" style={{ background: p.accent }} />
                    {pt}
                  </li>
                ))}
              </ul>

              <span className="mt-8 inline-flex items-center gap-2 text-sm text-paper">
                {p.cta}
                <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
