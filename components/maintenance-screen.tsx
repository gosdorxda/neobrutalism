export function MaintenanceScreen({
  message,
}: {
  message?: string;
}) {
  const text = message?.trim() || "We're upgrading to serve more cats. Back soon.";
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl sm:text-4xl font-heading text-foreground mb-3">
          We&apos;ll be right back
        </h1>
        <p className="text-base font-base text-foreground/60 leading-relaxed">
          {text}
        </p>
      </div>
    </div>
  );
}
