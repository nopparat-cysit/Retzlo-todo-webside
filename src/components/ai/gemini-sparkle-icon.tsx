"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

interface GeminiSparkleIconProps {
  className?: string;
}

export function GeminiSparkleIcon({ className }: GeminiSparkleIconProps) {
  const id = useId();
  const gradientId = `gemini-rainbow-${id.replace(/:/g, "")}`;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-5 w-5 shrink-0 transition-transform duration-200", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="25%" stopColor="#818cf8" />
          <stop offset="50%" stopColor="#c084fc" />
          <stop offset="75%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
      {/* Primary Gemini Astroid Sparkle */}
      <path
        d="M10 2C10 6.97 6.47 11 1.5 11C6.47 11 10 15.03 10 20C10 15.03 13.53 11 18.5 11C13.53 11 10 6.97 10 2Z"
        fill={`url(#${gradientId})`}
      />
      {/* Companion Sparkle (Top-Right) */}
      <path
        d="M18 1.5C18 3.43 16.43 5 14.5 5C16.43 5 18 6.57 18 8.5C18 6.57 19.57 5 21.5 5C19.29 6.5 17.5 4.71 17.5 2.5Z"
        fill={`url(#${gradientId})`}
      />
      {/* Accent Sparkle (Bottom-Right) */}
      <path
        d="M18 14.5C18 15.6 17.1 16.5 16 16.5C17.1 16.5 18 17.4 18 18.5C18 17.4 18.9 16.5 20 16.5C18.9 16.5 18 15.6 18 14.5Z"
        fill={`url(#${gradientId})`}
      />
    </svg>
  );
}
