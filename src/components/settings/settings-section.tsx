import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Shared settings primitives (Master-detail standard):
 * a bordered section with a compact header and divided rows.
 * Use semantic theme tokens only so light/dark stay consistent.
 */
export function SettingsSection({
  title,
  description,
  actions,
  footer,
  tone = "default",
  flush = false,
  className,
  children
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  tone?: "default" | "danger";
  /** Render children without the divided-row wrapper (for complex editors). */
  flush?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const isDanger = tone === "danger";
  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border bg-theme-panel",
        isDanger ? "border-theme-danger-border" : "border-theme-border",
        className
      )}
    >
      <header
        className={cn(
          "flex flex-col gap-2 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
          isDanger ? "border-theme-danger-border bg-theme-danger-surface" : "border-theme-border"
        )}
      >
        <div className="min-w-0">
          <h2 className={cn("text-sm font-semibold", isDanger ? "text-theme-danger" : "text-theme-foreground")}>
            {title}
          </h2>
          {description ? <p className="mt-0.5 text-xs leading-5 text-theme-muted">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </header>

      {children ? (
        flush ? (
          <div className="p-4">{children}</div>
        ) : (
          <div className="divide-y divide-theme-border">{children}</div>
        )
      ) : null}

      {footer ? (
        <footer className="flex items-center justify-end gap-2 border-t border-theme-border bg-theme-paper/40 px-4 py-2.5">
          {footer}
        </footer>
      ) : null}
    </section>
  );
}

export function SettingsRow({
  label,
  description,
  htmlFor,
  stacked = false,
  className,
  children
}: {
  label: ReactNode;
  description?: ReactNode;
  htmlFor?: string;
  /** Put the control under the label (for wide controls like textareas). */
  stacked?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 px-4 py-3",
        !stacked && "sm:flex-row sm:items-center sm:justify-between sm:gap-6",
        className
      )}
    >
      <div className="min-w-0 sm:max-w-sm">
        <label htmlFor={htmlFor} className="block text-sm font-medium text-theme-foreground">
          {label}
        </label>
        {description ? <p className="mt-0.5 text-xs leading-5 text-theme-muted">{description}</p> : null}
      </div>
      {children ? (
        <div className={cn("min-w-0", stacked ? "w-full" : "sm:flex sm:shrink-0 sm:justify-end")}>{children}</div>
      ) : null}
    </div>
  );
}

/** Accessible on/off switch used by settings rows. */
export function SettingsSwitch({
  checked,
  disabled,
  label,
  onToggle
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      aria-checked={checked}
      aria-label={label}
      className={cn(
        "relative h-5 w-9 shrink-0 cursor-pointer rounded-full border border-theme-border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-accent disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-theme-accent" : "bg-theme-paper"
      )}
      disabled={disabled}
      role="switch"
      type="button"
      onClick={onToggle}
    >
      <span
        className={cn(
          "absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow transition-all",
          checked ? "left-[18px]" : "left-0.5"
        )}
      />
    </button>
  );
}
