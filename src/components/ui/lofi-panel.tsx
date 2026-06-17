import * as React from "react"
import { cn } from "@/lib/utils"

interface LofiPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "strong" | "paper"
}

const LofiPanel = React.forwardRef<HTMLDivElement, LofiPanelProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "lofi-panel relative rounded-xl border border-border/60 bg-panel p-6 shadow-panel backdrop-blur-xl transition-all",
          {
            "bg-panel-strong border-border/80 shadow-lg": variant === "strong",
            "bg-paper border-paper-strong/60 shadow-sm": variant === "paper",
          },
          className
        )}
        {...props}
      />
    )
  }
)
LofiPanel.displayName = "LofiPanel"

export { LofiPanel }
