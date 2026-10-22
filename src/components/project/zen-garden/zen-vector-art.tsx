"use client";

import React from "react";
import { cn } from "@/lib/utils";

/* ── 1. Bonsai Pine (บอนไซสนโบราณ) ── */
export function ZenBonsaiPine({
  className = "h-24 w-24",
  stage = 4,
}: {
  className?: string;
  stage?: number;
}) {
  return (
    <div className={cn("relative flex items-center justify-center select-none", className)}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
        aria-label="Bonsai Pine"
      >
        {/* Pot / Ceramic Basin */}
        <ellipse cx="50" cy="85" rx="34" ry="7" className="fill-stone-800/20 dark:fill-black/40 blur-[1px]" />
        <path
          d="M24 78 L27 86 Q50 89 73 86 L76 78 Z"
          className="fill-stone-200 stroke-stone-400 dark:fill-stone-800 dark:stroke-stone-600"
          strokeWidth="1.5"
        />
        <ellipse
          cx="50"
          cy="78"
          rx="26"
          ry="5.5"
          className="fill-stone-100 stroke-stone-400 dark:fill-stone-900 dark:stroke-stone-600"
          strokeWidth="1.5"
        />
        <rect x="30" y="86" width="5" height="2.5" rx="1" className="fill-stone-400 dark:fill-stone-700" />
        <rect x="65" y="86" width="5" height="2.5" rx="1" className="fill-stone-400 dark:fill-stone-700" />
        <ellipse cx="50" cy="77" rx="22" ry="4" className="fill-amber-950/70 dark:fill-amber-950" />
        <ellipse cx="44" cy="76" rx="8" ry="2.5" className="fill-emerald-600/70 dark:fill-emerald-600" />
        <ellipse cx="56" cy="77" rx="7" ry="2" className="fill-emerald-700/80 dark:fill-emerald-700" />

        {/* Growth Stage 1: Seed */}
        {stage === 1 && (
          <ellipse cx="50" cy="75" rx="3.5" ry="2.5" className="fill-amber-700 stroke-amber-900 animate-pulse" strokeWidth="0.8" />
        )}

        {/* Growth Stage 2: Sprout */}
        {stage === 2 && (
          <g className="animate-[wiggle_3s_ease-in-out_infinite] origin-bottom">
            <path d="M50 76 Q51 68 53 62" stroke="#5b3a29" strokeWidth="2" strokeLinecap="round" />
            <path d="M53 62 Q59 59 62 62 Q58 66 53 64" fill="#34d399" stroke="#059669" strokeWidth="0.8" />
            <path d="M52 64 Q46 61 44 65 Q48 68 52 65" fill="#10b981" stroke="#047857" strokeWidth="0.8" />
          </g>
        )}

        {/* Growth Stage 3: Young Sapling */}
        {stage === 3 && (
          <g className="origin-bottom">
            <path d="M50 76 Q48 64 53 54 Q56 46 51 40" stroke="#5b3a29" strokeWidth="3" strokeLinecap="round" />
            <path d="M53 54 Q61 49 68 51" stroke="#5b3a29" strokeWidth="2" strokeLinecap="round" />
            <circle cx="68" cy="51" r="7" className="fill-emerald-500/90 dark:fill-emerald-500" />
            <circle cx="51" cy="40" r="9" className="fill-emerald-600/90 dark:fill-emerald-600" />
          </g>
        )}

        {/* Growth Stages 4 & 5: Mature & Ancient Heritage Bonsai */}
        {stage >= 4 && (
          <g>
            <path
              d="M49 77 C48 68, 41 62, 45 51 C48 43, 56 41, 52 32 C50 26, 44 24, 46 19"
              fill="none"
              stroke="#583c2e"
              strokeWidth={stage === 5 ? "6" : "5"}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M48 72 Q44 63 46 55" stroke="#3d281e" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
            <path d="M47 50 Q52 44 50 36" stroke="#3d281e" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />
            <path d="M44 53 C36 49, 31 52, 26 49" fill="none" stroke="#583c2e" strokeWidth="3" strokeLinecap="round" />
            <path d="M53 42 C62 39, 68 44, 75 40" fill="none" stroke="#583c2e" strokeWidth="3.2" strokeLinecap="round" />
            <path d="M51 31 C56 26, 61 27, 66 23" fill="none" stroke="#583c2e" strokeWidth="2.4" strokeLinecap="round" />

            {/* Left Foliage Cloud */}
            <g className="animate-[pulse_4s_ease-in-out_infinite]">
              <ellipse cx="25" cy="48" rx="12" ry="6" className="fill-emerald-700 dark:fill-emerald-700" />
              <ellipse cx="27" cy="46" rx="9" ry="5" className="fill-emerald-500 dark:fill-emerald-500" />
              <ellipse cx="24" cy="45" rx="7" ry="4" className="fill-emerald-400 dark:fill-emerald-400/90" />
            </g>

            {/* Right Foliage Cloud */}
            <g className="animate-[pulse_5s_ease-in-out_infinite]">
              <ellipse cx="76" cy="39" rx="14" ry="7" className="fill-emerald-700 dark:fill-emerald-700" />
              <ellipse cx="78" cy="37" rx="11" ry="5.5" className="fill-emerald-500 dark:fill-emerald-500" />
              <ellipse cx="75" cy="36" rx="8" ry="4" className="fill-emerald-400 dark:fill-emerald-400/90" />
            </g>

            {/* Crown Peak Foliage Cloud */}
            <g className="animate-[pulse_4.5s_ease-in-out_infinite]">
              <ellipse cx="46" cy="18" rx="15" ry="7" className="fill-emerald-700 dark:fill-emerald-700" />
              <ellipse cx="47" cy="16" rx="12" ry="5.5" className="fill-emerald-500 dark:fill-emerald-500" />
              <ellipse cx="45" cy="15" rx="8" ry="4" className="fill-emerald-300 dark:fill-emerald-400" />
            </g>

            {/* Ancient Aura Sparkles for Stage 5 */}
            {stage === 5 && (
              <g className="animate-spin origin-[50px_45px]" style={{ animationDuration: "20s" }}>
                <circle cx="30" cy="20" r="1.5" className="fill-amber-300 animate-ping" />
                <circle cx="70" cy="18" r="1.5" className="fill-amber-300 animate-ping" style={{ animationDelay: "1s" }} />
                <circle cx="82" cy="50" r="1.2" className="fill-amber-300" />
                <circle cx="18" cy="55" r="1.2" className="fill-amber-300" />
              </g>
            )}
          </g>
        )}
      </svg>
    </div>
  );
}

