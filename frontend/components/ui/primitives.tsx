import type {ReactNode} from "react";

/** Joins class names, dropping falsy entries. */
export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

export function Panel({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title?: string;
  subtitle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cx(
        // Frosted rather than solid, so the sky behind stays faintly readable through the panel
        // and the cards feel like glass held up to the night rather than boxes pasted over it.
        "rounded-3xl border border-edge bg-panel/70 backdrop-blur-xl",
        "shadow-[var(--shadow-panel),var(--inset-edge)]",
        "transition-all duration-300 ease-[var(--ease-out-expo)]",
        "hover:border-edge/100 hover:-translate-y-0.5 hover:shadow-[var(--shadow-panel-hover),var(--inset-edge)]",
        className,
      )}
    >
      {(title || action) && (
        <header className="flex items-start justify-between gap-4 border-b border-divider px-5 py-4">
          <div>
            {title && (
              <h2 className="font-brand text-sm tracking-[0.14em] text-ink uppercase">
                {title}
              </h2>
            )}
            {subtitle && <p className="mt-1 text-xs text-muted">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold tracking-[0.06em] uppercase " +
  "transition-all duration-300 ease-[var(--ease-out-expo)] active:scale-[0.97] " +
  "disabled:cursor-not-allowed disabled:opacity-40 disabled:scale-100";

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: {variant?: "primary" | "ghost" | "quiet"} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants = {
    primary: "bg-ink text-night-900 hover:bg-white hover:shadow-[0_0_16px_rgba(255,255,255,0.12)]",
    ghost: "border border-edge bg-transparent text-ink hover:border-white/20 hover:bg-panel-raised/35",
    quiet: "text-muted hover:text-ink active:scale-100",
  } as const;
  return (
    <button className={cx(buttonBase, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

/** Neutral placeholder shown while a real value is still being read from chain. */
export function Skeleton({className}: {className?: string}) {
  return <span className={cx("inline-block animate-pulse rounded bg-edge/70", className)} />;
}

export function EmptyState({title, hint}: {title: string; hint?: string}) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <div className="h-px w-10 bg-divider" />
      <p className="text-sm text-ink">{title}</p>
      {hint && <p className="max-w-xs text-xs leading-relaxed text-muted">{hint}</p>}
    </div>
  );
}

export function ErrorNote({error, onRetry}: {error: Error; onRetry?: () => void}) {
  return (
    <div className="flex flex-col items-start gap-2 px-5 py-6">
      <p className="text-sm text-ink">Could not read this from the chain.</p>
      <p className="max-w-md text-xs leading-relaxed break-words text-muted">{error.message}</p>
      {onRetry && (
        <Button variant="ghost" className="mt-1 px-3 py-1.5 text-xs" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

/** Up/down direction is carried by the glyph alone — the palette stays grayscale. */
export function DirectionGlyph({direction}: {direction: "in" | "out"}) {
  return (
    <span aria-hidden className="text-neutral-strong">
      {direction === "in" ? "↓" : "↑"}
    </span>
  );
}

export function Divider() {
  return <div className="h-px w-full bg-divider" />;
}
