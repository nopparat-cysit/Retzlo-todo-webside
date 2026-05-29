import type { Metadata } from "next";

import { CursorAura } from "@/components/ui/cursor-aura";

import "./globals.css";

export const metadata: Metadata = {
  title: "RETROD",
  description: "A quiet project workspace for boards, due dates, and the work you keep returning to."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <CursorAura />
        {children}
      </body>
    </html>
  );
}
