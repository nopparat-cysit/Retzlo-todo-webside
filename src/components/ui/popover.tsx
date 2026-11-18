"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef } from "react";

import { cn } from "@/lib/utils";

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverContent = forwardRef<
  ElementRef<typeof PopoverPrimitive.Content>,
  ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & { forceMount?: true }
>(({ className, align = "center", sideOffset = 8, collisionPadding = 12, forceMount, ...props }, ref) => (
  <PopoverPrimitive.Portal forceMount={forceMount}>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      forceMount={forceMount}
      className={cn(
        "motion-floating-in z-[740] w-72 rounded-xl border border-theme-border bg-theme-popover p-4 text-theme-foreground shadow-[0_18px_48px_-6px_rgba(41,37,36,0.16)] outline-none backdrop-blur-xl dark:shadow-[0_18px_48px_rgba(0,0,0,0.45)]",
        forceMount && "data-[state=closed]:hidden",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger };
