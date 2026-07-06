import { notFound } from "next/navigation";

import { DesignSystemPreview } from "./design-system-preview";

export const dynamic = "force-dynamic";

const primitiveReference = [
  "@/components/ui/app-modal",
  "@/components/ui/button",
  "@/components/ui/date-time-field",
  "@/components/ui/entity-card",
  "@/components/ui/filter-select",
  "@/components/ui/input",
  "@/components/ui/segmented-control",
  "@/components/ui/select",
  "@/components/ui/state",
  "@/components/ui/toolbar"
];

export default function DesignSystemPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <main className="min-h-screen px-4 py-8 text-stone-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 shadow-[0_18px_54px_rgba(0,0,0,0.22)] backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-dusk-amber">RETROD Product UI</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-100 sm:text-4xl">Design System</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-400">
            Shared primitives, states, cards, filters, modal layers, and Toast feedback for keeping every module in one visual language.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-stone-500">
            {primitiveReference.map((item) => (
              <span key={item} className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1">
                {item.replace("@/components/ui/", "")}
              </span>
            ))}
          </div>
        </header>
        <DesignSystemPreview />
      </div>
    </main>
  );
}
