"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Button, ButtonLink, ArrowRight } from "@/components/ui/Button";
import { Field, Input, Textarea, Select, InputAffix } from "@/components/ui/Field";
import { Panel } from "@/components/ui/Panel";
import { GameArt } from "@/components/ui/GameArt";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { platformList } from "@/lib/platforms";
import { useApp } from "@/lib/store";
import { useHydrated } from "@/lib/hooks";
import { compact, compactMoney, money, num, pct } from "@/lib/format";
import type { Listing, Platform } from "@/lib/types";
import { cn } from "@/lib/cn";

const STEPS = ["Platform", "Game details", "Valuation", "Review"] as const;

const GENRES: Record<Platform, string[]> = {
  roblox: ["Tower Defense", "Roleplay", "Fighting", "Tycoon", "Escape", "Obby", "Simulator", "Horror"],
  fortnite: ["Movement", "Co-op PvE", "Racing", "Zone Wars", "Party", "Box Fight", "Deathrun", "Survival"],
  minecraft: ["Survival RPG", "Factions MMO", "Parkour", "SMP", "Skyblock", "Minigames", "Prison", "Adventure"],
};

const PALETTES: { name: string; art: [string, string] }[] = [
  { name: "Violet", art: ["#2B1B6B", "#7B4DFF"] },
  { name: "Jade", art: ["#0E2A1C", "#35E07C"] },
  { name: "Ember", art: ["#4A1E05", "#FF8A3D"] },
  { name: "Azure", art: ["#07304A", "#22B8D6"] },
  { name: "Crimson", art: ["#5A0B1E", "#FF4D5E"] },
  { name: "Gold", art: ["#6B4A08", "#FFC44D"] },
];

interface Draft {
  platform: Platform | null;
  title: string;
  genre: string;
  tagline: string;
  description: string;
  players: string;
  trailerUrl: string;
  paletteIndex: number;
  valuation: string;
  pricePerShare: string;
  offeredPct: string;
}

const emptyDraft: Draft = {
  platform: null,
  title: "",
  genre: "",
  tagline: "",
  description: "",
  players: "",
  trailerUrl: "",
  paletteIndex: 0,
  valuation: "2500000",
  pricePerShare: "2.00",
  offeredPct: "18",
};