/* ── 2. Cherry Blossom (ซากุระสมาธิ) ── */
export function ZenSakuraBlossom({ className = "h-24 w-24" }: { className?: string }) {
  return (
    <div className={cn("relative flex items-center justify-center select-none", className)}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
        aria-label="Zen Sakura"
      >
        <ellipse cx="50" cy="85" rx="30" ry="6" className="fill-stone-800/20 dark:fill-black/40 blur-[1px]" />
        <path
          d="M28 80 L31 87 Q50 89 69 87 L72 80 Z"
          className="fill-amber-50 stroke-amber-200 dark:fill-stone-800 dark:stroke-stone-700"
          strokeWidth="1.5"
        />
        <ellipse cx="50" cy="80" rx="22" ry="4.5" className="fill-white stroke-amber-200 dark:fill-stone-900 dark:stroke-stone-700" strokeWidth="1.5" />
        <ellipse cx="50" cy="79.5" rx="18" ry="3.5" className="fill-amber-950/70" />

        {/* Graceful Sakura Branch */}
        <path
          d="M50 80 C48 68, 54 58, 47 48 C41 40, 32 38, 25 32"
          fill="none"
          stroke="#4a3728"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M48 51 C57 44, 65 42, 73 34"
          fill="none"
          stroke="#4a3728"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <path
          d="M60 43 C64 36, 68 31, 75 25"
          fill="none"
          stroke="#4a3728"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M41 44 C38 48, 33 50, 28 53"
          fill="none"
          stroke="#4a3728"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Blossom Flowers */}
        <g transform="translate(24, 31)">
          <circle cx="0" cy="0" r="2.5" className="fill-rose-400" />
          <circle cx="0" cy="-6" r="4.2" className="fill-pink-200/90 dark:fill-pink-300/90" />
          <circle cx="5.7" cy="-1.8" r="4.2" className="fill-pink-200/90 dark:fill-pink-300/90" />
          <circle cx="3.5" cy="4.8" r="4.2" className="fill-pink-200/90 dark:fill-pink-300/90" />
          <circle cx="-3.5" cy="4.8" r="4.2" className="fill-pink-200/90 dark:fill-pink-300/90" />
          <circle cx="-5.7" cy="-1.8" r="4.2" className="fill-pink-200/90 dark:fill-pink-300/90" />
          <circle cx="0" cy="0" r="1.5" className="fill-amber-400" />
        </g>
        <g transform="translate(48, 42)">
          <circle cx="0" cy="-6" r="4.5" className="fill-pink-100 dark:fill-pink-200" />
          <circle cx="5.7" cy="-1.8" r="4.5" className="fill-pink-100 dark:fill-pink-200" />
          <circle cx="3.5" cy="4.8" r="4.5" className="fill-pink-100 dark:fill-pink-200" />
          <circle cx="-3.5" cy="4.8" r="4.5" className="fill-pink-100 dark:fill-pink-200" />
          <circle cx="-5.7" cy="-1.8" r="4.5" className="fill-pink-100 dark:fill-pink-200" />
          <circle cx="0" cy="0" r="2" className="fill-rose-400" />
          <circle cx="0" cy="0" r="1.2" className="fill-amber-300" />
        </g>
        <g transform="translate(74, 33)">
          <circle cx="0" cy="-5" r="4" className="fill-pink-200 dark:fill-pink-300" />
          <circle cx="4.7" cy="-1.5" r="4" className="fill-pink-200 dark:fill-pink-300" />
          <circle cx="2.9" cy="4" r="4" className="fill-pink-200 dark:fill-pink-300" />
          <circle cx="-2.9" cy="4" r="4" className="fill-pink-200 dark:fill-pink-300" />
          <circle cx="-4.7" cy="-1.5" r="4" className="fill-pink-200 dark:fill-pink-300" />
          <circle cx="0" cy="0" r="1.8" className="fill-rose-400" />
        </g>

        {/* Falling Sakura Petals */}
        <g className="animate-[bounce_6s_ease-in-out_infinite]" style={{ animationDuration: "5s" }}>
          <path d="M62 60 C65 58, 68 62, 65 65 C62 68, 60 62, 62 60 Z" className="fill-pink-300/80" />
        </g>
        <g className="animate-[bounce_7s_ease-in-out_infinite]" style={{ animationDuration: "7s" }}>
          <path d="M36 68 C39 66, 42 70, 39 73 C36 76, 34 70, 36 68 Z" className="fill-pink-300/80" />
        </g>
      </svg>
    </div>
  );
}

/* ── 3. Zen Bamboo Grove (ไผ่เซนหยั่งราก) ── */
export function ZenBambooGrove({ className = "h-24 w-24" }: { className?: string }) {
  return (
    <div className={cn("relative flex items-center justify-center select-none", className)}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
        aria-label="Zen Bamboo"
      >
        <ellipse cx="50" cy="86" rx="28" ry="6" className="fill-stone-800/20 dark:fill-black/40 blur-[1px]" />
        <path
          d="M30 81 L33 88 Q50 90 67 88 L70 81 Z"
          className="fill-stone-200 stroke-stone-400 dark:fill-stone-800 dark:stroke-stone-600"
          strokeWidth="1.5"
        />
        <ellipse cx="50" cy="81" rx="20" ry="4" className="fill-stone-100 stroke-stone-400 dark:fill-stone-900 dark:stroke-stone-600" strokeWidth="1.5" />
        <ellipse cx="50" cy="80.5" rx="16" ry="3" className="fill-amber-950/70" />

        {/* 3 Stalks of Bamboo */}
        <g className="animate-[wiggle_6s_ease-in-out_infinite] origin-bottom">
          <rect x="36" y="66" width="4.5" height="14" rx="1" className="fill-emerald-600 stroke-emerald-700" strokeWidth="0.8" />
          <rect x="35" y="51" width="4.5" height="14" rx="1" className="fill-emerald-500 stroke-emerald-700" strokeWidth="0.8" />
          <rect x="34" y="36" width="4.5" height="14" rx="1" className="fill-emerald-500 stroke-emerald-700" strokeWidth="0.8" />
          <rect x="33" y="22" width="4" height="13" rx="1" className="fill-emerald-400 stroke-emerald-600" strokeWidth="0.8" />
          <path d="M34 51 Q24 48 18 53 Q26 53 34 52" className="fill-emerald-500" />
          <path d="M34 36 Q22 32 15 38 Q24 38 34 37" className="fill-emerald-400" />
          <path d="M33 22 Q23 15 17 21 Q25 21 33 23" className="fill-emerald-400" />
        </g>
        <g className="animate-[wiggle_7s_ease-in-out_infinite] origin-bottom">
          <rect x="48" y="65" width="5.5" height="15" rx="1" className="fill-teal-700 stroke-teal-800" strokeWidth="0.8" />
          <rect x="48" y="49" width="5.5" height="15" rx="1" className="fill-teal-600 stroke-teal-700" strokeWidth="0.8" />
          <rect x="48" y="33" width="5" height="15" rx="1" className="fill-teal-500 stroke-teal-600" strokeWidth="0.8" />
          <rect x="48.5" y="17" width="4.5" height="15" rx="1" className="fill-emerald-400 stroke-emerald-500" strokeWidth="0.8" />
          <path d="M53 49 Q64 45 72 49 Q63 51 53 50" className="fill-emerald-500" />
          <path d="M48 33 Q38 27 30 31 Q39 33 48 34" className="fill-emerald-400" />
          <path d="M53 33 Q66 28 74 33 Q64 34 53 34" className="fill-emerald-400" />
          <path d="M49 17 Q40 8 32 13 Q41 15 49 18" className="fill-emerald-300" />
          <path d="M53 17 Q63 8 71 14 Q61 15 53 18" className="fill-emerald-300" />
        </g>
        <g className="animate-[wiggle_5.5s_ease-in-out_infinite] origin-bottom">
          <rect x="60" y="67" width="4.5" height="13" rx="1" className="fill-emerald-600 stroke-emerald-700" strokeWidth="0.8" />
          <rect x="61" y="53" width="4.5" height="13" rx="1" className="fill-emerald-500 stroke-emerald-700" strokeWidth="0.8" />
          <rect x="62" y="39" width="4" height="13" rx="1" className="fill-emerald-400 stroke-emerald-600" strokeWidth="0.8" />
          <path d="M65 53 Q76 52 82 58 Q74 57 65 54" className="fill-emerald-500" />
          <path d="M66 39 Q78 36 85 41 Q76 42 66 40" className="fill-emerald-400" />
        </g>
      </svg>
    </div>
  );
}

