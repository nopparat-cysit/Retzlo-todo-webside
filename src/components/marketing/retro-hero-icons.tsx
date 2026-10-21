import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

/**
 * Bespoke Retro Lofi Vector Icons
 * Styled to strictly match Retzlo's Retro Lofi Indigo Theme:
 * Lilac (#D8B9FF), Deep Violet (#7858D4), Sunset Pink (#F0B0D7 / #DB2777),
 * Buttercream (#FFECB1), Emerald Mint (#34D399), Eggplant Outline (#432369 / currentColor).
 */

// 1. Retro Kanban Board Icon
export function RetroKanbanIcon({ className = "w-5 h-5", size, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Outer tactile board frame */}
      <rect x="2.5" y="3" width="19" height="18" rx="3.5" fill="currentColor" fillOpacity="0.08" />
      {/* Column 1 - To Do with Card */}
      <rect x="4.5" y="5.5" width="4" height="13" rx="1.5" fill="none" strokeDasharray="2 2" strokeOpacity="0.4" />
      <rect x="5.25" y="7" width="2.5" height="4" rx="0.75" fill="#D8B9FF" stroke="#7858D4" strokeWidth="1" />
      {/* Column 2 - In Progress with Card */}
      <rect x="10" y="5.5" width="4" height="13" rx="1.5" fill="none" strokeDasharray="2 2" strokeOpacity="0.4" />
      <rect x="10.75" y="8" width="2.5" height="5" rx="0.75" fill="#FFECB1" stroke="#D97706" strokeWidth="1" />
      {/* Column 3 - Done with Card */}
      <rect x="15.5" y="5.5" width="4" height="13" rx="1.5" fill="none" strokeDasharray="2 2" strokeOpacity="0.4" />
      <rect x="16.25" y="7" width="2.5" height="4" rx="0.75" fill="#A7F3D0" stroke="#059669" strokeWidth="1" />
      {/* Checkmark inside Done card */}
      <path d="M16.9 9l0.5 0.6 0.8-0.9" stroke="#059669" strokeWidth="0.8" fill="none" />
    </svg>
  );
}

// 2. Retro Sync Calendar Icon
export function RetroCalendarIcon({ className = "w-5 h-5", size, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Calendar body */}
      <rect x="3" y="4.5" width="18" height="16.5" rx="3.5" fill="currentColor" fillOpacity="0.08" />
      {/* Calendar top accent bar */}
      <path d="M3 9.5H21" stroke="currentColor" strokeWidth="1.5" />
      {/* Spiral binder clips */}
      <path d="M7 2.5V5.5M12 2.5V5.5M17 2.5V5.5" stroke="#7858D4" strokeWidth="2" strokeLinecap="round" />
      {/* Date grid dots */}
      <circle cx="7.5" cy="13" r="1.2" fill="#D8B9FF" stroke="#7858D4" strokeWidth="0.8" />
      <circle cx="12" cy="13" r="1.2" fill="#D8B9FF" stroke="#7858D4" strokeWidth="0.8" />
      <circle cx="16.5" cy="13" r="1.2" fill="#FFB4D5" stroke="#DB2777" strokeWidth="0.8" />
      <circle cx="7.5" cy="17" r="1.2" fill="#D8B9FF" stroke="#7858D4" strokeWidth="0.8" />
      {/* Highlighted active deadline with star badge */}
      <rect x="10.8" y="15.8" width="2.4" height="2.4" rx="0.6" fill="#FDE68A" stroke="#D97706" strokeWidth="0.8" />
      <circle cx="16.5" cy="17" r="1.2" fill="#A7F3D0" stroke="#059669" strokeWidth="0.8" />
    </svg>
  );
}

