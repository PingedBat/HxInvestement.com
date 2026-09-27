"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Button, ArrowRight } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { LogoMark } from "@/components/logo/LogoMark";
import { useApp } from "@/lib/store";
import type { AccountType } from "@/lib/types";
import { money } from "@/lib/format";
import { cn } from "@/lib/cn";

const options: {
  type: AccountType;
  title: string;
  line: string;
  accent: string;
  gets: string[];
}[] = [
  {
    type: "investor",
    title: "Investor",
    line: "Buy shares in listed games and manage a portfolio.",
    accent: "#3df2a7",
    gets: [
      "A funded demo balance of $24,850",
      "Vault and Rush, switchable at any time",
      "Portfolio, cost basis and unrealised gain",
      "The weekly Rush leaderboard",
    ],
  },
  {
    type: "developer",
    title: "Developer",
    line: "List a game you have shipped and raise against it.",
    accent: "#9b7bff",
    gets: [
      "The four-step listing submission",
      "Live share maths while you set the raise",
      "A public listing page for your game",
      "A studio dashboard with holder counts",
    ],
  },
];

export function SignupFlow() {
  const params = useSearchParams();
  const router = useRouter();
  const signUp = useApp((s) => s.signUp);

  const initial = params.get("type");
  const [type, setType] = useState<AccountType | null>(
    initial === "investor" || initial === "developer" ? initial : null,
  );
  const [step, setStep] = useState(initial === "investor" || initial === "developer" ? 1 : 0);
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const chosen = options.find((o) => o.type === type);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (displayName.trim().length < 2) next.displayName = "Enter at least two characters.";
    if (!/^[a-z0-9_]{3,18}$/i.test(handle.replace(/^@/, "")))
      next.handle = "3–18 characters, letters, numbers and underscores only.";
    setErrors(next);
    if (Object.keys(next).length || !type) return;

    signUp(type, handle.replace(/^@/, "").toLowerCase(), displayName.trim());
    router.push(type === "investor" ? "/invest" : "/developer");
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <div aria-hidden className="grid-field pointer-events-none absolute inset-0 opacity-30" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(48% 42% at 50% 8%, ${chosen?.accent ?? "#3df2a7"}14 0%, transparent 70%)`,
        }}
      />

      <div className="relative mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="flex items-center justify-center gap-2.5">
          <LogoMark size={26} className="text-paper" />
          <span className="display text-[15px] font-semibold tracking-[-0.04em]">
            HX<span className="text-mute-2">investement</span>
          </span>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2">
          {[0, 1].map((i) => (
            <span
              key={i}
              className={cn(
                "h-[3px] w-10 rounded-full transition-colors duration-300",
                i <= step ? "bg-signal" : "bg-line",
              )}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 ? (
            <motion.div
              key="choose"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="tight mt-10 text-center text-3xl font-semibold text-paper sm:text-4xl">
                Which side are you on?
              </h1>
              <p className="mx-auto mt-4 max-w-md text-center text-sm leading-relaxed text-mute">
                This choice shapes the whole product. You can open a second account later; you
                cannot be both at once.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {options.map((o) => (
                  <button
                    key={o.type}
                    type="button"
                    onClick={() => {
                      setType(o.type);
                      setStep(1);
                    }}
                    className="group relative overflow-hidden rounded-2xl border border-line bg-panel p-6 text-left transition-colors duration-300 hover:border-[#2c3446]"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-20 -top-20 size-52 rounded-full opacity-[0.14] blur-3xl transition-opacity duration-500 group-hover:opacity-30"
                      style={{ background: o.accent }}
                    />
                    <div className="flex items-center gap-2.5">
                      <span className="size-1.5 rounded-full" style={{ background: o.accent }} />
                      <span className="num text-[10px] uppercase tracking-[0.18em]" style={{ color: o.accent }}>
                        {o.title}
                      </span>
                    </div>
                    <p className="mt-4 text-[15px] leading-snug text-paper">{o.line}</p>
                    <ul className="mt-5 space-y-2 border-t border-line-soft pt-4">
                      {o.gets.map((g) => (
                        <li key={g} className="flex gap-2.5 text-[12px] leading-relaxed text-mute">
                          <span className="mt-[7px] size-1 shrink-0 rounded-full" style={{ background: o.accent }} />
                          {g}
                        </li>
                      ))}
                    </ul>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm text-paper">
                      Continue <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto mt-10 max-w-md"
            >
              <div className="flex items-center justify-center gap-2.5">
                <span className="size-1.5 rounded-full" style={{ background: chosen?.accent }} />
                <span className="num text-[10px] uppercase tracking-[0.18em]" style={{ color: chosen?.accent }}>
                  {chosen?.title} account
                </span>
              </div>

              <h1 className="tight mt-5 text-center text-3xl font-semibold text-paper sm:text-4xl">
                Name your account
              </h1>
              <p className="mt-4 text-center text-sm leading-relaxed text-mute">
                No email, no password, no verification. Nothing on this platform is real, so there
                is nothing to protect.
              </p>

              <form onSubmit={submit} className="mt-9 space-y-5">
                <Field
                  label={type === "developer" ? "Studio name" : "Display name"}
                  required
                  error={errors.displayName}
                >
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={type === "developer" ? "Northline Studio" : "Alex Moreau"}
                    maxLength={40}
                    autoFocus
                  />
                </Field>

                <Field label="Handle" required error={errors.handle} hint="Shown on listings and the Rush leaderboard.">
                  <div className="relative">
                    <span className="num pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-mute">
                      @
                    </span>
                    <Input
                      value={handle}
                      onChange={(e) => setHandle(e.target.value.replace(/^@/, ""))}
                      placeholder="atlasrun"
                      className="pl-7"
                      mono
                      maxLength={18}
                    />
                  </div>
                </Field>

                {type === "investor" ? (
                  <div className="flex items-center justify-between rounded-lg border border-line bg-panel-2 px-4 py-3">
                    <span className="text-[13px] text-mute">Opening balance</span>
                    <span className="num text-[13px] text-signal">{money(24_850)}</span>
                  </div>
                ) : null}

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setStep(0)} className="flex-1">
                    Back
                  </Button>
                  <Button type="submit" className="flex-[2]">
                    Open account <ArrowRight />
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