/* ── 4. Sacred Lotus Basin with Swimming Koi (บัวสวรรค์ & สระน้ำเซน) ── */
export function ZenLotusPond({ className = "h-24 w-24" }: { className?: string }) {
  return (
    <div className={cn("relative flex items-center justify-center select-none", className)}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
        aria-label="Lotus Pond"
      >
        <ellipse cx="50" cy="78" rx="42" ry="14" className="fill-stone-800/20 dark:fill-black/50 blur-[2px]" />
        <ellipse cx="50" cy="72" rx="40" ry="13" className="fill-stone-300 stroke-stone-400 dark:fill-stone-800 dark:stroke-stone-700" strokeWidth="2" />
        <ellipse cx="50" cy="69" rx="36" ry="11" className="fill-sky-800/80 stroke-stone-400 dark:fill-sky-950 dark:stroke-stone-700" strokeWidth="1.5" />
        <ellipse cx="50" cy="69" rx="34" ry="10" className="fill-cyan-400/20 dark:fill-cyan-500/10" />

        {/* Swimming Koi Fish */}
        <g className="animate-[spin_12s_linear_infinite] origin-[50px_69px]">
          <g transform="translate(68, 69) rotate(90)">
            <ellipse cx="0" cy="0" rx="3" ry="7" className="fill-amber-500" />
            <path d="M0 6 L-2 11 L2 11 Z" className="fill-amber-400" />
            <circle cx="-1.5" cy="-4" r="0.8" className="fill-stone-900" />
            <circle cx="1.5" cy="-4" r="0.8" className="fill-stone-900" />
            <ellipse cx="0" cy="-1" rx="1.8" ry="3" className="fill-white/80" />
          </g>
        </g>

        {/* Lily Pad */}
        <g transform="translate(36, 68)">
          <path
            d="M0 0 M-14 0 A14 7 0 1 1 14 0 A14 7 0 0 1 3 6 L0 0 Z"
            className="fill-emerald-600 stroke-emerald-700 dark:fill-emerald-700 dark:stroke-emerald-800"
            strokeWidth="0.8"
          />
        </g>

        {/* Sacred Lotus */}
        <g transform="translate(56, 62)">
          <ellipse cx="-8" cy="0" rx="5" ry="9" className="fill-purple-300 dark:fill-purple-400" transform="rotate(-35 -8 0)" />
          <ellipse cx="8" cy="0" rx="5" ry="9" className="fill-purple-300 dark:fill-purple-400" transform="rotate(35 8 0)" />
          <ellipse cx="-4" cy="-2" rx="4.5" ry="9" className="fill-pink-200 dark:fill-pink-300" transform="rotate(-15 -4 -2)" />
          <ellipse cx="4" cy="-2" rx="4.5" ry="9" className="fill-pink-200 dark:fill-pink-300" transform="rotate(15 4 -2)" />
          <ellipse cx="0" cy="-4" rx="4" ry="10" className="fill-white dark:fill-purple-100" />
          <circle cx="0" cy="0" r="3.2" className="fill-amber-400" />
          <circle cx="0" cy="0" r="1.5" className="fill-amber-600" />
        </g>
      </svg>
    </div>
  );
}

/* ── 5. Golden Ginkgo (แปะก๊วยทองคำ) ── */
export function ZenGoldenGinkgo({ className = "h-24 w-24" }: { className?: string }) {
  return (
    <div className={cn("relative flex items-center justify-center select-none", className)}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
        aria-label="Golden Ginkgo"
      >
        <ellipse cx="50" cy="85" rx="30" ry="6" className="fill-stone-800/20 dark:fill-black/40 blur-[1px]" />
        <path
          d="M28 80 L31 87 Q50 89 69 87 L72 80 Z"
          className="fill-stone-200 stroke-stone-400 dark:fill-stone-800 dark:stroke-stone-700"
          strokeWidth="1.5"
        />
        <ellipse cx="50" cy="80" rx="22" ry="4.5" className="fill-stone-100 stroke-stone-400 dark:fill-stone-900 dark:stroke-stone-700" strokeWidth="1.5" />
        <ellipse cx="50" cy="79.5" rx="18" ry="3.5" className="fill-amber-950/70" />

        <path
          d="M50 80 C50 67, 44 58, 48 48 C51 40, 56 36, 51 26"
          fill="none"
          stroke="#553a2b"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path d="M48 51 C40 46, 32 46, 25 41" fill="none" stroke="#553a2b" strokeWidth="2.8" strokeLinecap="round" />
        <path d="M50 43 C60 38, 68 40, 76 34" fill="none" stroke="#553a2b" strokeWidth="2.8" strokeLinecap="round" />

        {/* Golden Ginkgo Fan Leaves */}
        <g transform="translate(26, 40)">
          <path d="M0 0 C-8 -10, -14 0, -8 8 C-3 4, -1 1, 0 0 Z" className="fill-amber-400 stroke-amber-500" strokeWidth="0.8" />
          <path d="M0 0 C-4 -12, 6 -10, 4 -2 C1 -1, 0 0, 0 0 Z" className="fill-yellow-400 stroke-amber-500" strokeWidth="0.8" />
        </g>
        <g transform="translate(76, 33)">
          <path d="M0 0 C8 -8, 14 2, 7 8 C3 4, 1 1, 0 0 Z" className="fill-yellow-400 stroke-amber-500" strokeWidth="0.8" />
          <path d="M0 0 C4 -12, -6 -10, -4 -2 C-1 -1, 0 0, 0 0 Z" className="fill-amber-400 stroke-amber-500" strokeWidth="0.8" />
        </g>
        <g transform="translate(51, 24)">
          <path d="M0 0 C-10 -12, 10 -12, 0 0 Z" className="fill-yellow-300 stroke-amber-500" strokeWidth="0.8" />
          <path d="M0 0 C-14 -6, -8 8, 0 0 Z" className="fill-amber-400" />
          <path d="M0 0 C14 -6, 8 8, 0 0 Z" className="fill-amber-400" />
          <circle cx="0" cy="-6" r="1.5" className="fill-white" />
        </g>
      </svg>
    </div>
  );
}

/* ── 6. Sprout (ต้นกล้าแรกผลิ) ── */
export function ZenSprout({ className = "h-24 w-24" }: { className?: string }) {
  return (
    <div className={cn("relative flex items-center justify-center select-none", className)}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
        aria-label="Fresh Sprout"
      >
        <ellipse cx="50" cy="85" rx="26" ry="6" className="fill-stone-800/20 dark:fill-black/40 blur-[1px]" />
        <path
          d="M32 80 L35 87 Q50 89 65 87 L68 80 Z"
          className="fill-stone-200 stroke-stone-300 dark:fill-stone-800 dark:stroke-stone-600"
          strokeWidth="1.5"
        />
        <ellipse cx="50" cy="80" rx="18" ry="4" className="fill-stone-100 stroke-stone-300 dark:fill-stone-900 dark:stroke-stone-600" strokeWidth="1.5" />
        <ellipse cx="50" cy="79.5" rx="14" ry="3" className="fill-amber-950/80" />
        <ellipse cx="47" cy="79" rx="6" ry="1.8" className="fill-emerald-600/60" />

        {/* Tender Green Sprout Stalk & Leaves */}
        <g className="animate-[wiggle_4s_ease-in-out_infinite] origin-bottom">
          <path d="M50 79 Q49 68 51 55" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
          {/* Left Leaf */}
          <path d="M50 63 Q38 56 38 66 Q44 70 50 65" className="fill-emerald-400 stroke-emerald-600" strokeWidth="0.8" />
          {/* Right Leaf */}
          <path d="M51 58 Q64 50 64 61 Q58 66 51 60" className="fill-emerald-500 stroke-emerald-700" strokeWidth="0.8" />
          {/* Dewdrop on leaf tip */}
          <circle cx="38" cy="66" r="1.5" className="fill-sky-300 stroke-sky-500 animate-pulse" strokeWidth="0.5" />
        </g>
      </svg>
    </div>
  );
}

/* ── 7. Golden Aloe Succulent (ว่านหางจระเข้ทอง) ── */
export function ZenAloeSucculent({ className = "h-24 w-24" }: { className?: string }) {
  return (
    <div className={cn("relative flex items-center justify-center select-none", className)}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
        aria-label="Golden Aloe Succulent"
      >
        <ellipse cx="50" cy="86" rx="28" ry="6" className="fill-stone-800/20 dark:fill-black/40 blur-[1px]" />
        <path
          d="M28 80 L32 88 Q50 90 68 88 L72 80 Z"
          className="fill-amber-100/90 stroke-amber-300 dark:fill-stone-800 dark:stroke-amber-700/60"
          strokeWidth="1.5"
        />
        <ellipse cx="50" cy="80" rx="22" ry="4.5" className="fill-amber-50 stroke-amber-300 dark:fill-stone-900 dark:stroke-amber-700/60" strokeWidth="1.5" />
        <ellipse cx="50" cy="79.5" rx="18" ry="3.5" className="fill-amber-950/80" />

        {/* Succulent Fleshy Rosette Leaves */}
        <g className="origin-bottom">
          {/* Outer Lower Leaves */}
          <path d="M36 79 Q22 66 20 54 Q32 64 42 77" className="fill-emerald-600 stroke-amber-500" strokeWidth="1" />
          <path d="M64 79 Q78 66 80 54 Q68 64 58 77" className="fill-emerald-600 stroke-amber-500" strokeWidth="1" />
          {/* Mid Leaves */}
          <path d="M42 77 Q30 52 32 38 Q42 54 48 74" className="fill-emerald-500 stroke-amber-400" strokeWidth="1" />
          <path d="M58 77 Q70 52 68 38 Q58 54 52 74" className="fill-emerald-500 stroke-amber-400" strokeWidth="1" />
          {/* Center Upright Leaf Spear with Golden Tip */}
          <path d="M48 76 Q47 42 50 26 Q53 42 52 76" className="fill-emerald-400 stroke-yellow-400" strokeWidth="1.2" />
          <circle cx="50" cy="27" r="2.2" className="fill-amber-300 animate-ping" style={{ animationDuration: "3s" }} />
        </g>
      </svg>
    </div>
  );
}

