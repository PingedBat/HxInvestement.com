import { ButtonLink, ArrowRight } from "@/components/ui/Button";

export function AccountGate({ isDeveloper }: { isDeveloper?: boolean }) {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="tight text-2xl font-semibold text-paper sm:text-3xl">
        {isDeveloper ? "This is an investor area" : "Open an investor account"}
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-mute">
        {isDeveloper
          ? "You are signed in as a developer. Portfolios, Vault and Rush are available on investor accounts."
          : "Portfolios, Vault and Rush need an investor account. It opens with a funded demo balance and takes under a minute."}
      </p>
      <ButtonLink href={isDeveloper ? "/developer" : "/signup?type=investor"} size="lg" className="mt-8">
        {isDeveloper ? "Go to studio dashboard" : "Open an investor account"} <ArrowRight />
      </ButtonLink>
    </div>
  );
}
