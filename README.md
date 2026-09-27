# HXinvestement

A marketplace for equity in user-made games. Developers on Roblox, Fortnite Creative and Minecraft
list a game at a valuation and offer a slice of the company; investors buy shares and either hold
them long-term (**Vault**) or trade them inside a seven-day cycle (**Rush**).

This is a **portfolio/demo build**. Every wallet, price, order and transaction is simulated. There
are no real accounts, no payments, and no connections to any game platform's API.

---

## Running it

```bash
npm install
```

```bash
npm run dev
```

Then open <http://localhost:3000>.

```bash
npm run build && npm start
```

Requires Node 20 or newer (built on Node 24). No environment variables, no database, no services.

---

## Screens

| Route | What it is |
| --- | --- |
| `/` | Landing page — 3D hero mark, pitch, account split, scroll-driven modes section, featured listings |
| `/signup` | Two-step account creation. `?type=investor` / `?type=developer` deep-links the choice |
| `/market` | All listings. Platform filters, search, sort, grid/table views |
| `/game/[slug]` | Public listing page — hero, sticky stats bar, price chart, offering panel with trading, about, media, key metrics, developer profile |
| `/developer` | Studio dashboard — your listings, platform context, comparable listings |
| `/developer/submit` | The four-step submission flow with a live preview panel |
| `/listing/[id]` | The listing page generated from a game *you* submitted |
| `/invest` | Investor portfolio (Vault) — value chart, holdings table, allocation, activity |
| `/invest/rush` | Rush terminal — cycle countdown, live order panel, open positions, weekly leaderboard |
| `/invest/rush/results` | End-of-cycle results screen for the previous week |
| `/learn/vault` | Animated step-by-step explainer for Vault |
| `/learn/rush` | Animated step-by-step explainer for Rush |

Account type genuinely changes the product: the navbar links differ, the trade panel on a listing
refuses developer accounts, and `/invest*` and `/developer*` each gate against the wrong type
rather than rendering an empty shell.

---

## File structure

```
src/
├── app/
│   ├── layout.tsx              Fonts, metadata, navbar + footer shell
│   ├── globals.css             Design tokens (Tailwind v4 @theme), base layer, utilities
│   ├── page.tsx                Landing
│   ├── not-found.tsx
│   ├── signup/                 Account creation
│   ├── market/                 Listing browser
│   ├── game/[slug]/            Public listing page (statically generated per game)
│   ├── listing/[id]/           Listing page for a user-submitted game
│   ├── developer/              Dashboard + submit flow
│   ├── invest/                 Vault portfolio, Rush terminal, Rush results
│   └── learn/                  Vault and Rush explainers
│
├── components/
│   ├── chrome/                 Navbar, Footer
│   ├── logo/                   HX mark — 3D canvas, R3F geometry, flat SVG version
│   ├── ui/                     Panel, Button, Field, PriceChart, Sparkline, CountUp,
│   │                           Delta, Badge, GameArt, PlatformIcon, Reveal
│   ├── landing/                Hero, MarketTicker, AccountSplit, ModesScroll, FeaturedListings
│   ├── market/                 GameCard, MarketBrowser
│   ├── listing/                ListingHero, StatsBar, PriceCard, OfferingPanel,
│   │                           AboutSection, DeveloperCard, UserListingView
│   ├── developer/              SubmitFlow, DeveloperDashboard
│   ├── invest/                 VaultDashboard, RushTerminal, RushResults, ModeSwitch, AccountGate
│   └── learn/                  ModeExplainer, ExplainerScene (R3F)
│
├── data/
│   ├── games.ts                14 listings across three platforms + derived market totals
│   ├── developers.ts           9 studio profiles
│   ├── prices.ts               Deterministic price-series generators
│   └── rush.ts                 Cycle maths, Rush-eligible listings, leaderboard, last results
│
└── lib/
    ├── types.ts                Every shared type
    ├── store.ts                Zustand store (persisted to localStorage)
    ├── portfolio.ts            Holding rows, summaries, portfolio value reconstruction
    ├── format.ts               Currency, compact, percent, date formatters
    ├── rng.ts                  Seeded PRNG (mulberry32 + FNV-1a) and gaussian noise
    ├── platforms.ts            Platform metadata
    ├── listingToGame.ts        Converts a submitted listing into the market's Game shape
    ├── hooks.ts                useHydrated, useCountUp, useInView, useLivePrice, useNow, reduced-motion
    └── cn.ts
```

---

## Decisions I made

**Fourteen listings, not twelve.** Five Roblox, five Fortnite Creative, four Minecraft — enough for
the platform filters to feel populated and for the sort orders to produce genuinely different
rankings.

**All prices are seeded, not random.** Every series comes from a string-seeded PRNG
(`lib/rng.ts`), so the server render and the client render produce identical numbers. Random data
would have caused a hydration mismatch on every chart. The "today" anchor is hard-coded to
2026-09-26 for the same reason.

**Prices are generated backwards from the quoted price.** A walk runs forward, then the whole
series is rescaled so its final point lands exactly on the listed price. That keeps the shape
organic while the endpoint stays consistent with the stats bar, the card, and the order panel.

**Derived figures are computed, never typed twice.** 24h/7d/30d changes, market cap, shares
outstanding and portfolio weights are all calculated from the underlying series and the share
count, so nothing can drift out of sync.

**The accent colour is used sparingly and means something.** Signal green (`#3df2a7`) marks gains
and primary actions only; red is reserved for losses and destructive actions. Rush gets its own
amber (`#ff9f4a`) because it is a different mode with a different risk profile, and the distinction
is worth a colour. Platform tints appear only on platform tags.

**3D is limited to two places.** The hero mark and the mode explainers. Both canvases build their
environment from in-scene `Lightformer`s rather than downloading an HDRI, so the metal reads
correctly with no network fetch and no CDN dependency.

**The logo is built from primitives, not a model file.** Two rounded uprights (the H) and two
rounded diagonals offset in Z (the X), sized so the diagonals overlap into the uprights and the
strokes genuinely weave. It rotates slowly and eases toward the cursor rather than tracking it
directly, so the interaction reads as a nudge.

**Charts are hand-built SVG.** No charting library. Each uses a non-uniform `viewBox` with
`vectorEffect="non-scaling-stroke"` so it scales to any container without distorting line weight;
the hover marker and tooltip are HTML overlays for the same reason. Lines draw in on scroll via
`pathLength`.

**Cover art is generated, not placeholdered.** `GameArt` composes a seeded arrangement of shapes
over each listing's gradient, so every game has distinct, stable artwork and no grey boxes or
`lorem ipsum` appear anywhere.

**The Rush cycle is derived from the real clock.** Boundaries come from a fixed Monday epoch plus
whole weeks, so the countdown is genuinely live. Because that depends on `Date.now()`, the cycle
renders as `--d --h --m` until after mount — it is the one number that cannot be server-rendered
honestly.

**One shared price ticker in the Rush terminal.** Every quote on screen is driven by a single 2s
interval rather than a timer per row, and the walk pulls back toward the listed price so quotes
drift without wandering off.

**Uploads are replaced with a palette picker.** There is no file storage in this build, so the
submission flow asks for a cover palette and generates art from the title. The step says so
directly rather than pretending an upload happened.

**The review step is honest about what it is.** In a real product, a listing would be checked
against platform-reported engagement before the offering opened. Here publishing is immediate, and
the dashboard says as much.

**`prefers-reduced-motion` gets real fallbacks, not just disabled transitions.** The scroll-driven
modes section becomes two static cards; the 3D explainer becomes a static bar diagram of the same
four steps; the ticker stops scrolling and becomes horizontally scrollable; count-ups jump to their
final value; chart draw-ins are skipped.

**State is persisted to `localStorage`.** Your account, balances, holdings, Rush positions and
submitted listings survive a refresh. Components that read persisted state wait for a `useHydrated`
flag before showing real numbers, which is why panels flash a skeleton on first paint.

**The demo portfolio opens funded.** A brand-new account in a real product would start empty; here
it opens with five Vault holdings, two Rush positions and a transaction history, so the portfolio
screens have something to say immediately.

---

## Mocked vs. what a real backend would need

### Simulated in this build

- **Money.** Balances, orders, cost basis and P/L are arithmetic in a client-side store. Nothing
  settles anywhere.
- **Prices.** Generated from seeded walks. There is no order book, no matching, and no other
  participants — buying does not move the price.
- **Accounts.** A display name and a handle in `localStorage`. No email, password, session or
  verification, and the signup screen says so.
- **The share register.** `sharesSold` is static seed data. Your purchases do not decrement it.
- **The Rush leaderboard.** Twelve seeded competitors. Your entry is spliced in and ranked against
  them by return, but they do not trade.
- **Rush settlement.** The countdown is live, but nothing actually settles at the boundary — the
  results screen shows a fixed previous cycle.
- **Screenshots and trailers.** Art is generated from gradients; the trailer field validates URL
  shape and renders as an outbound link, with no player and no verification.
- **Platform stats.** MAU, CCU, retention, revenue and ratings are authored figures, not fetched.

### What a real version would need

- **A database and an API.** Listings, users, holdings, orders and transactions as real records,
  with server-side validation of every order — the current store trusts its own inputs because it
  is the only writer.
- **Authentication and sessions,** plus KYC if shares are real securities.
- **A matching engine,** or at minimum a pricing service: an order book, real fills, partial fills,
  slippage, and a price that actually responds to volume. Price history would be recorded, not
  generated.
- **Platform integrations.** Roblox, Epic and server-query APIs to verify ownership and pull real
  engagement and payout figures, since the whole valuation rests on them.
- **A settlement job.** A scheduled worker that closes each Rush cycle at the boundary, liquidates
  open positions at the closing price, writes results, ranks participants and opens the next cycle.
- **File storage and a CDN** for screenshots and trailers, with moderation.
- **A listing review pipeline.** Submissions would queue for verification against platform data
  before the offering opened.
- **Regulatory work.** Selling equity in a company to the public is a regulated activity in every
  jurisdiction this would operate in. That is the largest gap between this demo and a product, and
  it is not a technical one.

---

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · React Three Fiber + drei · Framer Motion ·
GSAP ScrollTrigger · Zustand

Type: Space Grotesk (display), Inter (body), JetBrains Mono (every figure, price and ticker).

---

**Demo — simulated data, no real money.**
