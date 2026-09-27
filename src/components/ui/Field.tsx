import { cn } from "@/lib/cn";

const control =
  "w-full rounded-lg border border-line bg-panel-2 px-3.5 text-paper outline-none transition-colors duration-150 focus:border-signal/60 focus:ring-1 focus:ring-signal/25";

export function Field({
  label,
  hint,
  error,
  children,
  className,
  required,
  counter,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
  counter?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="eyebrow">
          {label}
          {required ? <span className="ml-1 text-signal">*</span> : null}
        </span>
        {counter ? <span className="num text-[10px] text-mute">{counter}</span> : null}
      </div>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-loss">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs leading-relaxed text-mute">{hint}</p>
      ) : null}
    </label>
  );
}

export function Input({
  className,
  invalid,
  mono,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean; mono?: boolean }) {
  return (
    <input
      className={cn(control, "h-11 text-sm", mono && "num", invalid && "border-loss/60", className)}
      {...rest}
    />
  );
}

export function Textarea({
  className,
  invalid,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      className={cn(control, "min-h-32 resize-y py-3 text-sm leading-relaxed", invalid && "border-loss/60", className)}
      {...rest}
    />
  );
}

export function Select({
  className,
  invalid,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <div className="relative">
      <select
        className={cn(control, "h-11 appearance-none pr-10 text-sm", invalid && "border-loss/60", className)}
        {...rest}
      >
        {children}
      </select>
      <svg
        viewBox="0 0 12 12"
        width="11"
        height="11"
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-mute"
        aria-hidden
      >
        <path d="M2 4.5 6 8.5 10 4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function InputAffix({
  prefix,
  suffix,
  children,
}: {
  prefix?: string;
  suffix?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      {prefix ? (
        <span className="num pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-mute">
          {prefix}
        </span>
      ) : null}
      {children}
      {suffix ? (
        <span className="num pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs uppercase tracking-widest text-mute">
          {suffix}
        </span>
      ) : null}
    </div>
  );
}
