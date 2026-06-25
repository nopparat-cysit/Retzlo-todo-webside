import type { Metadata } from "next";

import { CursorAura } from "@/components/ui/cursor-aura";
import { ToastProvider } from "@/components/ui/toast";

import "./globals.css";

export const metadata: Metadata = {
  title: "Retzlo",
  description: "A quiet project workspace for boards, due dates, and the work you keep returning to."
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
