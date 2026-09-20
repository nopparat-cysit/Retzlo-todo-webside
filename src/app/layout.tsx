import type { Metadata } from "next";

import { CursorAura } from "@/components/ui/cursor-aura";
import { ToastProvider } from "@/components/ui/toast";

import "./globals.css";

function getMetadataBase(): URL {
  const raw = process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://retzlo-todo-webside.vercel.app");
  try {
    const formatted = raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`;
    return new URL(formatted);
  } catch {
    return new URL("https://retzlo-todo-webside.vercel.app");
  }
}

export const metadata: Metadata = {
  title: {
    default: "Retzlo - Retro-Lofi Work & Life Management",
    template: "%s | Retzlo"
  },
  description: "A quiet retro-lofi workspace for boards, due dates, notes, and the work you keep returning to.",
  metadataBase: getMetadataBase(),
  openGraph: {
    title: "Retzlo - Retro-Lofi Work & Life Management",
    description: "A quiet retro-lofi workspace for boards, due dates, notes, and the work you keep returning to.",
    url: "https://retzlo-todo-webside.vercel.app",
    siteName: "Retzlo",
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Retzlo - Retro-Lofi Work & Life Management",
    description: "A quiet retro-lofi workspace for boards, due dates, notes, and the work you keep returning to."
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <CursorAura />
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
