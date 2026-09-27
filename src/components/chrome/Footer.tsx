import Link from "next/link";
import { LogoMark, Wordmark } from "@/components/logo/LogoMark";

const columns = [
  {
    title: "Market",
    links: [
      { href: "/market", label: "All listings" },
      { href: "/market?platform=roblox", label: "Roblox" },
      { href: "/market?platform=fortnite", label: "Fortnite Creative" },
      { href: "/market?platform=minecraft", label: "Minecraft" },
    ],
  },
  {
    title: "Invest",
    links: [
      { href: "/learn/vault", label: "How Vault works" },
      { href: "/learn/rush", label: "How Rush works" },
      { href: "/invest", label: "Portfolio" },
      { href: "/invest/rush", label: "Rush terminal" },
    ],
  },
  {
    title: "Developers",
    links: [
      { href: "/developer/submit", label: "List a game" },
      { href: "/developer", label: "Studio dashboard" },
      { href: "/signup", label: "Open an account" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-ink">
      <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:px-10">
        <div className="grid gap-12 md:grid-cols-[1.4fr_2fr]">
          <div>
            <Link href="/" className="flex items-center gap-2.5 text-paper">
              <LogoMark size={26} />
              <Wordmark />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-mute">
              A marketplace for equity in user-made games. Developers set a valuation and offer
              shares; investors hold them long-term in Vault or trade them inside a weekly Rush cycle.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="eyebrow">{col.title}</h4>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.href + l.label}>
                      <Link href={l.href} className="text-[13px] text-mute-2 transition-colors hover:text-paper">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex items-center gap-2.5 rounded-lg border border-signal/25 bg-signal/8 px-3 py-2">
            <span className="size-1.5 shrink-0 rounded-full bg-signal" />
            <span className="num text-[11px] uppercase tracking-[0.14em] text-signal">
              Demo — simulated data, no real money
            </span>
          </div>
          <p className="num text-[11px] text-mute">
            HXinvestement · Portfolio build · No accounts, payments or platform APIs are real
          </p>
        </div>
      </div>
    </footer>
  );
}