/* ── 8. Silver Pampas Grass (หญ้าพริ้วสายลม) ── */
export function ZenSilverPampas({ className = "h-24 w-24" }: { className?: string }) {
  return (
    <div className={cn("relative flex items-center justify-center select-none", className)}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
        aria-label="Silver Pampas"
      >
        <ellipse cx="50" cy="86" rx="24" ry="6" className="fill-stone-800/20 dark:fill-black/40 blur-[1px]" />
        {/* Slender Ceramic Vase */}
        <path
          d="M44 86 L43 72 Q43 65 47 58 L53 58 Q57 65 57 72 L56 86 Z"
          className="fill-stone-100 stroke-stone-300 dark:fill-stone-800 dark:stroke-stone-600"
          strokeWidth="1.2"
        />
        <ellipse cx="50" cy="58" rx="3.5" ry="1.2" className="fill-stone-300 dark:fill-stone-700" />

        {/* 3 Feathery Silver Plumes Swaying in Breeze */}
        <g className="animate-[wiggle_5s_ease-in-out_infinite] origin-bottom">
          {/* Left Plume */}
          <path d="M49 60 Q40 45 28 32" stroke="#a8a29e" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M28 32 Q25 22 21 26 Q27 34 32 38" className="fill-stone-200 stroke-stone-300 dark:fill-stone-400" />
          <ellipse cx="26" cy="30" rx="9" ry="3.5" className="fill-stone-200/90 dark:fill-stone-400/80" transform="rotate(-40 26 30)" />
        </g>
        <g className="animate-[wiggle_6s_ease-in-out_infinite] origin-bottom">
          {/* Center High Plume */}
          <path d="M50 58 Q50 36 52 20" stroke="#a8a29e" strokeWidth="1.8" strokeLinecap="round" />
          <ellipse cx="52" cy="22" rx="4" ry="12" className="fill-stone-100/95 dark:fill-stone-300/90" />
          <ellipse cx="52" cy="22" rx="2.5" ry="9" className="fill-white" />
        </g>
        <g className="animate-[wiggle_4.5s_ease-in-out_infinite] origin-bottom">
          {/* Right Plume */}
          <path d="M51 60 Q62 46 72 35" stroke="#a8a29e" strokeWidth="1.5" strokeLinecap="round" />
          <ellipse cx="70" cy="34" rx="9" ry="3.5" className="fill-stone-200/90 dark:fill-stone-400/80" transform="rotate(35 70 34)" />
        </g>
      </svg>
    </div>
  );
}

/* ── 9. Moonlight Fungi (เห็ดเรืองแสงราตรี) ── */
export function ZenMoonlightFungi({ className = "h-24 w-24" }: { className?: string }) {
  return (
    <div className={cn("relative flex items-center justify-center select-none", className)}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
        aria-label="Moonlight Fungi"
      >
        <ellipse cx="50" cy="85" rx="32" ry="7" className="fill-stone-800/20 dark:fill-black/50 blur-[1px]" />
        {/* Mossy Rock Base */}
        <path
          d="M26 84 Q34 76 50 75 Q68 76 76 84 Q50 89 26 84 Z"
          className="fill-stone-400 stroke-stone-500 dark:fill-stone-800 dark:stroke-stone-700"
          strokeWidth="1.5"
        />
        <ellipse cx="40" cy="80" rx="9" ry="3" className="fill-emerald-800/60" />
        <ellipse cx="62" cy="81" rx="8" ry="2.5" className="fill-emerald-800/60" />

        {/* Left Small Mushroom */}
        <path d="M38 78 Q37 68 40 62" stroke="#e0e7ff" strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="40" cy="62" rx="7" ry="4" className="fill-indigo-400 stroke-indigo-300" />
        <circle cx="40" cy="61" r="1.5" className="fill-cyan-200" />

        {/* Center Main Bioluminescent Mushroom */}
        <g className="animate-[pulse_3s_ease-in-out_infinite]">
          <path d="M50 77 Q49 58 51 46" stroke="#c7d2fe" strokeWidth="5.5" strokeLinecap="round" />
          {/* Mushroom Cap */}
          <path
            d="M32 48 Q50 28 68 48 Q50 53 32 48 Z"
            className="fill-indigo-500 stroke-indigo-300 dark:fill-indigo-600 dark:stroke-indigo-400"
            strokeWidth="1.2"
          />
          {/* Glowing Bioluminescent Spots */}
          <circle cx="50" cy="38" r="2.5" className="fill-cyan-300 animate-ping" style={{ animationDuration: "2s" }} />
          <circle cx="42" cy="44" r="1.8" className="fill-cyan-200" />
          <circle cx="58" cy="44" r="1.8" className="fill-cyan-200" />
          <circle cx="50" cy="46" r="1.2" className="fill-cyan-100" />
        </g>

        {/* Right Slender Mushroom */}
        <path d="M62 79 Q65 65 63 56" stroke="#e0e7ff" strokeWidth="3.2" strokeLinecap="round" />
        <ellipse cx="63" cy="56" rx="8" ry="4.5" className="fill-indigo-400 stroke-indigo-300" />
        <circle cx="63" cy="55" r="1.6" className="fill-cyan-200" />
      </svg>
    </div>
  );
}

/* ── 10. Spirit Willow (หลิวทิพย์สมานฉันท์) ── */
export function ZenSpiritWillow({ className = "h-24 w-24" }: { className?: string }) {
  return (
    <div className={cn("relative flex items-center justify-center select-none", className)}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
        aria-label="Spirit Willow"
      >
        <ellipse cx="50" cy="86" rx="30" ry="6" className="fill-stone-800/20 dark:fill-black/40 blur-[1px]" />
        <path
          d="M28 80 L32 87 Q50 89 68 87 L72 80 Z"
          className="fill-stone-200 stroke-stone-300 dark:fill-stone-800 dark:stroke-stone-600"
          strokeWidth="1.5"
        />
        <ellipse cx="50" cy="80" rx="22" ry="4.5" className="fill-stone-100 stroke-stone-300 dark:fill-stone-900 dark:stroke-stone-600" strokeWidth="1.5" />
        <ellipse cx="50" cy="79.5" rx="18" ry="3.5" className="fill-amber-950/80" />

        {/* Ancient Graceful Gnarled Willow Trunk */}
        <path
          d="M50 80 C48 68, 54 55, 50 42 C48 34, 52 28, 50 20"
          fill="none"
          stroke="#422e20"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* Arching Canopy Branches */}
        <path d="M50 36 C36 32, 24 38, 16 52" fill="none" stroke="#422e20" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M50 36 C64 32, 76 38, 84 52" fill="none" stroke="#422e20" strokeWidth="2.5" strokeLinecap="round" />

        {/* Hanging Weeping Tendrils */}
        <g className="animate-[wiggle_6s_ease-in-out_infinite] origin-top">
          <path d="M22 46 Q20 62 23 74" stroke="#a7f3d0" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="21" cy="55" r="1.5" className="fill-emerald-400" />
          <circle cx="22" cy="65" r="1.5" className="fill-emerald-400" />
          <path d="M34 38 Q32 58 35 72" stroke="#a7f3d0" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="33" cy="50" r="1.5" className="fill-emerald-400" />
          <circle cx="34" cy="62" r="1.5" className="fill-emerald-400" />
        </g>
        <g className="animate-[wiggle_7s_ease-in-out_infinite] origin-top">
          <path d="M78 46 Q80 62 77 74" stroke="#a7f3d0" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="79" cy="55" r="1.5" className="fill-emerald-400" />
          <circle cx="78" cy="65" r="1.5" className="fill-emerald-400" />
          <path d="M66 38 Q68 58 65 72" stroke="#a7f3d0" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="67" cy="50" r="1.5" className="fill-emerald-400" />
          <circle cx="66" cy="62" r="1.5" className="fill-emerald-400" />
        </g>

        {/* Celestial Star Glow at Peak */}
        <circle cx="50" cy="20" r="3" className="fill-fuchsia-300 animate-ping" style={{ animationDuration: "3s" }} />
        <circle cx="50" cy="20" r="2" className="fill-white" />
      </svg>
    </div>
  );
}

