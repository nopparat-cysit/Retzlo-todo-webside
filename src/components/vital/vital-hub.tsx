"use client";

import { Dumbbell, Apple, Heart, TrendingUp, Droplet } from "lucide-react";
import { useEffect, useState } from "react";

import { formatMediumDate } from "@/lib/date-format";
import { VitalPanel } from "./vital-panel";

export function VitalHub() {
  const [todayLabel, setTodayLabel] = useState("Today");
  const [testAccount, setTestAccount] = useState("losstary");

  useEffect(() => {
    setTodayLabel(formatMediumDate(new Date()));
  }, []);

  return (
    <div className="min-h-screen bg-[#090817] p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-dusk-lavender to-dusk-rose p-3">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-semibold text-[#f5efe6]">Vital Hub</h1>
                <p className="text-[#f5efe6]/60">Your calm body archive • Test Account: {testAccount}</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-dusk-lavender">Today</div>
            <div className="text-2xl font-medium text-[#f5efe6]">{todayLabel}</div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Main Stats */}
          <div className="lg:col-span-8 space-y-6">
            <VitalPanel title="Today's Energy" icon={<Apple className="h-5 w-5" />}>
              <div className="text-6xl font-light text-[#f5efe6]">1842</div>
              <div className="text-dusk-lavender">kcal · 67% of daily target</div>
            </VitalPanel>

            <div className="grid grid-cols-2 gap-6">
              <VitalPanel title="Current Weight" icon={<TrendingUp className="h-5 w-5" />}>
                <div className="text-5xl font-light text-[#f5efe6]">68.4</div>
                <div className="text-emerald-400 text-sm">Down 0.8kg this week</div>
              </VitalPanel>

              <VitalPanel title="Water Intake" icon={<Droplet className="h-5 w-5" />}>
                <div className="text-5xl font-light text-[#f5efe6]">1.8L</div>
                <div className="text-sky-400 text-sm">of 3.0L goal</div>
              </VitalPanel>
            </div>
          </div>

          {/* Side Panel */}
          <div className="lg:col-span-4">
            <VitalPanel title="Today's Movement" icon={<Dumbbell className="h-5 w-5" />} className="h-full">
              <div className="space-y-6">
                <div>
                  <div className="text-sm text-[#f5efe6]/60 mb-1">Push · Pull · Legs</div>
                  <div className="h-2.5 rounded-full bg-white/10">
                    <div className="h-2.5 w-[65%] rounded-full bg-gradient-to-r from-dusk-lavender to-dusk-rose"></div>
                  </div>
                </div>
                <div className="text-xs text-[#f5efe6]/50 leading-relaxed">
                  45 min strength training<br />
                  8,240 steps · 412 kcal burned
                </div>
              </div>
            </VitalPanel>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-[#f5efe6]/30">
          Vital Hub · Phase 1 - More features coming soon • Test Account: losstary added
        </div>
      </div>
    </div>
  );
}
