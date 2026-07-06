import type { ReactNode } from "react";
import { AlertTriangle, Inbox, Loader2 } from "lucide-react";

import { getStateTone } from "@/lib/theme/ui-variants";
import { cn } from "@/lib/utils";

interface StateProps {
  tone?: "empty" | "error" | "warning" | "success" | "info";
  icon?: ReactNode;
  visual?: ReactNode;
  title: string;
  message?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ tone = "empty", icon, visual, title, message, action, className }: StateProps) {
  return (
    <AppState
      tone={tone}
      icon={icon ?? <Inbox className="h-5 w-5" />}
      visual={visual}
      title={title}
      message={message}
      action={action}
      className={className}
    />
  );
}

export function ErrorState({ tone = "error", icon, visual, title, message, action, className }: StateProps) {
  return (
    <AppState
      tone={tone}
      icon={icon ?? <AlertTriangle className="h-5 w-5" />}
      visual={visual}
      title={title}
      message={message}
      action={action}
      className={className}
    />
  );
}

export function LoadingState({ title = "Loading", message, className }: Partial<StateProps>) {
  return <AppState tone="info" icon={<Loader2 className="h-5 w-5 animate-spin" />} title={title} message={message} className={className} />;
}

function AppState({
  tone,
  icon,
  visual,
  title,
  message,
  action,
  className
}: StateProps & { tone: "empty" | "error" | "warning" | "success" | "info"; icon: ReactNode }) {
  const toneClasses = getStateTone(tone);

  return (
    <div data-state-tone={tone} className={cn("rounded-xl border p-5 text-center", toneClasses.panel, className)}>
      {visual ? <div className="mb-4">{visual}</div> : null}
      <div className={cn("mx-auto grid h-10 w-10 place-items-center rounded-lg border border-current/20 bg-current/10", toneClasses.icon)}>
        {icon}
      </div>
      <h3 className={cn("mt-3 text-base font-semibold", toneClasses.title)}>{title}</h3>
      {message ? <p className={cn("mt-1 text-sm leading-6", toneClasses.text)}>{message}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
