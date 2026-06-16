import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface StickerIconProps {
  className?: string;
}

type StickerIcon = (props: StickerIconProps) => JSX.Element;

const stroke = "#8f6f6a";
const ink = "#6f5a66";
const cream = "#fff7ed";
const lavender = "#eee9ff";
const rose = "#ffc2ca";
const amber = "#ffd978";
const cyan = "#aee7ef";
const mint = "#bdebd7";
const peach = "#ffd1a8";

function StickerShell({ children, className, fill = cream }: StickerIconProps & { children: ReactNode; fill?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("h-8 w-8 shrink-0", className)}
      fill="none"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect fill="rgba(255,255,255,0.82)" height="41" rx="11" width="41" x="3.5" y="3.5" />
      <rect fill={fill} height="34" rx="9" width="34" x="7" y="7" />
      {children}
    </svg>
  );
}

function FoodIcon({ className }: StickerIconProps) {
  return (
    <StickerShell className={className} fill="#fff3c7">
      <path d="M17 15v17M14 15v7c0 2 1.2 3.4 3 3.4s3-1.4 3-3.4v-7M29 15c3 3.8 3.2 8.4.6 10.8V32" stroke={stroke} strokeLinecap="round" strokeWidth="2.4" />
      <path d="M28 15v17" stroke={stroke} strokeLinecap="round" strokeWidth="2.4" />
    </StickerShell>
  );
}

function CarIcon({ className }: StickerIconProps) {
  return (
    <StickerShell className={className} fill="#d9f3fb">
      <path d="M14 27h20l-2.4-7.2A4 4 0 0 0 27.8 17h-7.6a4 4 0 0 0-3.8 2.8L14 27Z" fill={cyan} stroke={stroke} strokeLinejoin="round" strokeWidth="2.3" />
      <path d="M12 27h24v5H12v-5Z" fill="#fef3c7" stroke={stroke} strokeLinejoin="round" strokeWidth="2.3" />
      <circle cx="18" cy="33" fill="#fff" r="2.4" stroke={stroke} strokeWidth="2" />
      <circle cx="30" cy="33" fill="#fff" r="2.4" stroke={stroke} strokeWidth="2" />
    </StickerShell>
  );
}

function SalaryIcon({ className }: StickerIconProps) {
  return (
    <StickerShell className={className} fill="#dcfce7">
      <rect fill={mint} height="16" rx="4" stroke={stroke} strokeWidth="2.3" width="24" x="12" y="19" />
      <path d="M19 19v-3.2c0-1 1-1.8 2-1.8h6c1.1 0 2 .8 2 1.8V19" stroke={stroke} strokeWidth="2.3" />
      <path d="M18 27h12M24 23v8" stroke={ink} strokeLinecap="round" strokeWidth="2" />
    </StickerShell>
  );
}

function HealthIcon({ className }: StickerIconProps) {
  return (
    <StickerShell className={className} fill="#ffe4e6">
      <path d="M24 35s-11-6.4-11-14.1c0-3.6 2.5-6.4 6-6.4 2 0 3.8 1 5 2.7 1.2-1.7 3-2.7 5-2.7 3.5 0 6 2.8 6 6.4C35 28.6 24 35 24 35Z" fill={rose} stroke={stroke} strokeLinejoin="round" strokeWidth="2.3" />
      <path d="M19 24h3l1.6-3.5 2.3 7 1.6-3.5H31" stroke="#fff7ed" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
    </StickerShell>
  );
}

function HomeIcon({ className }: StickerIconProps) {
  return (
    <StickerShell className={className} fill="#f1e9ff">
      <path d="M13 25 24 15l11 10" fill={lavender} stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
      <path d="M16 24v11h16V24" fill="#fff7ed" stroke={stroke} strokeLinejoin="round" strokeWidth="2.5" />
      <path d="M22 35v-7h5v7" stroke={stroke} strokeLinejoin="round" strokeWidth="2.2" />
    </StickerShell>
  );
}