// 3. Retro Spiral Notebook & Diary Icon
export function RetroNotebookIcon({ className = "w-5 h-5", size, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Notebook Cover */}
      <rect x="5.5" y="3" width="15.5" height="18" rx="3" fill="currentColor" fillOpacity="0.08" />
      {/* Ruled lines */}
      <path d="M9.5 8H17.5M9.5 12H16M9.5 16H14" stroke="currentColor" strokeWidth="1.4" strokeOpacity="0.6" />
      {/* Bookmark Ribbon hanging at bottom */}
      <path d="M14 3V9.5L16 8L18 9.5V3" fill="#F0B0D7" stroke="#DB2777" strokeWidth="1.2" strokeLinejoin="round" />
      {/* Left Spiral Rings */}
      <path d="M4 6.5H6.5M4 10.5H6.5M4 14.5H6.5M4 18.5H6.5" stroke="#7858D4" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 4. Retro AI & Rewards Spark Icon
export function RetroAiRewardIcon({ className = "w-5 h-5", size, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Cute Cassette AI Robot Head */}
      <rect x="3.5" y="6" width="17" height="13.5" rx="3.5" fill="currentColor" fillOpacity="0.08" />
      {/* Robot Antenna with glowing orb */}
      <path d="M12 2.5V6" stroke="#7858D4" strokeWidth="1.8" />
      <circle cx="12" cy="2.5" r="1.5" fill="#FDE68A" stroke="#D97706" strokeWidth="1" />
      {/* Pixel robot eyes */}
      <rect x="6.5" y="9.5" width="2.5" height="2.5" rx="0.6" fill="#7858D4" />
      <rect x="15" y="9.5" width="2.5" height="2.5" rx="0.6" fill="#7858D4" />
      {/* Cassette reel smile */}
      <path d="M9 15.5C10 16.5 14 16.5 15 15.5" stroke="#7858D4" strokeWidth="1.5" strokeLinecap="round" />
      {/* Floating Magic Sparkle */}
      <path d="M20 3L20.8 4.8L22.5 5.5L20.8 6.2L20 8L19.2 6.2L17.5 5.5L19.2 4.8Z" fill="#FDE68A" stroke="#D97706" strokeWidth="0.8" strokeLinejoin="round" />
    </svg>
  );
}

// 5. Retro Ticket Stub Icon (Free 7-Day Pass)
export function RetroTicketIcon({ className = "w-4 h-4", size, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Ticket Body with Notches */}
      <path
        d="M3 8C4.5 8 5.5 7 5.5 5.5V5C5.5 4.4 6 4 6.5 4H17.5C18.1 4 18.5 4.4 18.5 5V5.5C18.5 7 19.5 8 21 8C21.6 8 22 8.4 22 9V15C22 15.6 21.6 16 21 16C19.5 16 18.5 17 18.5 18.5V19C18.5 19.6 18.1 20 17.5 20H6.5C6 20 5.5 19.6 5.5 19V18.5C5.5 17 4.5 16 3 16C2.4 16 2 15.6 2 15V9C2 8.4 2.4 8 3 8Z"
        fill="currentColor"
        fillOpacity="0.12"
      />
      {/* Dashed perforated line */}
      <path d="M15 5V19" stroke="currentColor" strokeDasharray="2 2" strokeWidth="1.2" strokeOpacity="0.6" />
      {/* Star symbol inside ticket */}
      <path d="M9.5 9.5L10.2 11.2L12 11.5L10.7 12.8L11 14.5L9.5 13.6L8 14.5L8.3 12.8L7 11.5L8.8 11.2Z" fill="#FDE68A" stroke="#D97706" strokeWidth="0.8" strokeLinejoin="round" />
    </svg>
  );
}

// 6. Retro Mini Game Icon (Arcade / Coin Mini Game)
export function RetroMiniGameIcon({ className = "w-4 h-4", size, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Handheld Game Body */}
      <rect x="5" y="3" width="14" height="18" rx="3.5" fill="currentColor" fillOpacity="0.1" />
      {/* Screen */}
      <rect x="7" y="5" width="10" height="7" rx="1.5" fill="#D8B9FF" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.2" />
      {/* D-Pad */}
      <path d="M8.5 16H10.5M9.5 15V17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      {/* Action Buttons */}
      <circle cx="15.5" cy="15.5" r="1.1" fill="#F0B0D7" stroke="#DB2777" strokeWidth="0.8" />
      <circle cx="14" cy="17" r="1.1" fill="#FFECB1" stroke="#D97706" strokeWidth="0.8" />
    </svg>
  );
}