export function SubmitFlow() {
  const router = useRouter();
  const hydrated = useHydrated();
  const account = useApp((s) => s.account);
  const addListing = useApp((s) => s.addListing);

  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [acknowledged, setAcknowledged] = useState(false);
  const [published, setPublished] = useState<Listing | null>(null);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const maths = useMemo(() => {
    const valuation = Number(draft.valuation) || 0;
    const price = Number(draft.pricePerShare) || 0;
    const offeredPct = Number(draft.offeredPct) || 0;
    const sharesTotal = price > 0 ? Math.round(valuation / price) : 0;
    const sharesOffered = Math.round((sharesTotal * offeredPct) / 100);
    return { valuation, price, offeredPct, sharesTotal, sharesOffered, raise: sharesOffered * price };
  }, [draft.valuation, draft.pricePerShare, draft.offeredPct]);

  function validate(which: number): Record<string, string> {
    const e: Record<string, string> = {};

    if (which === 0 && !draft.platform) e.platform = "Choose the platform your game runs on.";

    if (which === 1) {
      if (draft.title.trim().length < 3) e.title = "Enter at least three characters.";
      if (draft.title.trim().length > 48) e.title = "Keep the title under 48 characters.";
      if (!draft.genre) e.genre = "Select a genre.";
      if (draft.tagline.trim().length < 10) e.tagline = "Give investors one clear line — at least ten characters.";
      if (draft.tagline.trim().length > 90) e.tagline = "Keep the tagline under 90 characters.";
      if (draft.description.trim().length < 120)
        e.description = `Describe the game in at least 120 characters. Currently ${draft.description.trim().length}.`;
      const players = Number(draft.players);
      if (!players || players < 1000) e.players = "Listings require at least 1,000 monthly players.";
      if (players > 80_000_000) e.players = "Enter a realistic monthly player count.";
      if (!/^https?:\/\/.+\..+/.test(draft.trailerUrl.trim()))
        e.trailerUrl = "Enter a full URL, including https://";
    }

    if (which === 2) {
      if (maths.valuation < 50_000) e.valuation = "Minimum listing valuation is $50,000.";
      if (maths.valuation > 50_000_000) e.valuation = "Maximum listing valuation is $50,000,000.";
      if (maths.price < 0.1) e.pricePerShare = "Minimum share price is $0.10.";
      if (maths.price > 100) e.pricePerShare = "Maximum share price is $100.00.";
      if (maths.offeredPct < 5) e.offeredPct = "Offer at least 5% of the company.";
      if (maths.offeredPct > 49) e.offeredPct = "You must retain a majority — offer at most 49%.";
    }

    if (which === 3 && !acknowledged) e.acknowledged = "Confirm the figures before publishing.";

    return e;
  }

  function next() {
    const e = validate(step);
    setErrors(e);
    if (Object.keys(e).length) return;
    setStep((s) => Math.min(STEPS.length, s + 1));
  }

  function publish() {
    const e = validate(3);
    setErrors(e);
    if (Object.keys(e).length || !draft.platform) return;

    const listing: Listing = {
      id: `listing-${Date.now().toString(36)}`,
      platform: draft.platform,
      title: draft.title.trim(),
      genre: draft.genre,
      tagline: draft.tagline.trim(),
      description: draft.description.trim(),
      players: Number(draft.players),
      trailerUrl: draft.trailerUrl.trim(),
      art: PALETTES[draft.paletteIndex].art,
      valuation: maths.valuation,
      sharesOffered: maths.sharesOffered,
      sharesTotal: maths.sharesTotal,
      pricePerShare: maths.price,
      submittedAt: new Date().toISOString(),
    };

    addListing(listing);
    setPublished(listing);
    setStep(STEPS.length);
  }

  if (hydrated && (!account || account.type !== "developer")) {
    return (
      <Gate
        title={account ? "This is a developer flow" : "Open a developer account"}
        body={
          account
            ? "You are signed in as an investor. Listing a game requires a developer account."
            : "Submitting a listing requires a developer account. It takes under a minute and nothing here is real."
        }
        href="/signup?type=developer"
        cta={account ? "Switch account type" : "Open a developer account"}
      />
    );
  }

  if (published) {
    return <Confirmation listing={published} maths={maths} onView={() => router.push(`/listing/${published.id}`)} />;
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <div aria-hidden className="grid-field pointer-events-none absolute inset-0 opacity-25" />

      <div className="relative mx-auto max-w-[1180px] px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow">List a game</span>
            <h1 className="tight mt-3 text-3xl font-semibold text-paper sm:text-4xl">
              {STEPS[step]}
            </h1>
          </div>
          <span className="num text-[11px] uppercase tracking-[0.14em] text-mute">
            Step {step + 1} of {STEPS.length}
          </span>
        </div>

        <Progress step={step} />

        <div className="mt-10 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              >
                {step === 0 ? <PlatformStep draft={draft} set={set} error={errors.platform} /> : null}
                {step === 1 ? <DetailsStep draft={draft} set={set} errors={errors} /> : null}
                {step === 2 ? <ValuationStep draft={draft} set={set} errors={errors} maths={maths} /> : null}
                {step === 3 ? (
                  <ReviewStep
                    draft={draft}
                    maths={maths}
                    acknowledged={acknowledged}
                    setAcknowledged={setAcknowledged}
                    error={errors.acknowledged}
                    onEdit={setStep}
                  />
                ) : null}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
              <Button
                variant="ghost"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
              >
                Back
              </Button>
              {step < 3 ? (
                <Button onClick={next} size="lg">
                  Continue <ArrowRight />
                </Button>
              ) : (
                <Button onClick={publish} size="lg">
                  Publish listing <ArrowRight />
                </Button>
              )}
            </div>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <LivePreview draft={draft} maths={maths} />
          </aside>
        </div>
      </div>
    </div>
  );
}

