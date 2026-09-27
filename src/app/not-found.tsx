import { ButtonLink, ArrowRight } from "@/components/ui/Button";
import { LogoMark } from "@/components/logo/LogoMark";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-28 text-center">
      <LogoMark size={40} className="text-paper/70" />
      <h1 className="tight mt-8 text-3xl font-semibold text-paper">No listing here</h1>
      <p className="mt-4 text-sm leading-relaxed text-mute">
        That page does not exist. The market page has every listing currently trading.
      </p>
      <ButtonLink href="/market" size="lg" className="mt-8">
        Go to the market <ArrowRight />
      </ButtonLink>
    </div>
  );
}
