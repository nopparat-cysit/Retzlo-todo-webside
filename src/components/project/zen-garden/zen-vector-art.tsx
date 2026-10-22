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