function Progress({ step }: { step: number }) {
  return (
    <ol className="mt-8 grid grid-cols-4 gap-2 sm:gap-3">
      {STEPS.map((label, i) => {
        const state = i < step ? "done" : i === step ? "active" : "todo";
        return (
          <li key={label}>
            <div className="h-[3px] w-full overflow-hidden rounded-full bg-line">
              <motion.div
                className="h-full rounded-full bg-signal"
                initial={false}
                animate={{ width: state === "todo" ? "0%" : "100%" }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <div className="mt-2.5 flex items-center gap-1.5">
              <span
                className={cn(
                  "num text-[10px] uppercase tracking-[0.14em]",
                  state === "todo" ? "text-mute" : "text-paper",
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={cn(
                  "hidden truncate text-[11px] sm:block",
                  state === "todo" ? "text-mute" : "text-mute-2",
                )}
              >
                {label}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function PlatformStep({
  draft,
  set,
  error,
}: {
  draft: Draft;
  set: <K extends keyof Draft>(k: K, v: Draft[K]) => void;
  error?: string;
}) {
  return (
    <div>
      <p className="max-w-lg text-sm leading-relaxed text-mute">
        Listings are grouped by platform because the metrics that drive a valuation differ on each
        one. You can list the same studio on more than one platform, but each game is listed
        separately.
      </p>

      <div className="mt-7 space-y-3">
        {platformList.map((p) => {
          const active = draft.platform === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => set("platform", p.id)}
              className={cn(
                "group flex w-full items-center gap-4 rounded-xl border bg-panel px-4 py-4 text-left transition-colors duration-200 sm:px-5",
                active ? "border-signal/50 bg-panel-2" : "border-line hover:border-[#2c3446]",
              )}
            >
              <span
                className="grid size-11 shrink-0 place-items-center rounded-lg border border-line bg-panel-2"
                style={{ color: p.tint }}
              >
                <PlatformIcon platform={p.id} size={20} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-[15px] text-paper">{p.label}</span>
                <span className="mt-1 block text-[12px] leading-relaxed text-mute">{p.blurb}</span>
              </span>

              <span className="hidden shrink-0 text-right sm:block">
                <span className="eyebrow block text-[9px]">Avg valuation</span>
                <span className="num mt-1 block text-[13px] text-mute-2">
                  {compactMoney(p.avgValuation)}
                </span>
                <span className="num mt-0.5 block text-[10px] text-mute">{p.listedGames} listed</span>
              </span>

              <span
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-full border transition-colors",
                  active ? "border-signal bg-signal" : "border-line",
                )}
              >
                {active ? (
                  <svg viewBox="0 0 10 10" width="9" height="9" aria-hidden>
                    <path d="M1.5 5.2 4 7.5 8.5 2.8" fill="none" stroke="#050608" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>

      {error ? <p className="mt-3 text-xs text-loss">{error}</p> : null}
    </div>
  );
}

function DetailsStep({
  draft,
  set,
  errors,
}: {
  draft: Draft;
  set: <K extends keyof Draft>(k: K, v: Draft[K]) => void;
  errors: Record<string, string>;
}) {
  const genres = draft.platform ? GENRES[draft.platform] : [];

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-[1.5fr_1fr]">
        <Field label="Game title" required error={errors.title} counter={`${draft.title.length}/48`}>
          <Input
            value={draft.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Tower Siege Legends"
            maxLength={48}
          />
        </Field>

        <Field label="Genre" required error={errors.genre}>
          <Select value={draft.genre} onChange={(e) => set("genre", e.target.value)}>
            <option value="">Select a genre</option>
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field
        label="Tagline"
        required
        error={errors.tagline}
        counter={`${draft.tagline.length}/90`}
        hint="One line, shown under the title on your listing and in the market grid."
      >
        <Input
          value={draft.tagline}
          onChange={(e) => set("tagline", e.target.value)}
          placeholder="Co-operative lane defence with a 40-tier seasonal ladder."
          maxLength={90}
        />
      </Field>

      <Field
        label="Description"
        required
        error={errors.description}
        counter={`${draft.description.length} chars`}
        hint="Write for investors, not players. Separate paragraphs with a blank line."
      >
        <Textarea
          value={draft.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="What the game is, how it makes money, and what the last twelve months have looked like."
          className="min-h-44"
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Monthly active players"
          required
          error={errors.players}
          hint="Platform-reported figure for the last 30 days."
        >
          <Input
            type="number"
            value={draft.players}
            onChange={(e) => set("players", e.target.value)}
            placeholder="2840000"
            mono
            min={0}
          />
        </Field>

        <Field label="Trailer URL" required error={errors.trailerUrl} hint="YouTube, Vimeo or a direct link.">
          <Input
            value={draft.trailerUrl}
            onChange={(e) => set("trailerUrl", e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            inputMode="url"
          />
        </Field>
      </div>

      <Field
        label="Cover art"
        hint="Uploads are disabled in this demo. Pick a palette and the cover is generated from your title."
      >
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
          {PALETTES.map((p, i) => (
            <button
              key={p.name}
              type="button"
              onClick={() => set("paletteIndex", i)}
              className={cn(
                "overflow-hidden rounded-lg border transition-colors",
                draft.paletteIndex === i ? "border-signal" : "border-line hover:border-[#2c3446]",
              )}
              aria-label={`${p.name} cover`}
            >
              <span className="block h-12">
                <GameArt seed={`${draft.title || "cover"}-${p.name}`} colors={p.art} detail={4} />
              </span>
              <span className="num block bg-panel-2 py-1 text-center text-[9px] uppercase tracking-[0.12em] text-mute">
                {p.name}
              </span>
            </button>
          ))}
        </div>
      </Field>
    </div>
  );
}

function ValuationStep({
  draft,
  set,
  errors,
  maths,
}: {
  draft: Draft;
  set: <K extends keyof Draft>(k: K, v: Draft[K]) => void;
  errors: Record<string, string>;
  maths: { sharesTotal: number; sharesOffered: number; raise: number; offeredPct: number; price: number };
}) {
  return (
    <div className="space-y-5">
      <p className="max-w-lg text-sm leading-relaxed text-mute">
        You set the company value and the share price. Everything else is arithmetic, and it is
        shown to investors exactly as it is shown to you here.
      </p>

      <Field
        label="Total company value"
        required
        error={errors.valuation}
        hint="What the whole studio asset is worth. Between $50,000 and $50,000,000."
      >
        <InputAffix prefix="$">
          <Input
            type="number"
            value={draft.valuation}
            onChange={(e) => set("valuation", e.target.value)}
            className="pl-8"
            mono
            min={0}
            step={10000}
          />
        </InputAffix>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Price per share" required error={errors.pricePerShare} hint="$0.10 to $100.00.">
          <InputAffix prefix="$">
            <Input
              type="number"
              value={draft.pricePerShare}
              onChange={(e) => set("pricePerShare", e.target.value)}
              className="pl-8"
              mono
              step={0.1}
              min={0}
            />
          </InputAffix>
        </Field>

        <Field label="Share of company offered" required error={errors.offeredPct} hint="5% to 49%.">
          <InputAffix suffix="%">
            <Input
              type="number"
              value={draft.offeredPct}
              onChange={(e) => set("offeredPct", e.target.value)}
              className="pr-10"
              mono
              step={1}
              min={0}
            />
          </InputAffix>
        </Field>
      </div>

      <div className="rounded-xl border border-line bg-panel p-5">
        <h4 className="eyebrow">Calculated offering</h4>
        <dl className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-4">
          <Calc label="Shares outstanding" value={num(maths.sharesTotal)} />
          <Calc label="Shares offered" value={num(maths.sharesOffered)} />
          <Calc label="You retain" value={pct(100 - maths.offeredPct, 0)} />
          <Calc label="Raise at full placement" value={money(maths.raise, 0)} accent />
        </dl>
        <p className="mt-4 border-t border-line-soft pt-3 text-[12px] leading-relaxed text-mute">
          Shares outstanding is your company value divided by the share price. Investors see the
          same figure, so a low share price means a large share count.
        </p>
      </div>
    </div>
  );
}

function Calc({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <dt className="eyebrow text-[9px]">{label}</dt>
      <dd className={cn("num mt-1.5 text-[15px]", accent ? "text-signal" : "text-paper")}>{value}</dd>
    </div>
  );
}

function ReviewStep({
  draft,
  maths,
  acknowledged,
  setAcknowledged,
  error,
  onEdit,
}: {
  draft: Draft;
  maths: { sharesTotal: number; sharesOffered: number; raise: number; offeredPct: number };
  acknowledged: boolean;
  setAcknowledged: (v: boolean) => void;
  error?: string;
  onEdit: (step: number) => void;
}) {
  const rows: { section: string; step: number; items: [string, string][] }[] = [
    {
      section: "Platform",
      step: 0,
      items: [["Platform", draft.platform ? platformList.find((p) => p.id === draft.platform)!.label : "—"]],
    },
    {
      section: "Game details",
      step: 1,
      items: [
        ["Title", draft.title],
        ["Genre", draft.genre],
        ["Tagline", draft.tagline],
        ["Monthly players", compact(Number(draft.players) || 0)],
        ["Trailer", draft.trailerUrl],
      ],
    },
    {
      section: "Valuation",
      step: 2,
      items: [
        ["Company value", money(Number(draft.valuation) || 0, 0)],
        ["Price per share", money(Number(draft.pricePerShare) || 0)],
        ["Shares outstanding", num(maths.sharesTotal)],
        ["Shares offered", `${num(maths.sharesOffered)} (${pct(maths.offeredPct, 0)})`],
        ["Raise at full placement", money(maths.raise, 0)],
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {rows.map((r) => (
        <Panel key={r.section}>
          <div className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-5">
            <h3 className="eyebrow">{r.section}</h3>
            <button
              onClick={() => onEdit(r.step)}
              className="num text-[11px] uppercase tracking-[0.12em] text-mute transition-colors hover:text-signal"
            >
              Edit
            </button>
          </div>
          <dl className="divide-y divide-line-soft">
            {r.items.map(([k, v]) => (
              <div key={k} className="flex items-start justify-between gap-6 px-4 py-2.5 sm:px-5">
                <dt className="shrink-0 text-[12px] text-mute">{k}</dt>
                <dd className="num min-w-0 truncate text-right text-[12px] text-paper">{v || "—"}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      ))}

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-panel p-4">
        <input
          type="checkbox"
          checked={acknowledged}
          onChange={(e) => setAcknowledged(e.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-[#3df2a7]"
        />
        <span className="text-[12px] leading-relaxed text-mute">
          I confirm the figures above are the ones I want published. This is a demo environment —
          no shares are issued, no money changes hands, and nothing is filed with anyone.
        </span>
      </label>
      {error ? <p className="text-xs text-loss">{error}</p> : null}
    </div>
  );
}

function LivePreview({
  draft,
  maths,
}: {
  draft: Draft;
  maths: { sharesTotal: number; sharesOffered: number; raise: number; price: number };
}) {
  return (
    <Panel className="overflow-hidden">
      <div className="border-b border-line px-4 py-3">
        <h3 className="eyebrow">Live preview</h3>
      </div>

      <div className="relative h-28">
        <GameArt
          seed={draft.title || "preview"}
          colors={PALETTES[draft.paletteIndex].art}
          detail={6}
        />
        {draft.platform ? (
          <span
            className="absolute left-3 top-3 grid size-7 place-items-center rounded border border-white/15 bg-black/40 backdrop-blur"
            style={{ color: platformList.find((p) => p.id === draft.platform)!.tint }}
          >
            <PlatformIcon platform={draft.platform} size={14} />
          </span>
        ) : null}
      </div>

      <div className="p-4">
        <h4 className="display text-[15px] leading-snug text-paper">
          {draft.title || "Your game title"}
        </h4>
        <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-mute">
          {draft.tagline || "Your one-line pitch appears here."}
        </p>

        <dl className="mt-4 space-y-2.5 border-t border-line-soft pt-4">
          <PreviewRow label="Share price" value={maths.price > 0 ? money(maths.price) : "—"} strong />
          <PreviewRow label="Valuation" value={compactMoney(Number(draft.valuation) || 0)} />
          <PreviewRow label="Shares offered" value={num(maths.sharesOffered)} />
          <PreviewRow label="Raise" value={money(maths.raise, 0)} />
          <PreviewRow label="Players" value={compact(Number(draft.players) || 0)} />
        </dl>
      </div>
    </Panel>
  );
}

function PreviewRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-[11px] text-mute">{label}</dt>
      <dd className={cn("num text-[12px]", strong ? "text-paper" : "text-mute-2")}>{value}</dd>
    </div>
  );
}

function Confirmation({
  listing,
  maths,
  onView,
}: {
  listing: Listing;
  maths: { sharesTotal: number; sharesOffered: number; raise: number };
  onView: () => void;
}) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <div aria-hidden className="grid-field pointer-events-none absolute inset-0 opacity-25" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(46% 40% at 50% 6%, rgba(61,242,167,0.14) 0%, transparent 70%)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto max-w-xl px-4 py-16 text-center sm:py-24"
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto grid size-14 place-items-center rounded-2xl border border-signal/30 bg-signal/10"
        >
          <svg viewBox="0 0 20 20" width="22" height="22" aria-hidden>
            <path d="M4 10.5 8 14.5 16 5.5" fill="none" stroke="#3df2a7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>

        <h1 className="tight mt-8 text-3xl font-semibold text-paper sm:text-4xl">
          {listing.title} is live.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-mute">
          Your listing is published and the offering is open. Investors can now read the filing and
          place orders against the shares you offered.
        </p>

        <dl className="mt-10 grid grid-cols-3 gap-4 rounded-xl border border-line bg-panel px-5 py-5">
          <div>
            <dt className="eyebrow text-[9px]">Share price</dt>
            <dd className="num mt-1.5 text-[15px] text-paper">{money(listing.pricePerShare)}</dd>
          </div>
          <div>
            <dt className="eyebrow text-[9px]">Shares offered</dt>
            <dd className="num mt-1.5 text-[15px] text-paper">{num(maths.sharesOffered)}</dd>
          </div>
          <div>
            <dt className="eyebrow text-[9px]">Raise</dt>
            <dd className="num mt-1.5 text-[15px] text-signal">{money(maths.raise, 0)}</dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button size="lg" onClick={onView}>
            View your listing <ArrowRight />
          </Button>
          <ButtonLink href="/developer" size="lg" variant="outline">
            Studio dashboard
          </ButtonLink>
        </div>
      </motion.div>
    </div>
  );
}

function Gate({
  title,
  body,
  href,
  cta,
}: {
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="tight text-2xl font-semibold text-paper sm:text-3xl">{title}</h1>
      <p className="mt-4 text-sm leading-relaxed text-mute">{body}</p>
      <ButtonLink href={href} size="lg" className="mt-8">
        {cta} <ArrowRight />
      </ButtonLink>
    </div>
  );
}