function BotIcon({ className }: StickerIconProps) {
  return (
    <StickerShell className={className} fill="#eee9ff">
      <rect fill={lavender} height="17" rx="5" stroke={stroke} strokeWidth="2.3" width="24" x="12" y="18" />
      <path d="M24 18v-4M20 14h8" stroke={stroke} strokeLinecap="round" strokeWidth="2.3" />
      <circle cx="19" cy="26" fill={cyan} r="2" />
      <circle cx="29" cy="26" fill={cyan} r="2" />
      <path d="M20 31h8" stroke={ink} strokeLinecap="round" strokeWidth="2" />
    </StickerShell>
  );
}

function RepeatIcon({ className }: StickerIconProps) {
  return (
    <StickerShell className={className} fill="#fff3c7">
      <path d="M16 19h13c3 0 5 2 5 5 0 1.8-.8 3.4-2.1 4.3" stroke={stroke} strokeLinecap="round" strokeWidth="2.5" />
      <path d="m20 15-4 4 4 4M32 29H19c-3 0-5-2-5-5 0-1.8.8-3.4 2.1-4.3" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
      <path d="m28 33 4-4-4-4" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
    </StickerShell>
  );
}

function DropletsIcon({ className }: StickerIconProps) {
  return (
    <StickerShell className={className} fill="#d9f3fb">
      <path d="M23 13s-7 7.2-7 12.6a7 7 0 0 0 14 0C30 20.2 23 13 23 13Z" fill={cyan} stroke={stroke} strokeLinejoin="round" strokeWidth="2.3" />
      <path d="M32 26s-3.6 3.8-3.6 6.4a3.6 3.6 0 0 0 7.2 0C35.6 29.8 32 26 32 26Z" fill="#c7f7e2" stroke={stroke} strokeLinejoin="round" strokeWidth="2" />
      <path d="M20 28c1.2 1.4 3.2 1.8 5 .8" stroke="#fff" strokeLinecap="round" strokeWidth="2" />
    </StickerShell>
  );
}

function PetIcon({ className }: StickerIconProps) {
  return (
    <StickerShell className={className} fill="#ecfdf5">
      <circle cx="18" cy="19" fill={peach} r="3" stroke={stroke} strokeWidth="2" />
      <circle cx="30" cy="19" fill={peach} r="3" stroke={stroke} strokeWidth="2" />
      <circle cx="15" cy="27" fill={peach} r="3" stroke={stroke} strokeWidth="2" />
      <circle cx="33" cy="27" fill={peach} r="3" stroke={stroke} strokeWidth="2" />
      <path d="M18 33c0-4 2.6-7 6-7s6 3 6 7c0 2.4-2 3.8-6 3.8s-6-1.4-6-3.8Z" fill="#ffd1a8" stroke={stroke} strokeLinejoin="round" strokeWidth="2.2" />
    </StickerShell>
  );
}

function FilmIcon({ className }: StickerIconProps) {
  return (
    <StickerShell className={className} fill="#f1e9ff">
      <rect fill={lavender} height="19" rx="4" stroke={stroke} strokeWidth="2.3" width="24" x="12" y="16" />
      <path d="M17 16v19M31 16v19M12 22h24M12 29h24" stroke={stroke} strokeWidth="1.9" />
      <path d="m22 22 6 4-6 4v-8Z" fill={rose} stroke={stroke} strokeLinejoin="round" strokeWidth="1.8" />
    </StickerShell>
  );
}

function BankIcon({ className }: StickerIconProps) {
  return (
    <StickerShell className={className} fill="#e0f2fe">
      <path d="M13 21 24 14l11 7H13Z" fill={cyan} stroke={stroke} strokeLinejoin="round" strokeWidth="2.3" />
      <path d="M16 22v10M22 22v10M28 22v10M34 22v10M14 34h22" stroke={stroke} strokeLinecap="round" strokeWidth="2.3" />
    </StickerShell>
  );
}

function CashIcon({ className }: StickerIconProps) {
  return (
    <StickerShell className={className} fill="#dcfce7">
      <rect fill={mint} height="18" rx="4" stroke={stroke} strokeWidth="2.3" width="26" x="11" y="16" />
      <circle cx="24" cy="25" fill={cream} r="4" stroke={stroke} strokeWidth="2" />
      <path d="M15 21h4M29 29h4" stroke={stroke} strokeLinecap="round" strokeWidth="2" />
    </StickerShell>
  );
}

