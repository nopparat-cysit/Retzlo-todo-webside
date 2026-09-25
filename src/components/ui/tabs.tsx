"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef } from "react";

import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = forwardRef<
  ElementRef<typeof TabsPrimitive.List>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center gap-1 rounded-lg border border-stone-200/90 bg-stone-100/90 p-1 text-stone-600 dark:border-white/10 dark:bg-white/[0.045] dark:text-stone-400",
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = forwardRef<
  ElementRef<typeof TabsPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex h-8 items-center justify-center whitespace-nowrap rounded-md px-3 text-sm font-medium text-stone-600 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dusk-lavender/55 disabled:pointer-events-none disabled:opacity-50 hover:text-stone-900 data-[state=active]:bg-white data-[state=active]:text-stone-900 data-[state=active]:shadow-xs data-[state=active]:font-semibold dark:text-stone-400 dark:hover:text-stone-200 dark:data-[state=active]:bg-dusk-lavender/20 dark:data-[state=active]:text-stone-100",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = forwardRef<
  ElementRef<typeof TabsPrimitive.Content>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn("mt-3 outline-none focus-visible:ring-2 focus-visible:ring-dusk-lavender/55", className)}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsContent, TabsList, TabsTrigger };
