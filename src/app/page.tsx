import { Hero } from "@/components/landing/Hero";
import { MarketTicker } from "@/components/landing/MarketTicker";
import { AccountSplit } from "@/components/landing/AccountSplit";
import { ModesScroll } from "@/components/landing/ModesScroll";
import { FeaturedListings } from "@/components/landing/FeaturedListings";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink, ArrowRight } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <>
      <Hero />
      <MarketTicker />
      <AccountSplit />
      <ModesScroll />
      <FeaturedListings />

      <section className="mx-auto max-w-[1400px] px-4 pb-24 sm:px-6 lg:px-10">
        <Reveal className="relative overflow-hidden rounded-2xl border border-line bg-panel px-6 py-14 text-center sm:px-10 sm:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: "radial-gradient(50% 70% at 50% 0%, rgba(61,242,167,0.13) 0%, transparent 70%)",
            }}
          />
          <div className="relative">
            <h2 className="tight mx-auto max-w-2xl text-3xl font-semibold leading-[1.06] text-paper sm:text-5xl">
              Pick the side of the table you want to sit on.
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-mute sm:text-[15px]">
              Both account types take under a minute to open. Nothing here is real money, and the
              demo portfolio is funded for you.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink href="/signup?type=investor" size="lg">
                Open an investor account <ArrowRight />
              </ButtonLink>
              <ButtonLink href="/signup?type=developer" size="lg" variant="outline">
                Open a developer account
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