/* ── 11. Japanese Stone Toro Lantern (โคมไฟหินเซน) ── */
export function ZenStoneLantern({ className = "h-24 w-24" }: { className?: string }) {
  return (
    <div className={cn("relative flex items-center justify-center select-none", className)}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
        aria-label="Stone Toro Lantern"
      >
        <ellipse cx="50" cy="88" rx="26" ry="6" className="fill-stone-800/20 dark:fill-black/50 blur-[1px]" />
        <polygon points="34,88 66,88 62,81 38,81" className="fill-stone-300 stroke-stone-500 dark:fill-stone-800 dark:stroke-stone-700" strokeWidth="1.5" />
        <rect x="44" y="58" width="12" height="23" rx="1.5" className="fill-stone-300 stroke-stone-500 dark:fill-stone-800 dark:stroke-stone-700" strokeWidth="1.5" />
        <polygon points="32,58 68,58 63,53 37,53" className="fill-stone-300 stroke-stone-500 dark:fill-stone-800 dark:stroke-stone-700" strokeWidth="1.5" />

        {/* Fire Chamber */}
        <rect x="39" y="40" width="22" height="13" rx="2" className="fill-stone-900 stroke-stone-600 dark:fill-stone-950 dark:stroke-stone-700" strokeWidth="1.2" />
        <rect x="42" y="42" width="7" height="9" rx="1" className="fill-amber-200/90 dark:fill-amber-300/90" />
        <rect x="51" y="42" width="7" height="9" rx="1" className="fill-amber-200/90 dark:fill-amber-300/90" />
        <circle cx="50" cy="46" r="4.5" className="fill-amber-400/80 animate-ping" style={{ animationDuration: "2s" }} />
        <circle cx="50" cy="46" r="2.5" className="fill-amber-300 animate-pulse" />

        {/* Flared Roof & Jewel */}
        <path
          d="M20 40 Q50 37 80 40 L68 28 Q50 25 32 28 Z"
          className="fill-stone-400 stroke-stone-600 dark:fill-stone-700 dark:stroke-stone-600"
          strokeWidth="1.5"
        />
        <ellipse cx="50" cy="27" rx="8" ry="3" className="fill-stone-300 stroke-stone-500 dark:fill-stone-800" strokeWidth="1.2" />
        <circle cx="50" cy="21" r="4.5" className="fill-stone-300 stroke-stone-500 dark:fill-stone-800" strokeWidth="1.2" />
      </svg>
    </div>
  );
}

/* ── 12. Sleeping Ginger Cat (เจ้าแมวส้มหลับปุ๋ย) ── */
export function ZenSleepyCat({ className = "h-20 w-20" }: { className?: string }) {
  return (
    <div className={cn("relative flex items-center justify-center select-none", className)}>
      <svg
        viewBox="0 0 100 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
        aria-label="Sleepy Ginger Cat"
      >
        <ellipse cx="50" cy="68" rx="36" ry="8" className="fill-stone-800/15 dark:fill-black/40 blur-[1.5px]" />
        <ellipse cx="50" cy="65" rx="34" ry="7" className="fill-emerald-100 stroke-emerald-300 dark:fill-emerald-950 dark:stroke-emerald-800" strokeWidth="1.2" />

        {/* Breathing Cat Body */}
        <g className="animate-[pulse_3.5s_ease-in-out_infinite] origin-center">
          <ellipse cx="50" cy="50" rx="25" ry="17" className="fill-amber-500 dark:fill-amber-600" />
          <ellipse cx="52" cy="53" rx="18" ry="11" className="fill-amber-200/90 dark:fill-amber-200/80" />
          <path d="M42 36 Q45 42 42 46" stroke="#b45309" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M50 35 Q53 41 50 45" stroke="#b45309" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M58 36 Q61 42 58 46" stroke="#b45309" strokeWidth="1.8" strokeLinecap="round" />

          {/* Curled Tail */}
          <path d="M72 55 C77 50, 75 40, 68 40 C63 40, 64 45, 68 45" fill="none" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
          <circle cx="68" cy="43" r="2.5" className="fill-white" />

          {/* Head & Ears */}
          <circle cx="33" cy="46" r="12" className="fill-amber-500 dark:fill-amber-600" />
          <polygon points="26,37 32,26 35,37" className="fill-amber-600" />
          <polygon points="28,36 32,29 34,36" className="fill-pink-200" />
          <polygon points="36,37 42,27 45,38" className="fill-amber-600" />
          <polygon points="38,36 42,30 43,37" className="fill-pink-200" />

          {/* Closed Eyes */}
          <path d="M26 47 Q29 50 32 47" stroke="#78350f" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          <path d="M34 47 Q37 50 40 47" stroke="#78350f" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          <circle cx="33" cy="51" r="1.2" className="fill-pink-400" />
        </g>

        {/* Floating Zzzs */}
        <g className="animate-[bounce_4s_ease-in-out_infinite] origin-center opacity-75">
          <text x="20" y="24" className="font-mono text-[9px] font-bold fill-indigo-600 dark:fill-dusk-lavender select-none">z</text>
          <text x="14" y="16" className="font-mono text-[11px] font-bold fill-indigo-600 dark:fill-dusk-lavender select-none">Z</text>
        </g>
      </svg>
    </div>
  );
}

/* ── 13. Shinto Torii Gate (เสาโทริอิแดงศักดิ์สิทธิ์) ── */
export function ZenToriiGate({ className = "h-24 w-24" }: { className?: string }) {
  return (
    <div className={cn("relative flex items-center justify-center select-none", className)}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
        aria-label="Torii Gate"
      >
        <ellipse cx="50" cy="88" rx="36" ry="6" className="fill-stone-800/20 dark:fill-black/50 blur-[1px]" />
        {/* Stone Pillar Bases */}
        <rect x="23" y="82" width="10" height="6" rx="1.5" className="fill-stone-700 dark:fill-stone-800 stroke-stone-600" />
        <rect x="67" y="82" width="10" height="6" rx="1.5" className="fill-stone-700 dark:fill-stone-800 stroke-stone-600" />

        {/* Main Vermilion Red Pillars */}
        <rect x="25" y="24" width="6.5" height="58" rx="1" className="fill-red-600 stroke-red-700" strokeWidth="0.8" />
        <rect x="68.5" y="24" width="6.5" height="58" rx="1" className="fill-red-600 stroke-red-700" strokeWidth="0.8" />

        {/* Tie Beam (Nuki) */}
        <rect x="18" y="34" width="64" height="5.5" rx="1" className="fill-red-600 stroke-red-700" strokeWidth="0.8" />
        {/* Center Tablet (Gakuzuka) */}
        <rect x="47" y="22" width="6" height="12" rx="0.5" className="fill-stone-900 stroke-amber-400" strokeWidth="0.8" />

        {/* Upper Lintel Beam (Kasagi) with Upward Curves */}
        <path
          d="M10 24 Q50 21 90 24 L88 17 Q50 14 12 17 Z"
          className="fill-stone-900 stroke-stone-800 dark:fill-black dark:stroke-stone-700"
          strokeWidth="1.2"
        />
        {/* Gold Cap Details */}
        <rect x="10" y="17" width="4" height="7" className="fill-amber-400" />
        <rect x="86" y="17" width="4" height="7" className="fill-amber-400" />
      </svg>
    </div>
  );
}