function SparklesIcon({ className }: StickerIconProps) {
  return (
    <StickerShell className={className} fill="#fff7d6">
      <path d="M24 13 27 21l8 3-8 3-3 8-3-8-8-3 8-3 3-8Z" fill={amber} stroke={stroke} strokeLinejoin="round" strokeWidth="2.2" />
      <path d="M34 13 35.4 17l3.6 1.4-3.6 1.4L34 24l-1.4-4.2-3.6-1.4 3.6-1.4L34 13Z" fill="#ffd1dc" stroke={stroke} strokeLinejoin="round" strokeWidth="1.8" />
    </StickerShell>
  );
}

function MusicIcon({ className }: StickerIconProps) {
  return (
    <StickerShell className={className} fill="#f1e9ff">
      <path d="M20 16v16a4 4 0 1 1-2.8-3.8" stroke={stroke} strokeLinecap="round" strokeWidth="2.5" />
      <path d="M20 16h12v12a4 4 0 1 1-2.8-3.8V16" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
      <path d="M20 20h12" stroke={rose} strokeLinecap="round" strokeWidth="2.3" />
    </StickerShell>
  );
}

function CreditCardIcon({ className }: StickerIconProps) {
  return (
    <StickerShell className={className} fill="#ffe4f1">
      <rect fill="#ffd1dc" height="20" rx="4" stroke={stroke} strokeWidth="2.3" width="28" x="10" y="15" />
      <path d="M10 22h28M16 29h7" stroke={stroke} strokeLinecap="round" strokeWidth="2" />
      <rect fill={cream} height="4" rx="1" width="6" x="28" y="27" />
    </StickerShell>
  );
}

function WalletIcon({ className }: StickerIconProps) {
  return (
    <StickerShell className={className} fill="#e0f2fe">
      <path d="M13 18h20a4 4 0 0 1 4 4v11H13a4 4 0 0 1-4-4v-7a4 4 0 0 1 4-4Z" fill={cyan} stroke={stroke} strokeLinejoin="round" strokeWidth="2.3" />
      <path d="M14 18v-3h17v3" stroke={stroke} strokeLinejoin="round" strokeWidth="2.2" />
      <path d="M29 26h8v6h-8a3 3 0 0 1 0-6Z" fill={cream} stroke={stroke} strokeLinejoin="round" strokeWidth="2" />
      <circle cx="31" cy="29" fill={rose} r="1.5" />
    </StickerShell>
  );
}

function CircleIcon({ className }: StickerIconProps) {
  return (
    <StickerShell className={className} fill="#f3f4f6">
      <circle cx="24" cy="24" fill={lavender} r="10" stroke={stroke} strokeWidth="2.3" />
      <path d="M20 24h8M24 20v8" stroke={ink} strokeLinecap="round" strokeWidth="2" />
    </StickerShell>
  );
}

export const financeStickerIcons = {
  ai: BotIcon,
  bank: BankIcon,
  bot: BotIcon,
  briefcase: SalaryIcon,
  car: CarIcon,
  cash: CashIcon,
  circle: CircleIcon,
  "credit-card": CreditCardIcon,
  droplets: DropletsIcon,
  film: FilmIcon,
  health: HealthIcon,
  heart: HealthIcon,
  home: HomeIcon,
  music: MusicIcon,
  paw: PetIcon,
  plus: CircleIcon,
  repeat: RepeatIcon,
  sparkles: SparklesIcon,
  utensils: FoodIcon,
  wallet: WalletIcon
} satisfies Record<string, StickerIcon>;

export function FinanceStickerIcon({
  className,
  iconKey
}: StickerIconProps & {
  iconKey: keyof typeof financeStickerIcons;
}) {
  const Icon = financeStickerIcons[iconKey] ?? financeStickerIcons.circle;
  return <Icon className={className} />;
}
