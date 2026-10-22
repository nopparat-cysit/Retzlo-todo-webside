"use client";

import React from "react";
import { cn } from "@/lib/utils";

/* ── 1. Bonsai Pine (บอนไซสนโบราณ) ── */
export function ZenBonsaiPine({
  className = "h-24 w-24",
  stage = 4, // 1: Seed, 2: Sprout, 3: Sapling, 4: Blooming/Mature, 5: Ancient
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
        {/* Pot Feet */}
        <rect x="30" y="86" width="5" height="2.5" rx="1" className="fill-stone-400 dark:fill-stone-700" />
        <rect x="65" y="86" width="5" height="2.5" rx="1" className="fill-stone-400 dark:fill-stone-700" />
        {/* Soil Mound & Moss */}
        <ellipse cx="50" cy="77" rx="22" ry="4" className="fill-amber-950/70 dark:fill-amber-950" />
        <ellipse cx="44" cy="76" rx="8" ry="2.5" className="fill-emerald-600/70 dark:fill-emerald-600" />
        <ellipse cx="56" cy="77" rx="7" ry="2" className="fill-emerald-700/80 dark:fill-emerald-700" />

        {/* Growth Stage 1: Seed */}
        {stage === 1 && (
          <ellipse cx="50" cy="75" rx="3" ry="2" className="fill-amber-800 stroke-amber-900 animate-pulse" strokeWidth="0.8" />
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
            {/* Gnarled Trunk with Natural Curve */}
            <path
              d="M49 77 C48 68, 41 62, 45 51 C48 43, 56 41, 52 32 C50 26, 44 24, 46 19"
              fill="none"
              stroke="#583c2e"
              strokeWidth={stage === 5 ? "6" : "5"}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Bark Texture Lines */}
            <path d="M48 72 Q44 63 46 55" stroke="#3d281e" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
            <path d="M47 50 Q52 44 50 36" stroke="#3d281e" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />

            {/* Left Branch */}
            <path d="M44 53 C36 49, 31 52, 26 49" fill="none" stroke="#583c2e" strokeWidth="3" strokeLinecap="round" />
            {/* Right Branch */}
            <path d="M53 42 C62 39, 68 44, 75 40" fill="none" stroke="#583c2e" strokeWidth="3.2" strokeLinecap="round" />
            {/* Top Branchlet */}
            <path d="M51 31 C56 26, 61 27, 66 23" fill="none" stroke="#583c2e" strokeWidth="2.4" strokeLinecap="round" />

            {/* Lush Tiered Needle Clouds (Animated Soft Breeze Sway) */}
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

            {/* Middle Lower Foliage Cloud */}
            <g>
              <ellipse cx="44" cy="42" rx="9" ry="5" className="fill-emerald-800 dark:fill-emerald-800" />
              <ellipse cx="45" cy="40" rx="7" ry="4" className="fill-emerald-600 dark:fill-emerald-600" />
            </g>

            {/* Middle Upper Foliage Cloud */}
            <g>
              <ellipse cx="66" cy="22" rx="11" ry="6" className="fill-emerald-700 dark:fill-emerald-700" />
              <ellipse cx="68" cy="20" rx="8" ry="4.5" className="fill-emerald-500 dark:fill-emerald-500" />
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
        {/* Pot */}
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

        {/* 5-Petal Cherry Blossom Flowers */}
        {/* Flower 1: Top Left */}
        <g transform="translate(24, 31)">
          <circle cx="0" cy="0" r="2.5" className="fill-rose-400" />
          <circle cx="0" cy="-6" r="4.2" className="fill-pink-200/90 dark:fill-pink-300/90" />
          <circle cx="5.7" cy="-1.8" r="4.2" className="fill-pink-200/90 dark:fill-pink-300/90" />
          <circle cx="3.5" cy="4.8" r="4.2" className="fill-pink-200/90 dark:fill-pink-300/90" />
          <circle cx="-3.5" cy="4.8" r="4.2" className="fill-pink-200/90 dark:fill-pink-300/90" />
          <circle cx="-5.7" cy="-1.8" r="4.2" className="fill-pink-200/90 dark:fill-pink-300/90" />
          <circle cx="0" cy="0" r="1.5" className="fill-amber-400" />
        </g>

        {/* Flower 2: Center Crest */}
        <g transform="translate(48, 42)">
          <circle cx="0" cy="-6" r="4.5" className="fill-pink-100 dark:fill-pink-200" />
          <circle cx="5.7" cy="-1.8" r="4.5" className="fill-pink-100 dark:fill-pink-200" />
          <circle cx="3.5" cy="4.8" r="4.5" className="fill-pink-100 dark:fill-pink-200" />
          <circle cx="-3.5" cy="4.8" r="4.5" className="fill-pink-100 dark:fill-pink-200" />
          <circle cx="-5.7" cy="-1.8" r="4.5" className="fill-pink-100 dark:fill-pink-200" />
          <circle cx="0" cy="0" r="2" className="fill-rose-400" />
          <circle cx="0" cy="0" r="1.2" className="fill-amber-300" />
        </g>

        {/* Flower 3: Right Upper */}
        <g transform="translate(74, 33)">
          <circle cx="0" cy="-5" r="4" className="fill-pink-200 dark:fill-pink-300" />
          <circle cx="4.7" cy="-1.5" r="4" className="fill-pink-200 dark:fill-pink-300" />
          <circle cx="2.9" cy="4" r="4" className="fill-pink-200 dark:fill-pink-300" />
          <circle cx="-2.9" cy="4" r="4" className="fill-pink-200 dark:fill-pink-300" />
          <circle cx="-4.7" cy="-1.5" r="4" className="fill-pink-200 dark:fill-pink-300" />
          <circle cx="0" cy="0" r="1.8" className="fill-rose-400" />
        </g>

        {/* Flower 4: Top High */}
        <g transform="translate(75, 23)">
          <circle cx="0" cy="-4" r="3.2" className="fill-pink-100 dark:fill-pink-200" />
          <circle cx="3.8" cy="-1.2" r="3.2" className="fill-pink-100 dark:fill-pink-200" />
          <circle cx="2.3" cy="3.2" r="3.2" className="fill-pink-100 dark:fill-pink-200" />
          <circle cx="-2.3" cy="3.2" r="3.2" className="fill-pink-100 dark:fill-pink-200" />
          <circle cx="-3.8" cy="-1.2" r="3.2" className="fill-pink-100 dark:fill-pink-200" />
          <circle cx="0" cy="0" r="1.2" className="fill-rose-400" />
        </g>

        {/* Buds and Leaf Shoots */}
        <ellipse cx="27" cy="53" rx="2.5" ry="4" className="fill-pink-300" transform="rotate(-30 27 53)" />
        <ellipse cx="58" cy="33" rx="2" ry="3.5" className="fill-emerald-500" transform="rotate(40 58 33)" />
        <ellipse cx="36" cy="42" rx="1.8" ry="3" className="fill-emerald-500" transform="rotate(-40 36 42)" />

        {/* Animated Falling Sakura Petals */}
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
        {/* Pot */}
        <ellipse cx="50" cy="86" rx="28" ry="6" className="fill-stone-800/20 dark:fill-black/40 blur-[1px]" />
        <path
          d="M30 81 L33 88 Q50 90 67 88 L70 81 Z"
          className="fill-stone-200 stroke-stone-400 dark:fill-stone-800 dark:stroke-stone-600"
          strokeWidth="1.5"
        />
        <ellipse cx="50" cy="81" rx="20" ry="4" className="fill-stone-100 stroke-stone-400 dark:fill-stone-900 dark:stroke-stone-600" strokeWidth="1.5" />
        <ellipse cx="50" cy="80.5" rx="16" ry="3" className="fill-amber-950/70" />

        {/* 3 Stalks of Bamboo with Segment Nodes */}
        {/* Stalk 1 (Left): Slight Tilt */}
        <g className="animate-[wiggle_6s_ease-in-out_infinite] origin-bottom">
          <rect x="36" y="66" width="4.5" height="14" rx="1" className="fill-emerald-600 stroke-emerald-700" strokeWidth="0.8" />
          <rect x="35" y="51" width="4.5" height="14" rx="1" className="fill-emerald-500 stroke-emerald-700" strokeWidth="0.8" />
          <rect x="34" y="36" width="4.5" height="14" rx="1" className="fill-emerald-500 stroke-emerald-700" strokeWidth="0.8" />
          <rect x="33" y="22" width="4" height="13" rx="1" className="fill-emerald-400 stroke-emerald-600" strokeWidth="0.8" />
          {/* Bamboo Leaves */}
          <path d="M34 51 Q24 48 18 53 Q26 53 34 52" className="fill-emerald-500" />
          <path d="M34 36 Q22 32 15 38 Q24 38 34 37" className="fill-emerald-400" />
          <path d="M33 22 Q23 15 17 21 Q25 21 33 23" className="fill-emerald-400" />
        </g>

        {/* Stalk 2 (Center): Tallest */}
        <g className="animate-[wiggle_7s_ease-in-out_infinite] origin-bottom">
          <rect x="48" y="65" width="5.5" height="15" rx="1" className="fill-teal-700 stroke-teal-800" strokeWidth="0.8" />
          <rect x="48" y="49" width="5.5" height="15" rx="1" className="fill-teal-600 stroke-teal-700" strokeWidth="0.8" />
          <rect x="48" y="33" width="5" height="15" rx="1" className="fill-teal-500 stroke-teal-600" strokeWidth="0.8" />
          <rect x="48.5" y="17" width="4.5" height="15" rx="1" className="fill-emerald-400 stroke-emerald-500" strokeWidth="0.8" />
          {/* Bamboo Leaves Right & Left */}
          <path d="M53 49 Q64 45 72 49 Q63 51 53 50" className="fill-emerald-500" />
          <path d="M48 33 Q38 27 30 31 Q39 33 48 34" className="fill-emerald-400" />
          <path d="M53 33 Q66 28 74 33 Q64 34 53 34" className="fill-emerald-400" />
          <path d="M49 17 Q40 8 32 13 Q41 15 49 18" className="fill-emerald-300" />
          <path d="M53 17 Q63 8 71 14 Q61 15 53 18" className="fill-emerald-300" />
        </g>

        {/* Stalk 3 (Right): Slender */}
        <g className="animate-[wiggle_5.5s_ease-in-out_infinite] origin-bottom">
          <rect x="60" y="67" width="4.5" height="13" rx="1" className="fill-emerald-600 stroke-emerald-700" strokeWidth="0.8" />
          <rect x="61" y="53" width="4.5" height="13" rx="1" className="fill-emerald-500 stroke-emerald-700" strokeWidth="0.8" />
          <rect x="62" y="39" width="4" height="13" rx="1" className="fill-emerald-400 stroke-emerald-600" strokeWidth="0.8" />
          {/* Leaves */}
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
        {/* Shadow */}
        <ellipse cx="50" cy="78" rx="42" ry="14" className="fill-stone-800/20 dark:fill-black/50 blur-[2px]" />

        {/* Carved Stone Tsukubai Basin */}
        <ellipse cx="50" cy="72" rx="40" ry="13" className="fill-stone-300 stroke-stone-400 dark:fill-stone-800 dark:stroke-stone-700" strokeWidth="2" />
        <ellipse cx="50" cy="69" rx="36" ry="11" className="fill-sky-800/80 stroke-stone-400 dark:fill-sky-950 dark:stroke-stone-700" strokeWidth="1.5" />

        {/* Water Surface Inner Glow */}
        <ellipse cx="50" cy="69" rx="34" ry="10" className="fill-cyan-400/20 dark:fill-cyan-500/10" />

        {/* Swimming Orange Koi Fish (Rotates in loop) */}
        <g className="animate-[spin_12s_linear_infinite] origin-[50px_69px]">
          {/* Koi Body */}
          <g transform="translate(68, 69) rotate(90)">
            <ellipse cx="0" cy="0" rx="3" ry="7" className="fill-amber-500" />
            <path d="M0 6 L-2 11 L2 11 Z" className="fill-amber-400" />
            <circle cx="-1.5" cy="-4" r="0.8" className="fill-stone-900" />
            <circle cx="1.5" cy="-4" r="0.8" className="fill-stone-900" />
            <ellipse cx="0" cy="-1" rx="1.8" ry="3" className="fill-white/80" />
          </g>
        </g>

        {/* Floating Green Water Lily Pad with Notch */}
        <g transform="translate(36, 68)">
          <path
            d="M0 0 M-14 0 A14 7 0 1 1 14 0 A14 7 0 0 1 3 6 L0 0 Z"
            className="fill-emerald-600 stroke-emerald-700 dark:fill-emerald-700 dark:stroke-emerald-800"
            strokeWidth="0.8"
          />
          <path d="M0 0 L-10 -3" stroke="#047857" strokeWidth="0.6" opacity="0.6" />
          <path d="M0 0 L-6 5" stroke="#047857" strokeWidth="0.6" opacity="0.6" />
          <path d="M0 0 L8 -4" stroke="#047857" strokeWidth="0.6" opacity="0.6" />
        </g>

        {/* Blooming Multi-Tiered Sacred Lotus Flower */}
        <g transform="translate(56, 62)">
          {/* Outer Petals */}
          <ellipse cx="-8" cy="0" rx="5" ry="9" className="fill-purple-300 dark:fill-purple-400" transform="rotate(-35 -8 0)" />
          <ellipse cx="8" cy="0" rx="5" ry="9" className="fill-purple-300 dark:fill-purple-400" transform="rotate(35 8 0)" />
          <ellipse cx="-4" cy="-2" rx="4.5" ry="9" className="fill-pink-200 dark:fill-pink-300" transform="rotate(-15 -4 -2)" />
          <ellipse cx="4" cy="-2" rx="4.5" ry="9" className="fill-pink-200 dark:fill-pink-300" transform="rotate(15 4 -2)" />
          {/* Center Petal & Core */}
          <ellipse cx="0" cy="-4" rx="4" ry="10" className="fill-white dark:fill-purple-100" />
          <circle cx="0" cy="0" r="3.2" className="fill-amber-400" />
          <circle cx="0" cy="0" r="1.5" className="fill-amber-600" />
        </g>

        {/* Ambient Water Ripples */}
        <ellipse cx="50" cy="69" rx="20" ry="5.5" className="stroke-cyan-200/50 dark:stroke-cyan-400/20 animate-ping" strokeWidth="0.8" style={{ animationDuration: "3s" }} />
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

        {/* Trunk */}
        <path
          d="M50 80 C50 67, 44 58, 48 48 C51 40, 56 36, 51 26"
          fill="none"
          stroke="#553a2b"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path d="M48 51 C40 46, 32 46, 25 41" fill="none" stroke="#553a2b" strokeWidth="2.8" strokeLinecap="round" />
        <path d="M50 43 C60 38, 68 40, 76 34" fill="none" stroke="#553a2b" strokeWidth="2.8" strokeLinecap="round" />

        {/* Fan-Shaped Radiant Golden Ginkgo Leaves */}
        {/* Left Cluster */}
        <g transform="translate(26, 40)">
          <path d="M0 0 C-8 -10, -14 0, -8 8 C-3 4, -1 1, 0 0 Z" className="fill-amber-400 stroke-amber-500" strokeWidth="0.8" />
          <path d="M0 0 C-4 -12, 6 -10, 4 -2 C1 -1, 0 0, 0 0 Z" className="fill-yellow-400 stroke-amber-500" strokeWidth="0.8" />
        </g>
        {/* Right Cluster */}
        <g transform="translate(76, 33)">
          <path d="M0 0 C8 -8, 14 2, 7 8 C3 4, 1 1, 0 0 Z" className="fill-yellow-400 stroke-amber-500" strokeWidth="0.8" />
          <path d="M0 0 C4 -12, -6 -10, -4 -2 C-1 -1, 0 0, 0 0 Z" className="fill-amber-400 stroke-amber-500" strokeWidth="0.8" />
        </g>
        {/* Crown Cluster */}
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

/* ── 6. Japanese Stone Toro Lantern (โคมไฟหินเซน) ── */
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

        {/* Hexagonal Stone Base */}
        <polygon points="34,88 66,88 62,81 38,81" className="fill-stone-300 stroke-stone-500 dark:fill-stone-800 dark:stroke-stone-700" strokeWidth="1.5" />
        {/* Central Pillar */}
        <rect x="44" y="58" width="12" height="23" rx="1.5" className="fill-stone-300 stroke-stone-500 dark:fill-stone-800 dark:stroke-stone-700" strokeWidth="1.5" />
        {/* Middle Platform */}
        <polygon points="32,58 68,58 63,53 37,53" className="fill-stone-300 stroke-stone-500 dark:fill-stone-800 dark:stroke-stone-700" strokeWidth="1.5" />

        {/* Lantern Fire Chamber (Hibukuro) */}
        <rect x="39" y="40" width="22" height="13" rx="2" className="fill-stone-900 stroke-stone-600 dark:fill-stone-950 dark:stroke-stone-700" strokeWidth="1.2" />
        {/* Lattice Windows */}
        <rect x="42" y="42" width="7" height="9" rx="1" className="fill-amber-200/90 dark:fill-amber-300/90 shadow-sm" />
        <rect x="51" y="42" width="7" height="9" rx="1" className="fill-amber-200/90 dark:fill-amber-300/90 shadow-sm" />

        {/* Inner Flame Glow Effect */}
        <circle cx="50" cy="46" r="5" className="fill-amber-400/80 animate-ping" style={{ animationDuration: "2s" }} />
        <circle cx="50" cy="46" r="3" className="fill-amber-300 animate-pulse" />

        {/* Flared Pagoda Roof (Kasa) */}
        <path
          d="M20 40 Q50 37 80 40 L68 28 Q50 25 32 28 Z"
          className="fill-stone-400 stroke-stone-600 dark:fill-stone-700 dark:stroke-stone-600"
          strokeWidth="1.5"
        />
        {/* Top Jewel (Hoju) */}
        <ellipse cx="50" cy="27" rx="8" ry="3" className="fill-stone-300 stroke-stone-500 dark:fill-stone-800" strokeWidth="1.2" />
        <circle cx="50" cy="21" r="4.5" className="fill-stone-300 stroke-stone-500 dark:fill-stone-800" strokeWidth="1.2" />
        <path d="M50 16 L50 13" stroke="#78716c" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/* ── 7. Sleeping Ginger Cat (เจ้าแมวส้มหลับปุ๋ย) ── */
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
        {/* Soft Shadow */}
        <ellipse cx="50" cy="68" rx="36" ry="8" className="fill-stone-800/15 dark:fill-black/40 blur-[1.5px]" />

        {/* Tatami Mat Cushion */}
        <ellipse cx="50" cy="65" rx="34" ry="7" className="fill-emerald-100 stroke-emerald-300 dark:fill-emerald-950 dark:stroke-emerald-800" strokeWidth="1.2" />

        {/* Cat Curled Body (Breathing Animation) */}
        <g className="animate-[pulse_3.5s_ease-in-out_infinite] origin-center">
          {/* Main Body Oval */}
          <ellipse cx="50" cy="50" rx="25" ry="17" className="fill-amber-500 dark:fill-amber-600" />
          {/* Lighter Underbelly */}
          <ellipse cx="52" cy="53" rx="18" ry="11" className="fill-amber-200/90 dark:fill-amber-200/80" />

          {/* Tabby Stripes */}
          <path d="M42 36 Q45 42 42 46" stroke="#b45309" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M50 35 Q53 41 50 45" stroke="#b45309" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M58 36 Q61 42 58 46" stroke="#b45309" strokeWidth="1.8" strokeLinecap="round" />

          {/* Curled Tail Wrapped Around */}
          <path
            d="M72 55 C77 50, 75 40, 68 40 C63 40, 64 45, 68 45"
            fill="none"
            stroke="#d97706"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* White Tail Tip */}
          <circle cx="68" cy="43" r="2.5" className="fill-white" />

          {/* Cat Head */}
          <circle cx="33" cy="46" r="12" className="fill-amber-500 dark:fill-amber-600" />

          {/* Cat Ears */}
          <polygon points="26,37 32,26 35,37" className="fill-amber-600" />
          <polygon points="28,36 32,29 34,36" className="fill-pink-200" />
          <polygon points="36,37 42,27 45,38" className="fill-amber-600" />
          <polygon points="38,36 42,30 43,37" className="fill-pink-200" />

          {/* Sleeping Closed Eyes (Content Smile Curves) */}
          <path d="M26 47 Q29 50 32 47" stroke="#78350f" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          <path d="M34 47 Q37 50 40 47" stroke="#78350f" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          {/* Nose & Whiskers */}
          <circle cx="33" cy="51" r="1.2" className="fill-pink-400" />
          <line x1="24" y1="51" x2="18" y2="50" stroke="#92400e" strokeWidth="0.8" />
          <line x1="24" y1="53" x2="19" y2="54" stroke="#92400e" strokeWidth="0.8" />
          <line x1="42" y1="51" x2="48" y2="50" stroke="#92400e" strokeWidth="0.8" />
          <line x1="42" y1="53" x2="47" y2="54" stroke="#92400e" strokeWidth="0.8" />
        </g>

        {/* Gentle "Zzz" Sleep Floating Indicator */}
        <g className="animate-[bounce_4s_ease-in-out_infinite] origin-center opacity-70">
          <text x="20" y="24" className="font-mono text-[9px] font-bold fill-indigo-600 dark:fill-dusk-lavender select-none">z</text>
          <text x="14" y="16" className="font-mono text-[11px] font-bold fill-indigo-600 dark:fill-dusk-lavender select-none">Z</text>
        </g>
      </svg>
    </div>
  );
}

/* ── 8. Unified Flora & Element Renderer ── */
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
    case "lantern":
      return <ZenStoneLantern className={className} />;
    case "cat":
      return <ZenSleepyCat className={className} />;
    default:
      // Default / Sprout fallback
      return <ZenBonsaiPine className={className} stage={stage || 2} />;
  }
}