/* ── 14. Zen Wooden Moon Bridge (สะพานไม้พระจันทร์) ── */
export function ZenMoonBridge({ className = "h-24 w-24" }: { className?: string }) {
  return (
    <div className={cn("relative flex items-center justify-center select-none", className)}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
        aria-label="Zen Moon Bridge"
      >
        <ellipse cx="50" cy="85" rx="38" ry="7" className="fill-stone-800/20 dark:fill-black/50 blur-[1px]" />
        {/* Sand Ripple Lines under Bridge */}
        <path d="M14 85 Q50 82 86 85" stroke="#a8a29e" strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
        <path d="M20 89 Q50 86 80 89" stroke="#a8a29e" strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />

        {/* Graceful Arch of Red/Cedar Bridge */}
        <path
          d="M12 78 Q50 42 88 78 L85 83 Q50 48 15 83 Z"
          className="fill-red-700 stroke-red-800 dark:fill-red-800 dark:stroke-red-900"
          strokeWidth="1.2"
        />
        {/* Wooden Deck Planks */}
        <path d="M26 69 L27 75" stroke="#7f1d1d" strokeWidth="1.5" />
        <path d="M38 58 L39 65" stroke="#7f1d1d" strokeWidth="1.5" />
        <path d="M50 54 L50 61" stroke="#7f1d1d" strokeWidth="1.5" />
        <path d="M62 58 L61 65" stroke="#7f1d1d" strokeWidth="1.5" />
        <path d="M74 69 L73 75" stroke="#7f1d1d" strokeWidth="1.5" />

        {/* Bridge Curved Handrail */}
        <path
          d="M14 68 Q50 32 86 68"
          fill="none"
          stroke="#b91c1c"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        {/* Handrail Posts */}
        <line x1="24" y1="63" x2="24" y2="72" stroke="#991b1b" strokeWidth="2" strokeLinecap="round" />
        <line x1="50" y1="46" x2="50" y2="56" stroke="#991b1b" strokeWidth="2" strokeLinecap="round" />
        <line x1="76" y1="63" x2="76" y2="72" stroke="#991b1b" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/* ── 15. Japanese Tsukubai Water Basin (อ่างน้ำหินซึคุบาอิ) ── */
export function ZenTsukubai({ className = "h-24 w-24" }: { className?: string }) {
  return (
    <div className={cn("relative flex items-center justify-center select-none", className)}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
        aria-label="Tsukubai Water Basin"
      >
        <ellipse cx="50" cy="85" rx="34" ry="7" className="fill-stone-800/20 dark:fill-black/50 blur-[1px]" />
        {/* River Boulder Stone Basin */}
        <path
          d="M20 74 Q24 88 50 88 Q76 88 80 74 Q74 60 50 60 Q26 60 20 74 Z"
          className="fill-stone-400 stroke-stone-500 dark:fill-stone-800 dark:stroke-stone-700"
          strokeWidth="1.8"
        />
        <ellipse cx="50" cy="70" rx="22" ry="7.5" className="fill-sky-800/80 stroke-stone-500 dark:fill-sky-950 dark:stroke-stone-700" strokeWidth="1.2" />
        <ellipse cx="50" cy="70" rx="19" ry="6" className="fill-cyan-400/20" />

        {/* Bamboo Kakehi Water Spout */}
        <path d="M12 40 L44 56" stroke="#059669" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M12 40 L16 38" stroke="#047857" strokeWidth="4.5" strokeLinecap="round" />
        {/* Trickling Water Droplets */}
        <path d="M44 58 Q45 64 45 68" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 3" className="animate-pulse" />

        {/* Bamboo Ladle (Hishaku) Resting Across Rim */}
        <path d="M38 68 L68 62" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
        <ellipse cx="69" cy="62" rx="3.5" ry="2" className="fill-amber-100 stroke-amber-600" strokeWidth="0.8" />
      </svg>
    </div>
  );
}

/* ── Unified Flora & Element Renderer ── */
export function ZenFloraRenderer({
  plantId,
  stage = 4,
  className = "h-24 w-24",
}: {
  plantId: string;
  stage?: number;
  className?: string;
}) {
  switch (plantId) {
    case "bonsai":
      return <ZenBonsaiPine className={className} stage={stage} />;
    case "blossom":
      return <ZenSakuraBlossom className={className} />;
    case "bamboo":
      return <ZenBambooGrove className={className} />;
    case "lotus":
      return <ZenLotusPond className={className} />;
    case "ginkgo":
      return <ZenGoldenGinkgo className={className} />;
    case "sprout":
      return <ZenSprout className={className} />;
    case "aloe":
      return <ZenAloeSucculent className={className} />;
    case "pampas":
      return <ZenSilverPampas className={className} />;
    case "fungi":
      return <ZenMoonlightFungi className={className} />;
    case "willow":
      return <ZenSpiritWillow className={className} />;
    case "lantern":
      return <ZenStoneLantern className={className} />;
    case "cat":
      return <ZenSleepyCat className={className} />;
    case "torii":
      return <ZenToriiGate className={className} />;
    case "bridge":
      return <ZenMoonBridge className={className} />;
    case "basin":
      return <ZenTsukubai className={className} />;
    default:
      return <ZenSprout className={className} />;
  }
}

/* ── 16. Bespoke Pure SVG Japanese Zen Terrarium Backdrop ── */
export function ZenTerrariumBackdrop({
  className = "w-full h-full",
  timeOfDay = "day",
  season = "spring",
  isNourishing = false,
  showPedestal = true,
}: {
  className?: string;
  timeOfDay?: "dawn" | "day" | "dusk" | "night";
  season?: "spring" | "summer" | "autumn" | "winter";
  isNourishing?: boolean;
  showPedestal?: boolean;
}) {
  return (
    <div className={cn("relative w-full h-full overflow-hidden select-none pointer-events-none", className)}>
      <svg
        viewBox="0 0 400 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
        aria-label="Zen Garden Terrarium Landscape"
      >
        <defs>
          {/* Dynamic Sky Gradients */}
          {timeOfDay === "dawn" && (
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fdf2f8" className="dark:[stop-color:#201026]" />
              <stop offset="45%" stopColor="#fae8ff" className="dark:[stop-color:#18102a]" />
              <stop offset="100%" stopColor="#fed7aa" className="dark:[stop-color:#0d1222]" />
            </linearGradient>
          )}
          {timeOfDay === "day" && (
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f8f6f0" className="dark:[stop-color:#0d111f]" />
              <stop offset="55%" stopColor="#eef3f7" className="dark:[stop-color:#0f1527]" />
              <stop offset="100%" stopColor="#e2e8f0" className="dark:[stop-color:#090d18]" />
            </linearGradient>
          )}
          {timeOfDay === "dusk" && (
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fed7aa" className="dark:[stop-color:#2a1325]" />
              <stop offset="50%" stopColor="#fecdd3" className="dark:[stop-color:#21112b]" />
              <stop offset="100%" stopColor="#ddd6fe" className="dark:[stop-color:#0e1022]" />
            </linearGradient>
          )}
          {timeOfDay === "night" && (
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0b0f1f" className="dark:[stop-color:#060812]" />
              <stop offset="60%" stopColor="#080b18" className="dark:[stop-color:#04060d]" />
              <stop offset="100%" stopColor="#050711" className="dark:[stop-color:#020308]" />
            </linearGradient>
          )}

          {/* Sand Bed Gradient */}
          <linearGradient id="sandGrad" x1="0" y1="110" x2="0" y2="200" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#faf6ee" className="dark:[stop-color:#101322]" />
            <stop offset="50%" stopColor="#f3eee3" className="dark:[stop-color:#0d101d]" />
            <stop offset="100%" stopColor="#e7dfd0" className="dark:[stop-color:#090b14]" />
          </linearGradient>

          {/* Mount Fuji Shading Gradient */}
          <linearGradient id="fujiGrad" x1="150" y1="42" x2="150" y2="115" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="28%" stopColor="#cbd5e1" className="dark:[stop-color:#475569]" />
            <stop offset="100%" stopColor="#94a3b8" className="dark:[stop-color:#1e293b]" />
          </linearGradient>

          {/* Sun / Moon Radial Glows */}
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.7" />
            <stop offset="60%" stopColor="#e0e7ff" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
          </radialGradient>

          {/* Nourish Beam Gradient */}
          <linearGradient id="nourishBeam" x1="0" y1="200" x2="0" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#a7f3d0" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#6ee7b7" stopOpacity="0" />
          </linearGradient>

          {/* Granite Dais Gradient */}
          <linearGradient id="graniteDais" x1="0" y1="145" x2="0" y2="170" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f1f5f9" className="dark:[stop-color:#334155]" />
            <stop offset="50%" stopColor="#cbd5e1" className="dark:[stop-color:#1e293b]" />
            <stop offset="100%" stopColor="#94a3b8" className="dark:[stop-color:#0f172a]" />
          </linearGradient>
        </defs>

        {/* ── 1. Sky Canvas ── */}
        <rect x="0" y="0" width="400" height="120" fill="url(#skyGrad)" />

        {/* ── 2. Celestial Orb (Sun, Sunset, or Moon) ── */}
        {timeOfDay === "day" && (
          <g transform="translate(305, 38)">
            <circle cx="0" cy="0" r="26" fill="url(#sunGlow)" />
            <circle cx="0" cy="0" r="14" fill="#fef3c7" className="stroke-amber-300" strokeWidth="1" />
            <circle cx="0" cy="0" r="17" className="stroke-amber-200/50" strokeWidth="0.8" strokeDasharray="3 3" />
          </g>
        )}
        {timeOfDay === "dawn" && (
          <g transform="translate(100, 52)">
            <circle cx="0" cy="0" r="24" fill="url(#sunGlow)" />
            <circle cx="0" cy="0" r="12" fill="#fed7aa" className="stroke-rose-300" strokeWidth="1" />
          </g>
        )}
        {timeOfDay === "dusk" && (
          <g transform="translate(200, 78)">
            <circle cx="0" cy="0" r="28" fill="url(#sunGlow)" />
            <circle cx="0" cy="0" r="16" fill="#fb923c" className="stroke-rose-400" strokeWidth="1" />
          </g>
        )}
        {timeOfDay === "night" && (
          <g transform="translate(315, 36)">
            <circle cx="0" cy="0" r="24" fill="url(#moonGlow)" />
            {/* Luminous Crescent Moon */}
            <path
              d="M -6,-10 A 13,13 0 1 0 8,8 A 10.5,10.5 0 1 1 -6,-10 Z"
              fill="#fef08a"
              className="drop-shadow-[0_0_6px_rgba(254,240,138,0.7)]"
            />
            {/* Twinkling Constellation Stars */}
            <g className="fill-white/80 dark:fill-white">
              <circle cx="-180" cy="-10" r="1" className="animate-pulse" />
              <circle cx="-140" cy="12" r="1.2" />
              <circle cx="-100" cy="-15" r="0.9" />
              <circle cx="-70" cy="20" r="1.3" className="animate-pulse" />
              <circle cx="-40" cy="-6" r="0.8" />
              <circle cx="35" cy="18" r="1.1" />
              <circle cx="60" cy="-12" r="1.4" className="animate-pulse" />
            </g>
          </g>
        )}

        {/* ── 3. Atmospheric Cloud Wisps (Kumo 雲) ── */}
        <g className="fill-white/40 dark:fill-white/5 pointer-events-none">
          <path d="M 15,35 Q 32,26 48,35 Q 64,28 78,35 Q 92,44 78,50 Q 56,54 36,50 Q 18,46 15,35 Z" />
          <path d="M 270,48 Q 288,40 304,48 Q 320,42 334,48 Q 348,56 332,60 Q 312,63 294,60 Q 274,56 270,48 Z" />
        </g>

        {/* ── 4. Distant Mountain Ridge ── */}
        <path
          d="M 0,90 Q 50,75 105,82 T 225,80 T 330,76 T 400,82 L 400,120 L 0,120 Z"
          className="fill-stone-300/40 dark:fill-stone-800/40"
        />

        {/* ── 5. Mount Fuji Silhouette (富士山) ── */}
        <g>
          {/* Fuji Mountain Body */}
          <path
            d="M 95,115 C 122,100 138,72 144,48 L 156,48 C 162,72 178,100 205,115 L 205,120 L 95,120 Z"
            fill="url(#fujiGrad)"
          />
          {/* Fuji Snow Cap with scalloped fringe */}
          <path
            d="M 144,48 L 156,48 C 159,57 161,64 163,68 C 160,65 158,68 156,64 C 154,67 152,65 150,68 C 148,64 146,67 144,63 C 142,66 140,65 137,68 C 139,64 141,57 144,48 Z"
            fill="#ffffff"
            className="drop-shadow-xs"
          />
          {/* Snow crevices / striations */}
          <line x1="148" y1="52" x2="147" y2="60" stroke="#cbd5e1" strokeWidth="0.6" strokeLinecap="round" />
          <line x1="152" y1="52" x2="153" y2="61" stroke="#cbd5e1" strokeWidth="0.6" strokeLinecap="round" />
        </g>

        {/* ── 6. Rolling Foothills in Mid-Ground ── */}
        <path
          d="M 0,105 Q 60,92 120,100 T 250,96 T 345,102 T 400,98 L 400,120 L 0,120 Z"
          className={cn(
            season === "autumn"
              ? "fill-amber-800/25 dark:fill-amber-950/40"
              : "fill-emerald-800/20 dark:fill-emerald-950/40"
          )}
        />

        {/* ── 7. Overhanging Japanese Black Pine (Matsu 松) ── */}
        <g>
          {/* Gnarled Branch */}
          <path
            d="M -5,12 C 25,18 48,15 68,10 C 88,6 102,12 118,22 C 104,25 84,18 64,19 C 42,28 18,26 -5,22 Z"
            className="fill-amber-950 dark:fill-stone-800"
          />
          <path
            d="M 68,14 C 76,24 88,30 98,34 C 94,36 84,33 74,25 Z"
            className="fill-amber-950 dark:fill-stone-800"
          />

          {/* Pine Needle Tufts (Fans of deep forest evergreen needles) */}
          <g transform="translate(32, 14)">
            <ellipse cx="0" cy="0" rx="14" ry="7" className="fill-emerald-800 dark:fill-emerald-900" />
            <ellipse cx="0" cy="-2" rx="12" ry="5.5" className="fill-emerald-600 dark:fill-emerald-700" />
            <ellipse cx="0" cy="-3.5" rx="9" ry="3.5" className="fill-emerald-500 dark:fill-emerald-600" />
          </g>

          <g transform="translate(70, 10)">
            <ellipse cx="0" cy="0" rx="16" ry="8" className="fill-emerald-800 dark:fill-emerald-900" />
            <ellipse cx="0" cy="-2" rx="13" ry="6" className="fill-emerald-600 dark:fill-emerald-700" />
            <ellipse cx="0" cy="-4" rx="10" ry="4" className="fill-emerald-500 dark:fill-emerald-600" />
          </g>

          <g transform="translate(116, 22)">
            <ellipse cx="0" cy="0" rx="14" ry="7" className="fill-emerald-800 dark:fill-emerald-900" />
            <ellipse cx="0" cy="-2" rx="11" ry="5" className="fill-emerald-600 dark:fill-emerald-700" />
            <ellipse cx="0" cy="-3.5" rx="8" ry="3.5" className="fill-emerald-500 dark:fill-emerald-600" />
          </g>

          <g transform="translate(94, 34)">
            <ellipse cx="0" cy="0" rx="12" ry="6" className="fill-emerald-800 dark:fill-emerald-900" />
            <ellipse cx="0" cy="-1.5" rx="9" ry="4" className="fill-emerald-600 dark:fill-emerald-700" />
          </g>
        </g>

        {/* ── 8. Karesansui (枯山水) Dry Garden Sand Bed ── */}
        <path
          d="M 0,112 C 70,110 130,114 200,112 C 270,114 330,110 400,112 L 400,200 L 0,200 Z"
          fill="url(#sandGrad)"
          className="stroke-stone-300/60 dark:stroke-white/10"
          strokeWidth="0.8"
        />

        {/* Concentric Raked Sand Waves (Samon 砂紋 centered on cx:200, cy:158) */}
        <g className="stroke-stone-400/40 dark:stroke-white/10 fill-none" strokeWidth="0.8">
          <ellipse cx="200" cy="158" rx="46" ry="12" />
          <ellipse cx="200" cy="158" rx="66" ry="17" />
          <ellipse cx="200" cy="158" rx="90" ry="23" strokeDasharray="6 3" />
          <ellipse cx="200" cy="158" rx="118" ry="30" />
          <ellipse cx="200" cy="158" rx="150" ry="38" strokeDasharray="10 4" />
          <ellipse cx="200" cy="158" rx="188" ry="46" />
        </g>

        {/* Linear sand rake furrows (Flanking garden edges) */}
        <g className="stroke-stone-400/30 dark:stroke-white/5 fill-none" strokeWidth="0.7">
          <path d="M 0,126 Q 50,128 95,130" />
          <path d="M 0,138 Q 45,140 85,142" />
          <path d="M 0,150 Q 40,152 75,154" />
          <path d="M 305,130 Q 350,128 400,126" />
          <path d="M 315,142 Q 355,140 400,138" />
          <path d="M 325,154 Q 360,152 400,150" />
        </g>

        {/* ── 9. Balanced Zen Garden Rocks & Moss (Ishi & Koke 石と苔) ── */}
        {/* Left Stone Grouping */}
        <g>
          {/* Moss Patch */}
          <ellipse cx="56" cy="172" rx="28" ry="9" className="fill-emerald-800/80 dark:fill-emerald-900" />
          <ellipse cx="54" cy="171" rx="24" ry="7" className="fill-emerald-600/90 dark:fill-emerald-700" />
          <ellipse cx="52" cy="170" rx="18" ry="5" className="fill-emerald-500/90 dark:fill-emerald-600" />

          {/* Tall Vertical Stone */}
          <path
            d="M 38,172 C 34,152 44,136 54,134 C 62,132 68,148 64,172 Z"
            className="fill-stone-400 stroke-stone-500 dark:fill-stone-700 dark:stroke-stone-600"
            strokeWidth="1"
          />
          <path d="M 52,136 C 48,146 44,158 45,170" stroke="#f1f5f9" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />

          {/* Winter snow dusting on rock */}
          {season === "winter" && (
            <path d="M 44,135 Q 54,133 60,135 Q 56,138 48,137 Z" fill="#ffffff" opacity="0.9" />
          )}

          {/* Reclining Companion Stone */}
          <path
            d="M 56,173 C 54,162 66,155 78,160 C 84,164 82,174 68,175 Z"
            className="fill-stone-400 stroke-stone-500 dark:fill-stone-700 dark:stroke-stone-600"
            strokeWidth="1"
          />
        </g>

        {/* Right Stone Grouping */}
        <g>
          {/* Moss Patch */}
          <ellipse cx="348" cy="171" rx="24" ry="8" className="fill-emerald-800/80 dark:fill-emerald-900" />
          <ellipse cx="346" cy="170" rx="20" ry="6" className="fill-emerald-600/90 dark:fill-emerald-700" />

          {/* River Boulder */}
          <path
            d="M 334,172 C 330,158 348,150 360,154 C 370,158 368,172 352,173 Z"
            className="fill-stone-400 stroke-stone-500 dark:fill-stone-700 dark:stroke-stone-600"
            strokeWidth="1"
          />
          <path d="M 346,152 C 354,156 358,164 358,171" stroke="#f1f5f9" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />

          {/* Winter snow dusting on boulder */}
          {season === "winter" && (
            <path d="M 342,151 Q 354,149 362,153 Q 356,156 346,154 Z" fill="#ffffff" opacity="0.9" />
          )}
        </g>

        {/* ── 10. Central Stone Pedestal Dais (蹲踞 / 台座 - Shown when requested) ── */}
        {showPedestal && (
          <g>
            {/* Dais Grounding Shadow */}
            <ellipse cx="200" cy="165" rx="38" ry="8" className="fill-stone-900/15 dark:fill-black/50 blur-[1px]" />

            {/* Granite Dais Body */}
            <path
              d="M 174,155 L 178,164 Q 200,167 222,164 L 226,155 Z"
              fill="url(#graniteDais)"
              className="stroke-stone-400/80 dark:stroke-stone-600"
              strokeWidth="1"
            />
            {/* Stone Texture Chisel Grooves */}
            <line x1="185" y1="157" x2="187" y2="163" stroke="#64748b" strokeWidth="0.7" opacity="0.5" />
            <line x1="200" y1="158" x2="200" y2="165" stroke="#64748b" strokeWidth="0.7" opacity="0.5" />
            <line x1="214" y1="157" x2="212" y2="163" stroke="#64748b" strokeWidth="0.7" opacity="0.5" />

            {/* Polished Dais Top Surface Ellipse */}
            <ellipse
              cx="200"
              cy="155"
              rx="28"
              ry="6"
              className="fill-stone-100 stroke-stone-300 dark:fill-stone-800 dark:stroke-stone-600"
              strokeWidth="1"
            />
            <ellipse cx="200" cy="155" rx="24" ry="4.5" className="fill-stone-200/50 dark:fill-stone-900/60" />
          </g>
        )}

        {/* ── 11. Seasonal Particles: Spring Sakura, Autumn Ginkgo, Summer Bamboo, Winter Snow ── */}
        {season === "spring" && (
          <g className="fill-pink-400/80 dark:fill-pink-300/80 pointer-events-none drop-shadow-2xs">
            <path
              d="M 120,68 C 117,62 122,57 127,58 C 131,59 130,65 125,67 C 122,68 121,69 120,68 Z"
              transform="rotate(-15 124 64)"
            />
            <path
              d="M 285,82 C 282,77 286,72 291,73 C 295,74 294,80 289,82 C 287,83 286,83 285,82 Z"
              transform="rotate(25 288 78)"
            />
            <path
              d="M 175,98 C 173,94 176,90 180,91 C 183,92 182,96 178,98 C 176,99 175,99 175,98 Z"
              transform="rotate(-40 178 95)"
            />
          </g>
        )}

        {season === "autumn" && (
          <g className="fill-amber-400/85 dark:fill-amber-300/85 pointer-events-none drop-shadow-2xs">
            {/* Ginkgo Fan Leaf 1 */}
            <path
              d="M 115,70 C 110,62 118,55 126,58 C 132,60 128,68 120,70 L 118,74 Z"
              transform="rotate(18 120 65)"
            />
            {/* Ginkgo Fan Leaf 2 */}
            <path
              d="M 275,85 C 270,78 277,72 284,74 C 290,76 287,83 280,85 L 278,89 Z"
              transform="rotate(-22 280 80)"
            />
            {/* Maple Leaf 3 */}
            <path
              d="M 180,92 C 177,88 181,85 185,86 C 188,87 186,91 182,92 Z"
              className="fill-orange-500/80"
              transform="rotate(35 182 89)"
            />
          </g>
        )}

        {season === "summer" && (
          <g className="fill-emerald-500/75 dark:fill-emerald-400/75 pointer-events-none">
            {/* Bamboo Leaf Blade 1 */}
            <path d="M 125,60 C 135,58 145,64 150,70 C 142,68 132,66 125,60 Z" />
            {/* Bamboo Leaf Blade 2 */}
            <path d="M 265,75 C 275,73 285,78 290,85 C 282,83 272,81 265,75 Z" />
          </g>
        )}

        {season === "winter" && (
          <g className="fill-white/80 pointer-events-none">
            {/* Gentle Snowflakes */}
            <circle cx="120" cy="65" r="1.5" className="animate-pulse" />
            <circle cx="180" cy="90" r="1.2" />
            <circle cx="280" cy="80" r="1.8" className="animate-pulse" />
            <circle cx="220" cy="110" r="1" />
          </g>
        )}

        {/* ── 12. Nourish Mystic Dew Aura (Triggered on Water/Nourish) ── */}
        {isNourishing && (
          <g className="pointer-events-none">
            <rect x="160" y="0" width="80" height="160" fill="url(#nourishBeam)" />
            {/* Shimmer particles */}
            <circle cx="185" cy="120" r="2" fill="#34d399" className="animate-ping" />
            <circle cx="215" cy="95" r="2.5" fill="#6ee7b7" className="animate-ping" />
            <circle cx="200" cy="70" r="2" fill="#a7f3d0" className="animate-ping" />
          </g>
        )}
      </svg>
    </div>
  );
}

