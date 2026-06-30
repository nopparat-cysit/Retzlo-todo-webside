import type { ReactNode } from "react";

import { BackButton } from "@/components/ui/back-button";

interface AuthSceneProps {
  children: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
}

export function AuthScene({ children, description, eyebrow, title }: AuthSceneProps) {
  return (
    <main className="auth-scene">
      <div className="absolute left-5 top-5 z-20 sm:left-8 sm:top-8">
        <BackButton className="bg-ink-950/45 backdrop-blur-md" />
      </div>
      <div className="auth-stars" aria-hidden="true" />
      <div className="auth-planet" aria-hidden="true">
        <span className="auth-planet-ring auth-planet-ring-back" />
        <span className="auth-planet-core" />
        <span className="auth-planet-ring auth-planet-ring-front" />
      </div>
      <div className="auth-light-line auth-light-line-one" aria-hidden="true" />
      <div className="auth-light-line auth-light-line-two" aria-hidden="true" />
      <div className="auth-light-line auth-light-line-three" aria-hidden="true" />
      <div className="auth-mountain auth-mountain-far" aria-hidden="true" />
      <div className="auth-mountain auth-mountain-mid" aria-hidden="true" />
      <div className="auth-mountain auth-mountain-near" aria-hidden="true" />
      <div className="auth-city" aria-hidden="true" />
      <div className="auth-foreground" aria-hidden="true" />

      {/* Cozy Retro Vinyl for Lofi Nostalgia */}
      <div 
        className="vinyl absolute right-[8%] top-[18%] z-10 hidden lg:block" 
        aria-hidden="true"
        style={{ animation: 'vinyl-spin 45s linear infinite' }}
      >
        <svg width="110" height="110" viewBox="0 0 110 110" className="drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
          {/* Outer groove ring */}
          <circle 
            cx="55" 
            cy="55" 
            r="48" 
            fill="none" 
            stroke="#1a1625" 
            strokeWidth="4" 
          />
          {/* Grooves */}
          <circle 
            cx="55" 
            cy="55" 
            r="42" 
            fill="none" 
            stroke="#2a243f" 
            strokeWidth="2" 
          />
          <circle 
            cx="55" 
            cy="55" 
            r="37" 
            fill="none" 
            stroke="#1a1625" 
            strokeWidth="1.5" 
          />
          <circle 
            cx="55" 
            cy="55" 
            r="29" 
            fill="none" 
            stroke="#2a243f" 
            strokeWidth="3" 
          />
          {/* Center label - warm paper like with indigo accent */}
          <circle 
            cx="55" 
            cy="55" 
            r="18" 
            fill="#f5efe6" 
            fillOpacity="0.12" 
          />
          <circle 
            cx="55" 
            cy="55" 
            r="13" 
            fill="#4a3f75" 
          />
          {/* Label details */}
          <text 
            x="55" 
            y="53" 
            textAnchor="middle" 
            fill="#f5efe6" 
            fontSize="5" 
            fontFamily="monospace" 
            opacity="0.7"
          >
            RETZLO
          </text>
          <circle 
            cx="55" 
            cy="55" 
            r="4" 
            fill="#a9a2ff" 
          />
        </svg>
      </div>

      <section className="auth-card lofi-panel motion-panel-in">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-dusk-amber">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-[#f5efe6] tracking-[-0.02em]">
            {title}
          </h1>
          <p className="mt-2 text-sm text-[#f5efe6]/80 max-w-[260px] mx-auto">
            {description}
          </p>
        </div>
        {children}
      </section>
    </main>
  );
}