// 7. Retro Audio Deck / Walkman Icon (Focus Radio)
export function RetroAudioDeckIcon({ className = "w-5 h-5", size, isPlaying = false, ...props }: IconProps & { isPlaying?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Walkman Body */}
      <rect x="3" y="4" width="18" height="16" rx="3.5" fill="currentColor" fillOpacity="0.12" />
      {/* Cassette Window */}
      <rect x="5.5" y="7" width="13" height="7.5" rx="2" fill="#D8B9FF" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.2" />
      {/* Left Reel */}
      <g className={isPlaying ? "animate-spin origin-[8.5px_10.8px]" : undefined}>
        <circle cx="8.5" cy="10.8" r="1.8" fill="#FFF5FC" stroke="#7858D4" strokeWidth="1" />
        <circle cx="8.5" cy="10.8" r="0.6" fill="#7858D4" />
      </g>
      {/* Right Reel */}
      <g className={isPlaying ? "animate-spin origin-[15.5px_10.8px]" : undefined}>
        <circle cx="15.5" cy="10.8" r="1.8" fill="#FFF5FC" stroke="#7858D4" strokeWidth="1" />
        <circle cx="15.5" cy="10.8" r="0.6" fill="#7858D4" />
      </g>
      {/* Tape connecting strip */}
      <path d="M8.5 12H15.5" stroke="#7858D4" strokeWidth="0.8" strokeDasharray="1 1" />
      {/* Bottom control buttons */}
      <circle cx="7" cy="17" r="1" fill="currentColor" fillOpacity="0.5" />
      <circle cx="10" cy="17" r="1" fill="currentColor" fillOpacity="0.5" />
      {/* Audio Wave / EQ Indicator */}
      <path d="M14 17.5V16.5M16 18V16M18 17.5V16.5" stroke="#10B981" strokeWidth="1.2" />
    </svg>
  );
}

