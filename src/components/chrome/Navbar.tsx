"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogoMark, Wordmark } from "@/components/logo/LogoMark";
import { ButtonLink } from "@/components/ui/Button";
import { useApp } from "@/lib/store";
import { useHydrated } from "@/lib/hooks";
import { money } from "@/lib/format";
import { cn } from "@/lib/cn";

interface NavLink {
  href: string;
  label: string;
}

const publicLinks: NavLink[] = [
  { href: "/market", label: "Market" },
  { href: "/learn/vault", label: "Vault" },
  { href: "/learn/rush", label: "Rush" },
];

const investorLinks: NavLink[] = [
  { href: "/market", label: "Market" },
  { href: "/invest", label: "Portfolio" },
  { href: "/invest/rush", label: "Rush" },
];

const developerLinks: NavLink[] = [
  { href: "/market", label: "Market" },
  { href: "/developer", label: "Dashboard" },
  { href: "/developer/submit", label: "List a game" },
];

export function Navbar() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const account = useApp((s) => s.account);
  const cash = useApp((s) => s.cash);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const links = !hydrated || !account
    ? publicLinks
    : account.type === "investor"
      ? investorLinks
      : developerLinks;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300",
        scrolled ? "border-line bg-void/85 backdrop-blur-xl" : "border-transparent bg-transparent",
      )}
    >
      <nav className="mx-auto flex h-14 max-w-[1400px] items-center gap-6 px-4 sm:px-6 md:h-16 lg:px-10">
        <Link href="/" className="flex items-center gap-2.5 text-paper" aria-label="HXinvestement home">
          <LogoMark size={24} />
          <Wordmark className="hidden sm:inline" />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "relative rounded-md px-3 py-1.5 text-[13px] transition-colors",
                  active ? "text-paper" : "text-mute hover:text-paper",
                )}
              >
                {l.label}
                {active ? (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-x-3 -bottom-px h-px bg-signal"
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  />
                ) : null}
              </Link>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-2.5">
          {hydrated && account ? (
            <>
              {account.type === "investor" ? (
                <div className="hidden items-baseline gap-2 rounded-lg border border-line bg-panel px-3 py-1.5 lg:flex">
                  <span className="eyebrow">Cash</span>
                  <span className="num text-[13px] text-paper">{money(cash)}</span>
                </div>
              ) : null}
              <Link
                href={account.type === "investor" ? "/invest" : "/developer"}
                className="flex items-center gap-2 rounded-lg border border-line bg-panel px-2.5 py-1.5 transition-colors hover:border-[#2c3446]"
              >
                <span
                  className="grid size-5 place-items-center rounded text-[10px] font-semibold text-void"
                  style={{ background: account.type === "investor" ? "#3df2a7" : "#9b7bff" }}
                >
                  {account.displayName.slice(0, 1).toUpperCase()}
                </span>
                <span className="num hidden text-[12px] text-mute-2 sm:inline">{account.handle}</span>
              </Link>
            </>
          ) : (
            <ButtonLink href="/signup" size="sm" className="hidden sm:inline-flex">
              Open an account
            </ButtonLink>
          )}

          <button
            onClick={() => setOpen((v) => !v)}
            className="grid size-9 place-items-center rounded-lg border border-line bg-panel text-mute-2 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            <svg viewBox="0 0 16 16" width="15" height="15" fill="none" aria-hidden>
              {open ? (
                <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              ) : (
                <path d="M2.5 5h11M2.5 11h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-line bg-void/95 backdrop-blur-xl md:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="block rounded-lg px-3 py-2.5 text-sm text-mute-2 hover:bg-panel hover:text-paper"
                >
                  {l.label}
                </Link>
              ))}
              {hydrated && !account ? (
                <ButtonLink href="/signup" size="md" className="mt-2 w-full">
                  Open an account
                </ButtonLink>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
