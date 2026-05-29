import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="landing-page min-h-screen overflow-hidden">
      <section className="relative mx-auto grid min-h-screen w-full max-w-7xl items-center gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:py-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-dusk-lavender/60 to-transparent" />

        <div className="relative z-10 max-w-2xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-dusk-lavender/20 bg-white/[0.04] px-3 py-2 text-xs uppercase tracking-[0.28em] text-dusk-amber shadow-glow">
            <Sparkles className="h-3.5 w-3.5 text-dusk-lavender" />
            Retro Lofi Workspace
          </div>

          <div className="space-y-5">
            <h1 className="landing-title text-6xl font-semibold text-stone-100 sm:text-7xl lg:text-8xl">
              RETROD
            </h1>
            <p className="max-w-xl text-lg leading-8 text-stone-300 sm:text-xl">
              A calm command center for projects, notes, due dates, and the late-night work you keep returning to.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/projects">
              <Button className="landing-cta">
                Enter workspace
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="ghost">Create account</Button>
            </Link>
          </div>

          <div className="mt-10 grid max-w-xl gap-3 sm:grid-cols-3">
            {[
              ["Boards", "Kanban work"],
              ["Calendar", "Due dates"],
              ["Notes", "Memory lane"]
            ].map(([title, detail]) => (
              <div key={title} className="landing-stat rounded-md border border-white/10 bg-white/[0.04] p-3">
                <p className="text-sm font-semibold text-stone-100">{title}</p>
                <p className="mt-1 text-xs text-stone-500">{detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-[520px] lg:min-h-[680px]">
          <div className="landing-logo-stage absolute inset-0 grid place-items-center">
            <div className="landing-logo-orbit" />
            <Image
              priority
              alt="RETROD 3D logo"
              className="landing-logo-image"
              height={900}
              src="/brand/retrod-logo-transparent.png"
              width={900}
            />
          </div>
          <div className="landing-logo-caption absolute bottom-4 left-1/2 w-[min(88vw,500px)] -translate-x-1/2 rounded-lg border border-dusk-lavender/20 bg-ink-950/55 p-4 text-center shadow-glow backdrop-blur-xl lg:bottom-10">
            <p className="text-xs uppercase tracking-[0.35em] text-dusk-amber">RETROD SYSTEM MARK</p>
            <p className="mt-2 text-sm text-stone-400">Boards, notes, and dates orbiting one quiet workspace.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
