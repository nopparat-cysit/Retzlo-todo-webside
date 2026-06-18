import * as React from "react"

import { cn } from "@/lib/utils"
import { LofiPanel } from "./lofi-panel"

function PageShell({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <main
      className={cn("soft-grid-bg min-h-screen w-full px-4 py-8 sm:px-6 lg:px-8", className)}
      {...props}
    />
  )
}

export { LofiPanel as Panel, PageShell }
