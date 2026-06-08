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

      <section className="auth-card">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-dusk-amber">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-stone-50">{title}</h1>
          <p className="mt-2 text-sm text-stone-300">{description}</p>
        </div>
        {children}
      </section>
    </main>
  );
}
