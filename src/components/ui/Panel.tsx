import { cn } from "@/lib/cn";

export function Panel({
  className,
  children,
  sheen = false,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { sheen?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-line bg-panel",
        sheen && "panel-sheen",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function PanelHeader({
  title,
  action,
  className,
}: {
  title: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 border-b border-line px-4 py-3 sm:px-5",
        className,
      )}
    >
      <h3 className="eyebrow">{title}</h3>
      {action}
    </div>
  );
}

export function Stat({
  label,
  value,
  sub,
  className,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="eyebrow truncate">{label}</div>
      <div className="num mt-1.5 text-lg tracking-tight text-paper sm:text-xl">{value}</div>
      {sub ? <div className="mt-1 text-xs text-mute">{sub}</div> : null}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-line-soft", className)} />;
}
