import { Circle } from "lucide-react";

import { financeStickerIcons } from "@/components/finance/finance-sticker-icons";
import { cn } from "@/lib/utils";

const fallbackIconMap = {
  circle: Circle
};

const nameIconMap: Record<string, keyof typeof financeStickerIcons> = {
  ai: "ai",
  bank: "bank",
  cash: "cash",
  "credit card": "credit-card",
  entertainment: "film",
  food: "utensils",
  freelance: "sparkles",
  health: "health",
  internet: "droplets",
  other: "circle",
  pet: "paw",
  rent: "home",
  salary: "briefcase",
  software: "sparkles",
  subscription: "repeat",
  transport: "car",
  wallet: "wallet",
  water: "droplets"
};

interface FinanceCategoryIconProps {
  icon?: string | null;
  label?: string | null;
  className?: string;
}

export function FinanceCategoryIcon({ className, icon, label }: FinanceCategoryIconProps) {
  const key = (icon?.toLowerCase() ?? nameIconMap[label?.toLowerCase() ?? ""] ?? "circle") as keyof typeof financeStickerIcons;
  const StickerIcon = financeStickerIcons[key];

  if (StickerIcon) {
    return <StickerIcon className={cn("h-8 w-8", className)} />;
  }

  const Icon = fallbackIconMap.circle;
  return <Icon className={cn("h-4 w-4", className)} />;
}
