import type { Metadata } from "next";

import { CursorAura } from "@/components/ui/cursor-aura";
import { ToastProvider } from "@/components/ui/toast";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Retzlo - Retro-Lofi Work & Life Management",
    template: "%s | Retzlo"
  },
  description: "A quiet retro-lofi workspace for boards, due dates, notes, and the work you keep returning to.",
  metadataBase: new URL(process.env.NEXTAUTH_URL || "https://retzlo-todo-webside.vercel.app"),
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