// 8. Retro Studio Tour Icon (Interactive Rooms Tour)
export function RetroStudioTourIcon({ className = "w-5 h-5", size, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="3.5" width="18" height="13" rx="3" fill="currentColor" fillOpacity="0.08" />
      <path d="M7 8.5H12M7 11.5H15M7 14.5H10" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="6" width="5" height="5" rx="1.5" fill="#D8B9FF" stroke="#7858D4" strokeWidth="1" />
      <path d="M9 19.5L12 16.5L15 19.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 21H17" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

/**
 * 9. RetroCozyStudioMascot (Crisp Vector Mascot Badge)
 * Used in the radio companion bar instead of pixelated raster mascot.
 * 100% vector SVG, razor-sharp on all screen resolutions, animated on play.
 */
export function RetroCozyStudioMascot({
  className = "w-9 h-9",
  isPlaying = false,
  ...props
}: {
  className?: string;
  isPlaying?: boolean;
} & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Background Squircle with soft warm gradient */}
      <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#lofiMascotBg)" stroke="#54356B" strokeWidth="1.5" />

      {/* Retro Walkman Cassette Player */}
      <rect x="9" y="14" width="30" height="23" rx="5" fill="#D8B9FF" stroke="#432369" strokeWidth="1.6" />
      <rect x="13" y="18" width="22" height="11" rx="3" fill="#FFF5FC" stroke="#432369" strokeWidth="1.2" />

      {/* Cassette Tape Reels */}
      <g className={isPlaying ? "animate-spin origin-[18px_23.5px]" : undefined}>
        <circle cx="18" cy="23.5" r="3.2" fill="#D8B9FF" stroke="#432369" strokeWidth="1.2" />
        <circle cx="18" cy="23.5" r="1.1" fill="#432369" />
        <path d="M16 23.5H20M18 21.5V25.5" stroke="#432369" strokeWidth="0.8" />
      </g>
      <g className={isPlaying ? "animate-spin origin-[29.5px_23.5px]" : undefined}>
        <circle cx="29.5" cy="23.5" r="3.2" fill="#D8B9FF" stroke="#432369" strokeWidth="1.2" />
        <circle cx="29.5" cy="23.5" r="1.1" fill="#432369" />
        <path d="M27.5 23.5H31.5M29.5 21.5V25.5" stroke="#432369" strokeWidth="0.8" />
      </g>

      {/* Tape ribbon visible */}
      <rect x="21.5" y="22" width="4.5" height="3" rx="0.5" fill="#F0B0D7" />

      {/* Headphones resting over cassette */}
      <path
        d="M10 17C10 9.5 38 9.5 38 17"
        stroke="#7858D4"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <rect x="6.5" y="16" width="4.5" height="8" rx="2.2" fill="#7858D4" stroke="#432369" strokeWidth="1.2" />
      <rect x="37" y="16" width="4.5" height="8" rx="2.2" fill="#7858D4" stroke="#432369" strokeWidth="1.2" />

      {/* Floating Little Musical Note / Star */}
      <path
        d="M36 6L37 7.8L39 8.5L37 9.2L36 11L35 9.2L33 8.5L35 7.8Z"
        fill="#FFECB1"
        stroke="#54356B"
        strokeWidth="0.8"
      />
      {isPlaying && (
        <circle cx="8" cy="9" r="1.5" fill="#34D399" className="animate-pulse" />
      )}

      {/* Gradient Definitions */}
      <defs>
        <linearGradient id="lofiMascotBg" x1="2" y1="2" x2="46" y2="46" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF9EB" />
          <stop offset="1" stopColor="#F5E4FF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * 10. RetroCozyStudioIllustration (Full Vector Hero Studio Art)
 * Crisp, hand-drawn vector scene depicting a cozy lofi twilight desk:
 * - Retro computer with Kanban boards
 * - Glowing desk lamp casting warm light
 * - Retro cassette tape deck with spinning reels
 * - Steaming coffee mug
 * - Sakura bonsai & starry window
 * 100% Vector SVG — completely zero blurriness, infinite sharpness!
 */
export function RetroCozyStudioIllustration({
  className = "w-full h-full",
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 640 440"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Cozy Lofi Studio Illustration"
      {...props}
    >
      <defs>
        {/* Twilight Window Sky Gradient */}
        <linearGradient id="twilightSky" x1="0" y1="0" x2="0" y2="280" gradientUnits="userSpaceOnUse">
          <stop stopColor="#372061" />
          <stop offset="0.45" stopColor="#5D3A8F" />
          <stop offset="0.75" stopColor="#9E69B5" />
          <stop offset="1" stopColor="#F8B4D9" />
        </linearGradient>

        {/* Desk Surface Warm Wood */}
        <linearGradient id="deskWood" x1="0" y1="280" x2="0" y2="440" gradientUnits="userSpaceOnUse">
          <stop stopColor="#543628" />
          <stop offset="0.08" stopColor="#7E4C33" />
          <stop offset="0.4" stopColor="#693C27" />
          <stop offset="1" stopColor="#3D2115" />
        </linearGradient>

        {/* Lamp Cone Warm Glow */}
        <linearGradient id="lampLightCone" x1="480" y1="120" x2="380" y2="340" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF7D6" stopOpacity="0.45" />
          <stop offset="0.6" stopColor="#FFE4A0" stopOpacity="0.2" />
          <stop offset="1" stopColor="#FFE4A0" stopOpacity="0" />
        </linearGradient>

        {/* Cassette Lavender Gradient */}
        <linearGradient id="cassetteBody" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#D8B9FF" />
          <stop offset="1" stopColor="#B388EB" />
        </linearGradient>

        {/* Laptop Screen Soft Radiance */}
        <linearGradient id="screenGlow" x1="220" y1="170" x2="360" y2="290" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FAF5FF" />
          <stop offset="1" stopColor="#E9D8FD" />
        </linearGradient>
      </defs>

      {/* ── Background Wall & Window ────────────────────────────────────── */}
      <rect width="640" height="440" fill="#2B1748" />

      {/* Window Frame with Twilight Sky */}
      <rect x="36" y="20" width="568" height="260" rx="14" fill="url(#twilightSky)" stroke="#4A2D75" strokeWidth="4" />

      {/* Window Panes Grid */}
      <path d="M320 20V280M36 150H604" stroke="#4A2D75" strokeWidth="3.5" strokeOpacity="0.6" />

      {/* Distant Hills & Pine Trees in Twilight */}
      <path
        d="M36 240Q140 185 240 220T450 200T604 235V280H36Z"
        fill="#4A2668"
        fillOpacity="0.85"
      />
      <path
        d="M36 255Q180 230 320 250T604 240V280H36Z"
        fill="#341A4B"
      />

      {/* Twilight Crescent Moon */}
      <path
        d="M350 55A16 16 0 0 0 366 39A18 18 0 1 1 350 55Z"
        fill="#FFF2C6"
      />

      {/* Twinkling Pixel Stars */}
      <circle cx="120" cy="65" r="1.5" fill="#FFEAA7" />
      <circle cx="210" cy="85" r="2" fill="#FFEAA7" />
      <circle cx="280" cy="45" r="1.5" fill="#FFEAA7" />
      <circle cx="430" cy="70" r="2.2" fill="#FFEAA7" />
      <circle cx="510" cy="95" r="1.8" fill="#FFEAA7" />
      <circle cx="560" cy="50" r="1.5" fill="#FFEAA7" />
      <path d="M160 48L162 53L167 55L162 57L160 62L158 57L153 55L158 53Z" fill="#FFF9DB" />
      <path d="M470 42L471.5 46.5L476 48L471.5 49.5L470 54L468.5 49.5L464 48L468.5 46.5Z" fill="#FFF9DB" />

      {/* Fairy Lights string across top of window */}
      <path d="M36 28Q170 45 320 35Q470 48 604 28" stroke="#FFEAA7" strokeWidth="1" strokeDasharray="2 6" fill="none" />
      {[70, 130, 190, 260, 320, 380, 450, 520, 575].map((x, i) => (
        <circle key={i} cx={x} cy={32 + (i % 2 === 0 ? 3 : -1)} r="3" fill="#FDE68A" filter="drop-shadow(0 0 4px #FBBF24)" />
      ))}

      {/* ── Wooden Study Desk ────────────────────────────────────────── */}
      <rect x="0" y="275" width="640" height="165" fill="url(#deskWood)" />
      {/* Desk top edge bevel highlight */}
      <line x1="0" y1="275" x2="640" y2="275" stroke="#9A6043" strokeWidth="2.5" />
      <line x1="0" y1="282" x2="640" y2="282" stroke="#402315" strokeWidth="2" />

      {/* ── Lamp Light Cone (Soft Radiant Ambience) ─────────────────────── */}
      <polygon points="495,115 310,390 570,390" fill="url(#lampLightCone)" />

      {/* ── Vintage Brass Desk Lamp ────────────────────────────────────── */}
      <g id="lamp">
        {/* Lamp Base */}
        <ellipse cx="510" cy="315" rx="26" ry="9" fill="#B45309" stroke="#3F1D06" strokeWidth="2" />
        <ellipse cx="510" cy="312" rx="22" ry="6" fill="#F59E0B" />
        {/* Curved Neck */}
        <path
          d="M510 310C510 250 535 180 500 135C492 125 478 120 468 122"
          stroke="#D97706"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M510 310C510 250 535 180 500 135C492 125 478 120 468 122"
          stroke="#FCD34D"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Lamp Hood/Shade */}
        <path
          d="M455 125L490 100C498 108 505 124 496 138L455 125Z"
          fill="#B45309"
        />
        <path
          d="M452 123L480 148C465 162 440 152 432 136L452 123Z"
          fill="#F59E0B"
          stroke="#3F1D06"
          strokeWidth="2"
        />
        {/* Glowing Bulb */}
        <circle cx="452" cy="138" r="9" fill="#FFFBEB" filter="drop-shadow(0 0 10px #FBBF24)" />
      </g>

      {/* ── Laptop with Retzlo Kanban Workspace ───────────────────────── */}
      <g id="laptop">
        {/* Laptop Screen Body */}
        <rect x="205" y="150" width="180" height="122" rx="8" fill="#1E1233" stroke="#432369" strokeWidth="3" />
        {/* Screen Display */}
        <rect x="212" y="157" width="166" height="106" rx="5" fill="url(#screenGlow)" />
        {/* Mock Window Top Bar */}
        <rect x="212" y="157" width="166" height="13" fill="#58348C" />
        <circle cx="219" cy="163.5" r="2.2" fill="#FB7185" />
        <circle cx="225" cy="163.5" r="2.2" fill="#FBBF24" />
        <circle cx="231" cy="163.5" r="2.2" fill="#34D399" />
        <text x="240" y="166" fill="#F3E8FF" fontSize="6.5" fontFamily="sans-serif" fontWeight="bold">retzlo workspace</text>

        {/* 3 Kanban Columns on Laptop Screen */}
        {/* Col 1: Todo */}
        <rect x="216" y="174" width="48" height="84" rx="3" fill="#EDE4FF" />
        <text x="220" y="182" fill="#6B3CA8" fontSize="6" fontWeight="bold">TO DO</text>
        <rect x="219" y="186" width="42" height="14" rx="2" fill="#FFFFFF" stroke="#D8B9FF" strokeWidth="0.8" />
        <rect x="222" y="190" width="28" height="2.5" rx="1" fill="#7858D4" />
        <rect x="219" y="203" width="42" height="14" rx="2" fill="#FFFFFF" stroke="#D8B9FF" strokeWidth="0.8" />
        <rect x="222" y="207" width="34" height="2.5" rx="1" fill="#7858D4" />

        {/* Col 2: Doing */}
        <rect x="271" y="174" width="48" height="84" rx="3" fill="#FFF3D6" />
        <text x="275" y="182" fill="#B45309" fontSize="6" fontWeight="bold">IN PROGRESS</text>
        <rect x="274" y="186" width="42" height="18" rx="2" fill="#FFFFFF" stroke="#FDE68A" strokeWidth="0.8" />
        <rect x="277" y="190" width="32" height="2.5" rx="1" fill="#D97706" />
        <rect x="277" y="195" width="20" height="2" rx="0.8" fill="#FBBF24" />

        {/* Col 3: Done */}
        <rect x="326" y="174" width="48" height="84" rx="3" fill="#DCFCE7" />
        <text x="330" y="182" fill="#15803D" fontSize="6" fontWeight="bold">DONE ✓</text>
        <rect x="329" y="186" width="42" height="14" rx="2" fill="#FFFFFF" stroke="#A7F3D0" strokeWidth="0.8" />
        <path d="M333 192L335 194L339 190" stroke="#059669" strokeWidth="1" strokeLinecap="round" />
        <rect x="342" y="191" width="24" height="2" rx="0.8" fill="#059669" />

        {/* Laptop Keyboard Base & Trackpad */}
        <path
          d="M175 272L205 272H385L415 272L428 290H162L175 272Z"
          fill="#4A3469"
          stroke="#2A1B3F"
          strokeWidth="2"
        />
        {/* Trackpad */}
        <rect x="275" y="278" width="40" height="9" rx="1.5" fill="#36224E" stroke="#5F4484" strokeWidth="1" />
      </g>

      {/* ── Retro Purple Cassette Walkman on Desk ─────────────────────── */}
      <g id="cassette-walkman">
        {/* Chassis */}
        <rect
          x="75"
          y="298"
          width="95"
          height="62"
          rx="10"
          fill="url(#cassetteBody)"
          stroke="#432369"
          strokeWidth="2.5"
          filter="drop-shadow(4px 4px 0 rgba(43,23,72,0.45))"
        />
        {/* Cassette Label Tape */}
        <rect x="85" y="306" width="75" height="34" rx="4" fill="#FFF5FC" stroke="#432369" strokeWidth="1.5" />
        <rect x="92" y="312" width="61" height="15" rx="3" fill="#F0B0D7" stroke="#432369" strokeWidth="1.2" />

        {/* Left Reel */}
        <circle cx="104" cy="319.5" r="5" fill="#D8B9FF" stroke="#432369" strokeWidth="1.2" />
        <circle cx="104" cy="319.5" r="2" fill="#432369" />
        {/* Right Reel */}
        <circle cx="141" cy="319.5" r="5" fill="#D8B9FF" stroke="#432369" strokeWidth="1.2" />
        <circle cx="141" cy="319.5" r="2" fill="#432369" />
        {/* Tape Ribbon Window */}
        <rect x="114" y="317" width="17" height="5" rx="1" fill="#432369" />

        {/* Label Text */}
        <text x="95" y="337" fill="#6B3CA8" fontSize="6" fontWeight="bold" fontFamily="monospace">SIDE A · RETZLO</text>

        {/* Mechanical Buttons on Side */}
        <rect x="68" y="306" width="7" height="6" rx="1.5" fill="#FFECB1" stroke="#432369" strokeWidth="1.2" />
        <rect x="68" y="315" width="7" height="6" rx="1.5" fill="#FFECB1" stroke="#432369" strokeWidth="1.2" />
        <rect x="68" y="324" width="7" height="6" rx="1.5" fill="#FFB4D5" stroke="#432369" strokeWidth="1.2" />

        {/* Headphone Cord winding from Walkman to Laptop */}
        <path
          d="M170 325C200 335 180 370 215 355C240 345 220 310 245 295C255 288 260 282 265 275"
          stroke="#432369"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </g>

      {/* ── Steaming Drip Coffee Mug ──────────────────────────────────── */}
      <g id="coffee">
        {/* Coaster */}
        <ellipse cx="445" cy="342" rx="18" ry="6" fill="#854D0E" stroke="#3F1D06" strokeWidth="1.5" />
        {/* Mug Body */}
        <rect x="432" y="305" width="26" height="32" rx="4" fill="#FFFBEB" stroke="#432369" strokeWidth="2" />
        <path d="M458 312C465 312 467 326 458 327" stroke="#432369" strokeWidth="2" fill="none" strokeLinecap="round" />
        <rect x="437" y="312" width="16" height="18" rx="2" fill="#D8B9FF" fillOpacity="0.4" />
        {/* Heart sticker on mug */}
        <path d="M445 320C443 318 441 320 441 322C441 324 445 326 445 326C445 326 449 324 449 322C449 320 447 318 445 320Z" fill="#F43F5E" />
        {/* Gentle Heart Steam Wisp */}
        <path
          d="M442 298C440 290 448 285 444 275M448 298C452 288 446 283 450 273"
          stroke="#FFD1E8"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="2 2"
        />
      </g>

      {/* ── Desk Plants (Potted Succulent & Sakura Twig) ─────────────── */}
      <g id="plants">
        {/* Terracotta Pot */}
        <path d="M575 272L580 305H610L615 272H575Z" fill="#C2410C" stroke="#432369" strokeWidth="2" />
        <rect x="572" y="268" width="46" height="5" rx="2" fill="#EA580C" stroke="#432369" strokeWidth="1.8" />
        {/* Potted Plant Leaves */}
        <ellipse cx="583" cy="255" rx="8" ry="14" fill="#34D399" stroke="#065F46" strokeWidth="1.5" transform="rotate(-25 583 255)" />
        <ellipse cx="607" cy="255" rx="8" ry="14" fill="#10B981" stroke="#065F46" strokeWidth="1.5" transform="rotate(25 607 255)" />
        <ellipse cx="595" cy="245" rx="9" ry="16" fill="#6EE7B7" stroke="#065F46" strokeWidth="1.5" />
      </g>

      {/* ── Buttercream Sticky Notes on Desk ─────────────────────────── */}
      <g id="stickies">
        <rect
          x="120"
          y="368"
          width="36"
          height="34"
          rx="3"
          fill="#FFECB1"
          stroke="#432369"
          strokeWidth="1.5"
          transform="rotate(6 120 368)"
          filter="drop-shadow(2px 2px 0 rgba(67,35,105,0.25))"
        />
        <line x1="124" y1="375" x2="148" y2="378" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="124" y1="382" x2="145" y2="385" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="124" y1="389" x2="138" y2="392" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />

        {/* Mint Todo check sticky */}
        <rect
          x="165"
          y="366"
          width="32"
          height="32"
          rx="3"
          fill="#A7F3D0"
          stroke="#432369"
          strokeWidth="1.5"
          transform="rotate(-4 165 366)"
          filter="drop-shadow(2px 2px 0 rgba(67,35,105,0.25))"
        />
        <path d="M172 376L175 379L182 372" stroke="#047857" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="172" y1="386" x2="190" y2="386" stroke="#047857" strokeWidth="1.4" strokeLinecap="round" />
      </g>

      {/* ── Studio Badge Floating Ribbon ────────────────────────────── */}
      <g id="badge">
        <rect x="20" y="385" width="85" height="24" rx="6" fill="#3B1D61" stroke="#D8B9FF" strokeWidth="1.5" />
        <text x="28" y="401" fill="#FFECB1" fontSize="9" fontWeight="900" fontFamily="monospace">RETZLO LOFI</text>
      </g>
    </svg>
  );
}
