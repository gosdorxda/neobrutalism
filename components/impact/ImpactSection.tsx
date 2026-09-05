import { ImpactDialog } from "./ImpactDialog";

export function ImpactSection() {
  return (
    <section className="w-full bg-gradient-to-b from-background to-secondary-background py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-10 sm:mb-12">
          <h2 className="text-3xl font-heading text-foreground mb-3">
            See Your Impact
          </h2>
          <p className="text-base font-base text-foreground/60 max-w-xl mx-auto">
            Enter your Solana wallet address and see how many street cats your
            trades have helped feed. Every swap fills a bowl.
          </p>
        </div>
        <ImpactDialog />
      </div>
    </section>
  );
}
